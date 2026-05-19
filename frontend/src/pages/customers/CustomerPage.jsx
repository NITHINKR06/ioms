import { useState, useEffect, useCallback } from 'react'
import { customerApi } from '../../api/axiosConfig'
import toast from 'react-hot-toast'
import { Plus, Edit, Trash2, X, Search } from 'lucide-react'

function CustomerModal({ customer, onClose, onSaved }) {
  const [form, setForm] = useState(customer || { name:'', email:'', phone:'', address:'', type:'RETAIL' })
  const [saving, setSaving] = useState(false)
  const submit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      customer ? await customerApi.update(customer.id, form) : await customerApi.create(form)
      toast.success(customer ? 'Customer updated!' : 'Customer created!'); onSaved()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
    finally { setSaving(false) }
  }
  const f = (k,v) => setForm(p=>({...p,[k]:v}))
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{customer ? 'Edit Customer' : 'Add Customer'}</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18}/></button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group"><label className="form-label">Name *</label><input className="form-input" value={form.name} onChange={e=>f('name',e.target.value)} required/></div>
              <div className="form-group"><label className="form-label">Type</label>
                <select className="form-select" value={form.type} onChange={e=>f('type',e.target.value)}>
                  <option value="RETAIL">Retail</option><option value="WHOLESALE">Wholesale</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email||''} onChange={e=>f('email',e.target.value)}/></div>
              <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone||''} onChange={e=>f('phone',e.target.value)}/></div>
            </div>
            <div className="form-group"><label className="form-label">Address</label><textarea className="form-textarea" rows={2} value={form.address||''} onChange={e=>f('address',e.target.value)}/></div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving?<><div className="spinner"/> Saving...</>:(customer?'Update':'Create')}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CustomerPage() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [modal, setModal] = useState(null)
  const [delConfirm, setDelConfirm] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await customerApi.getAll({ search: search||undefined, page, size:15 })
      const d = res.data.data
      setCustomers(d.content); setTotalPages(d.totalPages); setTotalElements(d.totalElements)
    } catch { toast.error('Failed to load') }
    finally { setLoading(false) }
  }, [search, page])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id) => {
    try { await customerApi.delete(id); toast.success('Deleted'); load() }
    catch { toast.error('Failed to delete') }
    setDelConfirm(null)
  }

  return (
    <div>
      <div className="page-header">
        <div><h1>Customers</h1><p className="text-secondary">{totalElements} customers</p></div>
        <button className="btn btn-primary" onClick={() => setModal('create')}><Plus size={16}/> Add Customer</button>
      </div>
      <div className="filter-bar">
        <div className="search-bar">
          <Search size={16} className="search-icon"/>
          <input className="form-input" placeholder="Search customers..." value={search} onChange={e=>{ setSearch(e.target.value); setPage(0) }}/>
        </div>
      </div>
      <div className="card">
        <div className="table-container">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Type</th><th>Address</th><th>Actions</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={6} style={{textAlign:'center',padding:40,color:'var(--text-secondary)'}}>Loading...</td></tr>
              : customers.length === 0 ? <tr><td colSpan={6}><div className="empty-state"><div className="empty-icon">👥</div><div className="empty-title">No customers found</div></div></td></tr>
              : customers.map(c => (
                <tr key={c.id}>
                  <td style={{fontWeight:500}}>{c.name}</td>
                  <td style={{color:'var(--text-secondary)',fontSize:13}}>{c.email||'—'}</td>
                  <td style={{color:'var(--text-secondary)',fontSize:13}}>{c.phone||'—'}</td>
                  <td><span className={`badge ${c.type==='WHOLESALE'?'badge-purple':'badge-info'}`}>{c.type}</span></td>
                  <td style={{color:'var(--text-secondary)',fontSize:12,maxWidth:180,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.address||'—'}</td>
                  <td>
                    <div style={{display:'flex',gap:4}}>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={()=>setModal(c)}><Edit size={15}/></button>
                      <button className="btn btn-danger btn-icon btn-sm" onClick={()=>setDelConfirm(c)}><Trash2 size={15}/></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="pagination">
            <button className="page-btn" onClick={()=>setPage(p=>Math.max(0,p-1))} disabled={page===0}>←</button>
            {[...Array(Math.min(totalPages,7))].map((_,i)=><button key={i} className={`page-btn ${i===page?'active':''}`} onClick={()=>setPage(i)}>{i+1}</button>)}
            <button className="page-btn" onClick={()=>setPage(p=>Math.min(totalPages-1,p+1))} disabled={page===totalPages-1}>→</button>
            <span className="page-info">Page {page+1} of {totalPages}</span>
          </div>
        )}
      </div>
      {(modal==='create'||(modal&&modal!=='create')) && <CustomerModal customer={modal==='create'?null:modal} onClose={()=>setModal(null)} onSaved={()=>{setModal(null);load()}}/>}
      {delConfirm && (
        <div className="modal-overlay"><div className="modal" style={{maxWidth:400}}>
          <div className="modal-header"><span className="modal-title">Delete Customer</span></div>
          <div className="modal-body"><p style={{color:'var(--text-secondary)'}}>Delete <strong style={{color:'var(--text-primary)'}}>{delConfirm.name}</strong>?</p></div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={()=>setDelConfirm(null)}>Cancel</button>
            <button className="btn btn-danger" onClick={()=>handleDelete(delConfirm.id)}>Delete</button>
          </div>
        </div></div>
      )}
    </div>
  )
}

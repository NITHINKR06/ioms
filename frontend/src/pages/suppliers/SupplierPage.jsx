import { useState, useEffect, useCallback } from 'react'
import { supplierApi } from '../../api/axiosConfig'
import toast from 'react-hot-toast'
import { Plus, Edit, Trash2, X } from 'lucide-react'

function SupplierModal({ supplier, onClose, onSaved }) {
  const [form, setForm] = useState(supplier || { name:'', contactPerson:'', email:'', phone:'', address:'', status:'ACTIVE' })
  const [saving, setSaving] = useState(false)
  const submit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      supplier ? await supplierApi.update(supplier.id, form) : await supplierApi.create(form)
      toast.success(supplier ? 'Supplier updated!' : 'Supplier created!'); onSaved()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
    finally { setSaving(false) }
  }
  const f = (k,v) => setForm(p=>({...p,[k]:v}))
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{supplier ? 'Edit Supplier' : 'Add Supplier'}</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18}/></button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group"><label className="form-label">Company Name *</label><input className="form-input" value={form.name} onChange={e=>f('name',e.target.value)} required/></div>
              <div className="form-group"><label className="form-label">Contact Person</label><input className="form-input" value={form.contactPerson||''} onChange={e=>f('contactPerson',e.target.value)}/></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email||''} onChange={e=>f('email',e.target.value)}/></div>
              <div className="form-group"><label className="form-label">Phone</label><input className="form-input" value={form.phone||''} onChange={e=>f('phone',e.target.value)}/></div>
            </div>
            <div className="form-group"><label className="form-label">Address</label><textarea className="form-textarea" rows={2} value={form.address||''} onChange={e=>f('address',e.target.value)}/></div>
            <div className="form-group"><label className="form-label">Status</label>
              <select className="form-select" value={form.status} onChange={e=>f('status',e.target.value)}>
                <option value="ACTIVE">Active</option><option value="INACTIVE">Inactive</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving?<><div className="spinner"/> Saving...</>:(supplier?'Update':'Create')}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function SupplierPage() {
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [modal, setModal] = useState(null)
  const [delConfirm, setDelConfirm] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await supplierApi.getAll({ page, size:15 })
      const d = res.data.data
      setSuppliers(d.content); setTotalPages(d.totalPages); setTotalElements(d.totalElements)
    } catch { toast.error('Failed to load suppliers') }
    finally { setLoading(false) }
  }, [page])

  useEffect(() => { load() }, [load])

  const handleDelete = async (id) => {
    try { await supplierApi.delete(id); toast.success('Deleted'); load() }
    catch { toast.error('Failed to delete') }
    setDelConfirm(null)
  }

  return (
    <div>
      <div className="page-header">
        <div><h1>Suppliers</h1><p className="text-secondary">{totalElements} suppliers</p></div>
        <button className="btn btn-primary" onClick={() => setModal('create')}><Plus size={16}/> Add Supplier</button>
      </div>
      <div className="card">
        <div className="table-container">
          <table>
            <thead><tr><th>Company</th><th>Contact</th><th>Email</th><th>Phone</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={6} style={{textAlign:'center',padding:40,color:'var(--text-secondary)'}}>Loading...</td></tr>
              : suppliers.length === 0 ? <tr><td colSpan={6}><div className="empty-state"><div className="empty-icon">🚚</div><div className="empty-title">No suppliers yet</div></div></td></tr>
              : suppliers.map(s => (
                <tr key={s.id}>
                  <td style={{fontWeight:500}}>{s.name}</td>
                  <td style={{color:'var(--text-secondary)',fontSize:13}}>{s.contactPerson||'—'}</td>
                  <td style={{color:'var(--text-secondary)',fontSize:13}}>{s.email||'—'}</td>
                  <td style={{color:'var(--text-secondary)',fontSize:13}}>{s.phone||'—'}</td>
                  <td><span className={`badge ${s.status==='ACTIVE'?'badge-success':'badge-danger'}`}>{s.status}</span></td>
                  <td>
                    <div style={{display:'flex',gap:4}}>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={()=>setModal(s)}><Edit size={15}/></button>
                      <button className="btn btn-danger btn-icon btn-sm" onClick={()=>setDelConfirm(s)}><Trash2 size={15}/></button>
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
      {(modal==='create'||(modal&&modal!=='create')) && <SupplierModal supplier={modal==='create'?null:modal} onClose={()=>setModal(null)} onSaved={()=>{setModal(null);load()}}/>}
      {delConfirm && (
        <div className="modal-overlay"><div className="modal" style={{maxWidth:400}}>
          <div className="modal-header"><span className="modal-title">Delete Supplier</span></div>
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

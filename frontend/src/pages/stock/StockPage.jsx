import { useState, useEffect, useCallback } from 'react'
import { stockApi, productApi } from '../../api/axiosConfig'
import toast from 'react-hot-toast'
import { Plus, X, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const typeStyle = {
  STOCK_IN:  { badge:'badge-success', icon: TrendingUp },
  STOCK_OUT: { badge:'badge-danger',  icon: TrendingDown },
  ADJUSTMENT:{ badge:'badge-warning', icon: RefreshCw },
  RETURN:    { badge:'badge-info',    icon: TrendingUp },
}

function RecordModal({ onClose, onSaved }) {
  const [products, setProducts] = useState([])
  const [form, setForm] = useState({ productId:'', type:'STOCK_IN', quantity:1, notes:'', referenceNo:'' })
  const [saving, setSaving] = useState(false)
  const [selected, setSelected] = useState(null)

  useEffect(() => { productApi.getAll({ status:'ACTIVE', size:200 }).then(r => setProducts(r.data.data?.content||[])) }, [])

  const onProductChange = (id) => {
    setForm(f => ({...f, productId: id}))
    setSelected(products.find(p => String(p.id) === String(id)) || null)
  }

  const submit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      await stockApi.record({ ...form, productId: parseInt(form.productId), quantity: parseInt(form.quantity) })
      toast.success('Stock recorded!'); onSaved()
    } catch (err) { toast.error(err.response?.data?.message || 'Error recording stock') }
    finally { setSaving(false) }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Record Stock Movement</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18}/></button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Product *</label>
              <select className="form-select" value={form.productId} onChange={e => onProductChange(e.target.value)} required>
                <option value="">Select product</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} — Stock: {p.quantityInStock}</option>)}
              </select>
            </div>
            {selected && (
              <div style={{ padding:'10px 14px', background:'var(--bg-tertiary)', borderRadius:'var(--radius)', marginBottom:16, fontSize:13 }}>
                <span style={{ color:'var(--text-secondary)' }}>Current stock: </span>
                <strong style={{ color: selected.lowStock ? 'var(--warning)' : 'var(--success)' }}>{selected.quantityInStock} units</strong>
                <span style={{ color:'var(--text-muted)', marginLeft:8 }}>Reorder at: {selected.reorderLevel}</span>
              </div>
            )}
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Movement Type *</label>
                <select className="form-select" value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}>
                  <option value="STOCK_IN">Stock In</option>
                  <option value="STOCK_OUT">Stock Out</option>
                  <option value="ADJUSTMENT">Adjustment (set absolute)</option>
                  <option value="RETURN">Return</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Quantity *</label>
                <input className="form-input" type="number" min="1" value={form.quantity}
                  onChange={e=>setForm(f=>({...f,quantity:e.target.value}))} required />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Reference No.</label>
              <input className="form-input" placeholder="e.g. PO-001, ORD-2026..." value={form.referenceNo}
                onChange={e=>setForm(f=>({...f,referenceNo:e.target.value}))} />
            </div>
            <div className="form-group">
              <label className="form-label">Notes</label>
              <textarea className="form-textarea" rows={2} value={form.notes}
                onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Reason for this movement..." />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><div className="spinner"/> Saving...</> : 'Record Movement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function StockPage() {
  const { isManager } = useAuth()
  const [movements, setMovements] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [showModal, setShowModal] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await stockApi.getAll({ page, size:20 })
      const d = res.data.data
      setMovements(d.content); setTotalPages(d.totalPages); setTotalElements(d.totalElements)
    } catch { toast.error('Failed to load movements') }
    finally { setLoading(false) }
  }, [page])

  useEffect(() => { load() }, [load])

  return (
    <div>
      <div className="page-header">
        <div><h1>Stock Movements</h1><p className="text-secondary">{totalElements} total records</p></div>
        {isManager() && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}><Plus size={16}/> Record Movement</button>
        )}
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Product</th><th>Type</th><th>Qty</th><th>Before</th><th>After</th><th>Reference</th><th>By</th><th>Date</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign:'center', padding:40, color:'var(--text-secondary)' }}>Loading...</td></tr>
              ) : movements.length === 0 ? (
                <tr><td colSpan={8}><div className="empty-state"><div className="empty-icon">📊</div><div className="empty-title">No stock movements</div></div></td></tr>
              ) : movements.map(m => {
                const ts = typeStyle[m.type] || { badge:'badge-gray' }
                const Icon = ts.icon
                return (
                  <tr key={m.id}>
                    <td>
                      <div style={{ fontWeight:500 }}>{m.productName}</div>
                      <div style={{ fontSize:11, color:'var(--text-muted)' }}>{m.productSku}</div>
                    </td>
                    <td>
                      <span className={`badge ${ts.badge}`} style={{ display:'inline-flex', alignItems:'center', gap:4 }}>
                        {Icon && <Icon size={11}/>} {m.type.replace('_',' ')}
                      </span>
                    </td>
                    <td style={{ fontWeight:600 }}>{m.quantity}</td>
                    <td style={{ color:'var(--text-secondary)' }}>{m.quantityBefore}</td>
                    <td style={{ fontWeight:500, color: m.quantityAfter <= 10 ? 'var(--warning)' : 'var(--success)' }}>{m.quantityAfter}</td>
                    <td style={{ fontSize:12, color:'var(--text-secondary)' }}>{m.referenceNo || '—'}</td>
                    <td style={{ fontSize:12, color:'var(--text-secondary)' }}>{m.createdBy}</td>
                    <td style={{ fontSize:12, color:'var(--text-secondary)' }}>{new Date(m.createdAt).toLocaleString('en-IN', { dateStyle:'short', timeStyle:'short' })}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="pagination">
            <button className="page-btn" onClick={() => setPage(p=>Math.max(0,p-1))} disabled={page===0}>←</button>
            {[...Array(Math.min(totalPages,7))].map((_,i) => (
              <button key={i} className={`page-btn ${i===page?'active':''}`} onClick={() => setPage(i)}>{i+1}</button>
            ))}
            <button className="page-btn" onClick={() => setPage(p=>Math.min(totalPages-1,p+1))} disabled={page===totalPages-1}>→</button>
            <span className="page-info">Page {page+1} of {totalPages}</span>
          </div>
        )}
      </div>

      {showModal && <RecordModal onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); load() }} />}
    </div>
  )
}

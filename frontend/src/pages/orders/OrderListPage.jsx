import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { orderApi, customerApi, productApi } from '../../api/axiosConfig'
import toast from 'react-hot-toast'
import { Plus, Search, Eye, X, ChevronDown } from 'lucide-react'

const statusBadge = {
  PENDING:'badge-warning', CONFIRMED:'badge-info', PROCESSING:'badge-purple',
  SHIPPED:'badge-teal', DELIVERED:'badge-success', CANCELLED:'badge-danger'
}
const payBadge = { UNPAID:'badge-danger', PAID:'badge-success', PARTIAL:'badge-warning', REFUNDED:'badge-gray' }

function CreateOrderModal({ onClose, onSaved }) {
  const [customers, setCustomers] = useState([])
  const [products, setProducts] = useState([])
  const [form, setForm] = useState({ customerId:'', paymentMethod:'CASH', shippingAddress:'', notes:'', discount:'0', items:[] })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    customerApi.getAll({ size:100 }).then(r => setCustomers(r.data.data?.content || []))
    productApi.getAll({ status:'ACTIVE', size:100 }).then(r => setProducts(r.data.data?.content || []))
  }, [])

  const addItem = () => setForm(f => ({ ...f, items:[...f.items, { productId:'', quantity:1 }] }))
  const removeItem = (i) => setForm(f => ({ ...f, items: f.items.filter((_,idx) => idx!==i) }))
  const updateItem = (i, k, v) => setForm(f => ({ ...f, items: f.items.map((it,idx) => idx===i ? {...it,[k]:v} : it) }))

  const subtotal = form.items.reduce((sum, item) => {
    const p = products.find(p => String(p.id) === String(item.productId))
    return sum + (p ? p.price * item.quantity : 0)
  }, 0)
  const discount = parseFloat(form.discount) || 0
  const tax = (subtotal - discount) * 0.18
  const total = subtotal - discount + tax

  const submit = async (e) => {
    e.preventDefault()
    if (form.items.length === 0) { toast.error('Add at least one item'); return }
    setSaving(true)
    try {
      await orderApi.create({
        customerId: form.customerId || null,
        paymentMethod: form.paymentMethod,
        shippingAddress: form.shippingAddress,
        notes: form.notes,
        discount: discount,
        items: form.items.map(i => ({ productId: parseInt(i.productId), quantity: parseInt(i.quantity) }))
      })
      toast.success('Order created!'); onSaved()
    } catch (err) { toast.error(err.response?.data?.message || 'Error creating order') }
    finally { setSaving(false) }
  }

  const fmt = n => `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits:2 })}`

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth:680 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">Create New Order</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18}/></button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Customer (optional)</label>
                <select className="form-select" value={form.customerId} onChange={e=>setForm(f=>({...f,customerId:e.target.value}))}>
                  <option value="">Walk-in Customer</option>
                  {customers.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Payment Method</label>
                <select className="form-select" value={form.paymentMethod} onChange={e=>setForm(f=>({...f,paymentMethod:e.target.value}))}>
                  {['CASH','CARD','UPI','BANK_TRANSFER'].map(m=><option key={m} value={m}>{m.replace('_',' ')}</option>)}
                </select>
              </div>
            </div>

            <div style={{ marginBottom:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <label className="form-label" style={{ margin:0 }}>Order Items *</label>
                <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}><Plus size={14}/> Add Item</button>
              </div>
              {form.items.length === 0 && (
                <div style={{ textAlign:'center', padding:'20px', border:'1px dashed var(--border-light)', borderRadius:'var(--radius)', color:'var(--text-muted)', fontSize:13 }}>
                  Click "Add Item" to start adding products
                </div>
              )}
              {form.items.map((item, i) => {
                const prod = products.find(p => String(p.id) === String(item.productId))
                return (
                  <div key={i} style={{ display:'grid', gridTemplateColumns:'1fr 80px 100px 32px', gap:8, marginBottom:8, alignItems:'end' }}>
                    <div>
                      {i === 0 && <label className="form-label">Product</label>}
                      <select className="form-select" value={item.productId} onChange={e=>updateItem(i,'productId',e.target.value)} required>
                        <option value="">Select product</option>
                        {products.map(p=><option key={p.id} value={p.id}>{p.name} (Stock: {p.quantityInStock})</option>)}
                      </select>
                    </div>
                    <div>
                      {i === 0 && <label className="form-label">Qty</label>}
                      <input className="form-input" type="number" min="1" max={prod?.quantityInStock||999} value={item.quantity}
                        onChange={e=>updateItem(i,'quantity',e.target.value)} />
                    </div>
                    <div>
                      {i === 0 && <label className="form-label">Subtotal</label>}
                      <input className="form-input" readOnly value={prod ? fmt(prod.price * item.quantity) : '—'} style={{ color:'var(--text-secondary)' }} />
                    </div>
                    <button type="button" className="btn btn-ghost btn-icon" style={{ alignSelf:'flex-end' }} onClick={()=>removeItem(i)}><X size={14}/></button>
                  </div>
                )
              })}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Discount (₹)</label>
                <input className="form-input" type="number" min="0" value={form.discount} onChange={e=>setForm(f=>({...f,discount:e.target.value}))} />
              </div>
              <div className="form-group">
                <label className="form-label">Shipping Address</label>
                <input className="form-input" value={form.shippingAddress} onChange={e=>setForm(f=>({...f,shippingAddress:e.target.value}))} />
              </div>
            </div>

            {form.items.length > 0 && (
              <div style={{ background:'var(--bg-tertiary)', borderRadius:'var(--radius)', padding:16, border:'1px solid var(--border)' }}>
                {[['Subtotal', fmt(subtotal)], ['Discount', `-${fmt(discount)}`], ['Tax (18% GST)', fmt(tax)], ['Total', fmt(total)]].map(([l,v],i) => (
                  <div key={l} style={{ display:'flex', justifyContent:'space-between', fontSize: i===3 ? 15 : 13,
                    fontWeight: i===3 ? 700 : 400, color: i===3 ? 'var(--text-primary)' : 'var(--text-secondary)',
                    borderTop: i===3 ? '1px solid var(--border)' : 'none', paddingTop: i===3 ? 10 : 0, marginBottom: i===3 ? 0 : 6 }}>
                    <span>{l}</span><span style={{ color: i===3 ? 'var(--teal)' : undefined }}>{v}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><div className="spinner"/> Creating...</> : 'Create Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function OrderListPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [showCreate, setShowCreate] = useState(false)
  const navigate = useNavigate()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await orderApi.getAll({ status: filterStatus||undefined, page, size:15 })
      const d = res.data.data
      setOrders(d.content); setTotalPages(d.totalPages); setTotalElements(d.totalElements)
    } catch { toast.error('Failed to load orders') }
    finally { setLoading(false) }
  }, [filterStatus, page])

  useEffect(() => { load() }, [load])

  const fmt = n => `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits:0 })}`

  return (
    <div>
      <div className="page-header">
        <div><h1>Orders</h1><p className="text-secondary">{totalElements} orders total</p></div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}><Plus size={16}/> New Order</button>
      </div>

      <div className="filter-bar">
        <select className="form-select" style={{ width:'auto' }} value={filterStatus} onChange={e=>{ setFilterStatus(e.target.value); setPage(0) }}>
          <option value="">All Status</option>
          {['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED','CANCELLED'].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Order #</th><th>Customer</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th><th>Payment</th><th></th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} style={{ textAlign:'center', padding:40, color:'var(--text-secondary)' }}>Loading...</td></tr>
              ) : orders.length === 0 ? (
                <tr><td colSpan={8}><div className="empty-state"><div className="empty-icon">🛒</div><div className="empty-title">No orders found</div></div></td></tr>
              ) : orders.map(o => (
                <tr key={o.id} style={{ cursor:'pointer' }} onClick={() => navigate(`/orders/${o.id}`)}>
                  <td><span className="font-mono" style={{ fontSize:12, color:'var(--accent)' }}>{o.orderNumber}</span></td>
                  <td style={{ fontWeight:500 }}>{o.customerName || 'Walk-in'}</td>
                  <td style={{ color:'var(--text-secondary)', fontSize:12 }}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                  <td style={{ color:'var(--text-secondary)' }}>{o.orderItems?.length || 0} items</td>
                  <td style={{ fontWeight:600 }}>{fmt(o.totalAmount)}</td>
                  <td><span className={`badge ${statusBadge[o.status]||'badge-gray'}`}>{o.status}</span></td>
                  <td><span className={`badge ${payBadge[o.paymentStatus]||'badge-gray'}`}>{o.paymentStatus}</span></td>
                  <td onClick={e=>e.stopPropagation()}>
                    <button className="btn btn-ghost btn-icon btn-sm" onClick={() => navigate(`/orders/${o.id}`)}><Eye size={15}/></button>
                  </td>
                </tr>
              ))}
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

      {showCreate && <CreateOrderModal onClose={() => setShowCreate(false)} onSaved={() => { setShowCreate(false); load() }} />}
    </div>
  )
}

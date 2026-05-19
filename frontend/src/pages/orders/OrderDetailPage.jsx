import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { orderApi } from '../../api/axiosConfig'
import toast from 'react-hot-toast'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

const STATUS_FLOW = ['PENDING','CONFIRMED','PROCESSING','SHIPPED','DELIVERED']
const statusBadge = {
  PENDING:'badge-warning', CONFIRMED:'badge-info', PROCESSING:'badge-purple',
  SHIPPED:'badge-teal', DELIVERED:'badge-success', CANCELLED:'badge-danger'
}
const TRANSITIONS = {
  PENDING:['CONFIRMED','CANCELLED'], CONFIRMED:['PROCESSING','CANCELLED'],
  PROCESSING:['SHIPPED'], SHIPPED:['DELIVERED'], DELIVERED:[], CANCELLED:[]
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isManager } = useAuth()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const load = () => {
    orderApi.getById(id).then(r => { setOrder(r.data.data); setLoading(false) })
      .catch(() => { toast.error('Order not found'); navigate('/orders') })
  }
  useEffect(() => { load() }, [id])

  const updateStatus = async (status) => {
    setUpdating(true)
    try {
      await orderApi.updateStatus(id, { status })
      toast.success(`Order ${status.toLowerCase()}`)
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed') }
    finally { setUpdating(false) }
  }

  const fmt = n => `₹${Number(n).toLocaleString('en-IN', { maximumFractionDigits:2 })}`

  if (loading) return <div style={{ color:'var(--text-secondary)', padding:40 }}>Loading...</div>
  if (!order) return null

  const nextSteps = TRANSITIONS[order.status] || []
  const stepIndex = STATUS_FLOW.indexOf(order.status)

  return (
    <div>
      <div className="page-header">
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button className="btn btn-ghost btn-icon" onClick={() => navigate('/orders')}><ArrowLeft size={18}/></button>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <h1 style={{ fontSize:18 }}>{order.orderNumber}</h1>
              <span className={`badge ${statusBadge[order.status]||'badge-gray'}`}>{order.status}</span>
            </div>
            <p className="text-secondary">{new Date(order.createdAt).toLocaleString('en-IN')}</p>
          </div>
        </div>
        {isManager() && nextSteps.length > 0 && (
          <div style={{ display:'flex', gap:8 }}>
            {nextSteps.map(s => (
              <button key={s} className={`btn ${s==='CANCELLED'?'btn-danger':'btn-primary'}`}
                onClick={() => updateStatus(s)} disabled={updating}>
                {updating ? <div className="spinner"/> : s}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Status timeline */}
      {order.status !== 'CANCELLED' && (
        <div className="card" style={{ marginBottom:16 }}>
          <div className="card-body">
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              {STATUS_FLOW.map((s, i) => {
                const done = i <= stepIndex
                const current = i === stepIndex
                return (
                  <div key={s} style={{ display:'flex', flex:1, alignItems:'center' }}>
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flex:'0 0 auto' }}>
                      <div style={{ width:32, height:32, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                        background: done ? 'var(--accent)' : 'var(--bg-tertiary)', border: `2px solid ${done?'var(--accent)':'var(--border-light)'}`,
                        transition:'all .3s' }}>
                        {done ? <CheckCircle size={16} color="#fff"/> : <span style={{ fontSize:12, color:'var(--text-muted)' }}>{i+1}</span>}
                      </div>
                      <span style={{ fontSize:11, marginTop:6, color: current?'var(--accent)':done?'var(--text-secondary)':'var(--text-muted)', fontWeight: current?600:400 }}>{s}</span>
                    </div>
                    {i < STATUS_FLOW.length-1 && (
                      <div style={{ flex:1, height:2, background: i < stepIndex ? 'var(--accent)' : 'var(--border-light)', margin:'0 4px', marginBottom:20 }}/>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <div className="grid-2" style={{ marginBottom:16 }}>
        <div className="card">
          <div className="card-header"><span className="card-title">Customer</span></div>
          <div className="card-body">
            <div style={{ fontWeight:600, marginBottom:4 }}>{order.customerName || 'Walk-in Customer'}</div>
            {order.shippingAddress && <div style={{ fontSize:13, color:'var(--text-secondary)' }}>{order.shippingAddress}</div>}
          </div>
        </div>
        <div className="card">
          <div className="card-header"><span className="card-title">Payment</span></div>
          <div className="card-body">
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
              <span style={{ color:'var(--text-secondary)' }}>Method</span>
              <span style={{ fontWeight:500 }}>{order.paymentMethod?.replace('_',' ') || '—'}</span>
            </div>
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span style={{ color:'var(--text-secondary)' }}>Status</span>
              <span className={`badge ${order.paymentStatus==='PAID'?'badge-success':order.paymentStatus==='UNPAID'?'badge-danger':'badge-warning'}`}>{order.paymentStatus}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom:16 }}>
        <div className="card-header"><span className="card-title">Order Items</span></div>
        <div className="table-container">
          <table>
            <thead><tr><th>Product</th><th>SKU</th><th>Qty</th><th>Unit Price</th><th className="text-right">Total</th></tr></thead>
            <tbody>
              {(order.orderItems||[]).map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight:500 }}>{item.productName}</td>
                  <td><span className="font-mono" style={{ fontSize:12, color:'var(--text-secondary)' }}>{item.productSku}</span></td>
                  <td>{item.quantity}</td>
                  <td>{fmt(item.unitPrice)}</td>
                  <td className="text-right" style={{ fontWeight:600 }}>{fmt(item.totalPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding:'16px 20px', borderTop:'1px solid var(--border)' }}>
          <div style={{ maxWidth:280, marginLeft:'auto' }}>
            {[['Subtotal', fmt(order.subtotal)], ['Discount', `-${fmt(order.discount||0)}`], ['Tax (18%)', fmt(order.tax||0)]].map(([l,v]) => (
              <div key={l} style={{ display:'flex', justifyContent:'space-between', fontSize:13, color:'var(--text-secondary)', marginBottom:6 }}>
                <span>{l}</span><span>{v}</span>
              </div>
            ))}
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:16, fontWeight:700, borderTop:'1px solid var(--border)', paddingTop:10 }}>
              <span>Total</span><span style={{ color:'var(--teal)' }}>{fmt(order.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {order.notes && (
        <div className="card">
          <div className="card-header"><span className="card-title">Notes</span></div>
          <div className="card-body"><p style={{ color:'var(--text-secondary)', fontSize:13 }}>{order.notes}</p></div>
        </div>
      )}
    </div>
  )
}

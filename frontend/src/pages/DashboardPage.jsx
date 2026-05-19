import { useState, useEffect } from 'react'
import { dashboardApi } from '../api/axiosConfig'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import { Package, ShoppingCart, TrendingUp, AlertTriangle } from 'lucide-react'

const fmt = (n) => n?.toLocaleString('en-IN', { style:'currency', currency:'INR', maximumFractionDigits:0 }) || '₹0'

export default function DashboardPage() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    dashboardApi.getStats().then(r => { setStats(r.data.data); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <div style={{ color:'var(--text-secondary)', padding:40 }}>Loading dashboard...</div>
  if (!stats) return <div style={{ color:'var(--text-secondary)', padding:40 }}>Could not load dashboard data.</div>

  const kpis = [
    { label:'Total Products', value: stats.totalProducts, icon: Package, color:'#6366F1', bg:'rgba(99,102,241,.15)' },
    { label:'Total Orders', value: stats.totalOrders, icon: ShoppingCart, color:'#14B8A6', bg:'rgba(20,184,166,.15)' },
    { label:'Revenue This Month', value: fmt(stats.revenueThisMonth), icon: TrendingUp, color:'#22C55E', bg:'rgba(34,197,94,.15)',
      trend: stats.revenueTrend !== 0 ? `${stats.revenueTrend > 0 ? '↑' : '↓'} ${Math.abs(stats.revenueTrend).toFixed(1)}% vs last month` : null,
      trendUp: stats.revenueTrend >= 0 },
    { label:'Low Stock Alerts', value: stats.lowStockCount, icon: AlertTriangle, color:'#F59E0B', bg:'rgba(245,158,11,.15)' },
  ]

  return (
    <div>
      <div className="page-header">
        <div><h1>Dashboard</h1><p className="text-secondary">Overview of your inventory and sales</p></div>
      </div>

      <div className="stats-grid">
        {kpis.map(k => {
          const Icon = k.icon
          return (
            <div className="stat-card" key={k.label}>
              <div className="stat-icon" style={{ background: k.bg }}><Icon size={20} color={k.color} /></div>
              <div className="stat-label">{k.label}</div>
              <div className="stat-value">{k.value}</div>
              {k.trend && <div className={`stat-trend ${k.trendUp ? 'trend-up' : 'trend-down'}`}>{k.trend}</div>}
            </div>
          )
        })}
      </div>

      <div className="chart-row">
        <div className="card">
          <div className="card-header"><span className="card-title">Sales — Last 30 Days</span></div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={stats.salesChart || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E1E2E" />
                <XAxis dataKey="date" tick={{ fill:'#8B8BA0', fontSize:11 }} tickFormatter={d => d?.slice(5)} />
                <YAxis tick={{ fill:'#8B8BA0', fontSize:11 }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ background:'#111118', border:'1px solid #1E1E2E', borderRadius:8, color:'#F0F0F8' }}
                  formatter={(v, n) => [n === 'revenue' ? fmt(v) : v, n === 'revenue' ? 'Revenue' : 'Orders']} />
                <Line type="monotone" dataKey="revenue" stroke="#6366F1" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="orders" stroke="#14B8A6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <div style={{ display:'flex', gap:16, marginTop:8 }}>
              <span style={{ fontSize:12, color:'#6366F1', display:'flex', alignItems:'center', gap:4 }}>
                <span style={{ width:12, height:2, background:'#6366F1', display:'inline-block' }} /> Revenue
              </span>
              <span style={{ fontSize:12, color:'#14B8A6', display:'flex', alignItems:'center', gap:4 }}>
                <span style={{ width:12, height:2, background:'#14B8A6', display:'inline-block' }} /> Orders
              </span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span className="card-title">Top Products</span></div>
          <div className="card-body">
            {(stats.topProducts || []).length === 0 ? (
              <div className="empty-state"><div className="empty-desc">No data yet</div></div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {(stats.topProducts || []).map((p, i) => (
                  <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                      <div style={{ fontSize:13, fontWeight:500 }}>{p.name}</div>
                      <div style={{ fontSize:11, color:'var(--text-muted)' }}>{p.totalSold} units sold</div>
                    </div>
                    <div style={{ fontSize:13, fontWeight:600, color:'var(--teal)' }}>{fmt(p.totalRevenue)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {stats.lowStockCount > 0 && (
        <div style={{ padding:'12px 16px', background:'rgba(245,158,11,.1)', border:'1px solid rgba(245,158,11,.25)', borderRadius:'var(--radius)', display:'flex', alignItems:'center', gap:10 }}>
          <AlertTriangle size={18} color="#F59E0B" />
          <span style={{ fontSize:13 }}><strong>{stats.lowStockCount} products</strong> are below their reorder level.{' '}
            <a href="/products" style={{ color:'var(--accent)', fontWeight:500 }}>View products →</a></span>
        </div>
      )}
    </div>
  )
}

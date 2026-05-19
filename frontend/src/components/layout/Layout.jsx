import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'
import { LayoutDashboard, Package, ShoppingCart, TrendingUp, Users, Truck, LogOut, Menu, AlertTriangle, Box } from 'lucide-react'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', section: 'Main' },
  { label: 'Products', icon: Package, path: '/products', section: 'Inventory' },
  { label: 'Stock', icon: TrendingUp, path: '/stock', section: 'Inventory' },
  { label: 'Orders', icon: ShoppingCart, path: '/orders', section: 'Sales' },
  { label: 'Customers', icon: Users, path: '/customers', section: 'Sales' },
  { label: 'Suppliers', icon: Truck, path: '/suppliers', section: 'Sales' },
]

export default function Layout() {
  const { user, logout, isAdmin, isManager } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  const sections = [...new Set(navItems.map(n => n.section))]

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="app-layout">
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">📦</div>
          {!collapsed && <span className="logo-text">InventoryPro</span>}
        </div>
        <nav className="sidebar-nav">
          {sections.map(section => (
            <div className="nav-section" key={section}>
              {!collapsed && <div className="nav-section-label">{section}</div>}
              {navItems.filter(n => n.section === section).map(item => {
                const Icon = item.icon
                const active = location.pathname.startsWith(item.path)
                return (
                  <button key={item.path} className={`nav-item ${active ? 'active' : ''}`}
                    onClick={() => navigate(item.path)} title={collapsed ? item.label : undefined}>
                    <Icon size={18} />
                    {!collapsed && <span className="nav-label">{item.label}</span>}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>
        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
          <button className="nav-item" onClick={handleLogout} title={collapsed ? 'Logout' : undefined}>
            <LogOut size={18} />
            {!collapsed && <span className="nav-label">Logout</span>}
          </button>
        </div>
      </aside>

      <div className="main-content">
        <header className="topbar">
          <div className="topbar-left">
            <button className="btn btn-ghost btn-icon" onClick={() => setCollapsed(!collapsed)}>
              <Menu size={18} />
            </button>
            <span className="page-title">
              {navItems.find(n => location.pathname.startsWith(n.path))?.label || 'Dashboard'}
            </span>
          </div>
          <div className="topbar-right">
            <div style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 12px', background:'var(--bg-tertiary)', borderRadius:'var(--radius)', border:'1px solid var(--border)' }}>
              <div style={{ width:28, height:28, borderRadius:'50%', background:'var(--accent)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700 }}>
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <div style={{ fontSize:13, fontWeight:500 }}>{user?.username}</div>
                <div style={{ fontSize:11, color:'var(--text-muted)' }}>
                  {user?.roles?.includes('ROLE_ADMIN') ? 'Admin' : user?.roles?.includes('ROLE_MANAGER') ? 'Manager' : 'Staff'}
                </div>
              </div>
            </div>
          </div>
        </header>
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useState } from 'react'
import {
  LayoutDashboard, Package, ShoppingCart, TrendingUp,
  Users, Truck, LogOut, Menu, Shield, UserCheck, User,
  BarChart2, Settings, AlertTriangle
} from 'lucide-react'

// ── Role config ───────────────────────────────────────────────────────────────
const ROLE_CONFIG = {
  ROLE_ADMIN: {
    label:   'Admin',
    color:   '#EF4444',        // red
    bg:      'rgba(239,68,68,.12)',
    border:  'rgba(239,68,68,.25)',
    accent:  '#EF4444',
    sidebarBg: '#0F0A0A',      // darkest — almost black with red tint
    Icon:    Shield,
  },
  ROLE_MANAGER: {
    label:   'Manager',
    color:   '#6366F1',        // indigo
    bg:      'rgba(99,102,241,.12)',
    border:  'rgba(99,102,241,.25)',
    accent:  '#6366F1',
    sidebarBg: '#0A0A14',      // dark with indigo tint
    Icon:    UserCheck,
  },
  ROLE_STAFF: {
    label:   'Staff',
    color:   '#14B8A6',        // teal
    bg:      'rgba(20,184,166,.12)',
    border:  'rgba(20,184,166,.25)',
    accent:  '#14B8A6',
    sidebarBg: '#0A0F0E',      // dark with teal tint
    Icon:    User,
  },
}

// ── Nav items per role ────────────────────────────────────────────────────────
const NAV = {
  ROLE_ADMIN: [
    { label: 'Dashboard',  icon: LayoutDashboard, path: '/dashboard', section: 'Main' },
    { label: 'Products',   icon: Package,         path: '/products',  section: 'Inventory' },
    { label: 'Stock',      icon: TrendingUp,      path: '/stock',     section: 'Inventory' },
    { label: 'Low Stock',  icon: AlertTriangle,   path: '/products?status=ACTIVE&lowStock=true', section: 'Inventory' },
    { label: 'Orders',     icon: ShoppingCart,    path: '/orders',    section: 'Sales' },
    { label: 'Customers',  icon: Users,           path: '/customers', section: 'Sales' },
    { label: 'Suppliers',  icon: Truck,           path: '/suppliers', section: 'Sales' },
  ],
  ROLE_MANAGER: [
    { label: 'Dashboard',  icon: LayoutDashboard, path: '/dashboard', section: 'Main' },
    { label: 'Products',   icon: Package,         path: '/products',  section: 'Inventory' },
    { label: 'Stock',      icon: TrendingUp,      path: '/stock',     section: 'Inventory' },
    { label: 'Orders',     icon: ShoppingCart,    path: '/orders',    section: 'Sales' },
    { label: 'Customers',  icon: Users,           path: '/customers', section: 'Sales' },
    { label: 'Suppliers',  icon: Truck,           path: '/suppliers', section: 'Sales' },
  ],
  ROLE_STAFF: [
    { label: 'Dashboard',  icon: LayoutDashboard, path: '/dashboard', section: 'Main' },
    { label: 'Products',   icon: Package,         path: '/products',  section: 'Inventory' },
    { label: 'Orders',     icon: ShoppingCart,    path: '/orders',    section: 'Sales' },
    { label: 'Customers',  icon: Users,           path: '/customers', section: 'Sales' },
  ],
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  // detect role
  const roleKey  = user?.roles?.find(r => ROLE_CONFIG[r]) || 'ROLE_STAFF'
  const role     = ROLE_CONFIG[roleKey]
  const navItems = NAV[roleKey] || NAV.ROLE_STAFF
  const sections = [...new Set(navItems.map(n => n.section))]
  const RoleIcon = role.Icon

  const handleLogout = () => { logout(); navigate('/login') }

  const activeLabel = navItems.find(n => location.pathname.startsWith(n.path.split('?')[0]))?.label || 'Dashboard'

  return (
    <div className="app-layout">

      {/* ── Sidebar ── */}
      <aside
        className={`sidebar ${collapsed ? 'collapsed' : ''}`}
        style={{ background: role.sidebarBg, borderRight: `1px solid ${role.border}` }}
      >
        {/* Logo */}
        <div className="sidebar-logo" style={{ borderBottom: `1px solid ${role.border}` }}>
          <div className="logo-icon" style={{ background: role.color }}>📦</div>
          {!collapsed && <span className="logo-text">InventoryPro</span>}
        </div>

        {/* Role badge */}
        {!collapsed && (
          <div style={{
            margin: '10px 12px 4px',
            padding: '8px 10px',
            background: role.bg,
            border: `1px solid ${role.border}`,
            borderRadius: 8,
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <RoleIcon size={14} color={role.color} />
            <div>
              <div style={{ fontSize: 11, color: role.color, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase' }}>
                {role.label}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 1 }}>
                {user?.username}
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="sidebar-nav" style={{ marginTop: 8 }}>
          {sections.map(section => (
            <div className="nav-section" key={section}>
              {!collapsed && (
                <div className="nav-section-label" style={{ color: role.color, opacity: .7 }}>
                  {section}
                </div>
              )}
              {navItems.filter(n => n.section === section).map(item => {
                const Icon   = item.icon
                const active = location.pathname.startsWith(item.path.split('?')[0])
                return (
                  <button
                    key={item.path}
                    className={`nav-item ${active ? 'active' : ''}`}
                    style={active ? { background: role.bg, color: role.color } : {}}
                    onClick={() => navigate(item.path)}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon size={18} />
                    {!collapsed && <span className="nav-label">{item.label}</span>}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: '12px 8px', borderTop: `1px solid ${role.border}` }}>
          {!collapsed && (
            <div style={{
              padding: '6px 10px 10px',
              fontSize: 11,
              color: 'var(--text-muted)',
              display: 'flex', gap: 6, flexWrap: 'wrap'
            }}>
              {roleKey === 'ROLE_ADMIN'   && <><span style={{color:role.color}}>✓</span> Full access</>}
              {roleKey === 'ROLE_MANAGER' && <><span style={{color:role.color}}>✓</span> Create &amp; edit</>}
              {roleKey === 'ROLE_STAFF'   && <><span style={{color:role.color}}>✓</span> View &amp; orders</>}
            </div>
          )}
          <button
            className="nav-item"
            onClick={handleLogout}
            title={collapsed ? 'Logout' : undefined}
            style={{ color: 'var(--text-secondary)' }}
          >
            <LogOut size={18} />
            {!collapsed && <span className="nav-label">Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="main-content">

        {/* Topbar */}
        <header className="topbar" style={{ borderBottom: `1px solid ${role.border}` }}>
          <div className="topbar-left">
            <button className="btn btn-ghost btn-icon" onClick={() => setCollapsed(!collapsed)}>
              <Menu size={18} />
            </button>
            <span className="page-title">{activeLabel}</span>
          </div>
          <div className="topbar-right">
            {/* Role chip */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '4px 10px',
              background: role.bg,
              border: `1px solid ${role.border}`,
              borderRadius: 99,
              fontSize: 12, fontWeight: 600, color: role.color,
            }}>
              <RoleIcon size={13} />
              {role.label}
            </div>

            {/* Avatar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '5px 10px',
              background: 'var(--bg-tertiary)',
              borderRadius: 'var(--radius)',
              border: '1px solid var(--border)',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: role.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: '#fff',
              }}>
                {user?.username?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{user?.username}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{role.label}</div>
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
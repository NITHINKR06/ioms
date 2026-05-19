import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../api/axiosConfig'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await authApi.login(form)
      const { accessToken, user } = res.data.data
      login(accessToken, user)
      toast.success('Welcome back!')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-orb" style={{ width:500, height:500, background:'#6366F1', top:-100, left:-100 }} />
      <div className="login-orb" style={{ width:400, height:400, background:'#14B8A6', bottom:-100, right:-100 }} />
      <div className="login-card">
        <div className="login-logo">
          <div className="logo-icon">📦</div>
          <h1 style={{ fontSize:22, fontWeight:700, marginBottom:4 }}>InventoryPro</h1>
          <p style={{ color:'var(--text-secondary)', fontSize:13 }}>Sign in to your account</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username or Email</label>
            <input className="form-input" placeholder="admin" value={form.username}
              onChange={e => setForm({...form, username: e.target.value})} required />
          </div>
          <div className="form-group" style={{ marginBottom:24 }}>
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="••••••••" value={form.password}
              onChange={e => setForm({...form, password: e.target.value})} required />
          </div>
          <button className="btn btn-primary w-full" style={{ justifyContent:'center', padding:'10px' }} disabled={loading}>
            {loading ? <><div className="spinner" /> Signing in...</> : 'Sign In'}
          </button>
        </form>
        <div style={{ marginTop:24, padding:16, background:'var(--bg-tertiary)', borderRadius:'var(--radius)', border:'1px solid var(--border)' }}>
          <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:8, fontWeight:600 }}>DEMO CREDENTIALS</p>
          {[['admin','Admin@123','Admin'],['manager','Manager@123','Manager'],['staff','Staff@123','Staff']].map(([u,p,r]) => (
            <div key={u} style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'var(--text-secondary)', marginBottom:4, cursor:'pointer' }}
              onClick={() => setForm({ username: u, password: p })}>
              <span style={{ color:'var(--accent)' }}>{u}</span><span>{p}</span><span style={{ color:'var(--text-muted)' }}>{r}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

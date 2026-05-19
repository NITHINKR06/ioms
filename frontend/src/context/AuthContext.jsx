import { createContext, useContext, useState, useEffect } from 'react'
import api from '../api/axiosConfig'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      // decode token to get user info
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setUser({ username: payload.sub, roles: payload.roles || [] })
      } catch {
        logout()
      }
    }
    setLoading(false)
  }, [token])

  const login = (accessToken, userData) => {
    localStorage.setItem('token', accessToken)
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
    setToken(accessToken)
    setUser(userData)
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete api.defaults.headers.common['Authorization']
    setToken(null)
    setUser(null)
  }

  const hasRole = (role) => user?.roles?.includes(role)
  const isAdmin = () => hasRole('ROLE_ADMIN')
  const isManager = () => hasRole('ROLE_MANAGER') || hasRole('ROLE_ADMIN')

  return (
    <AuthContext.Provider value={{ user, token, login, logout, hasRole, isAdmin, isManager, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

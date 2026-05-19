import { createContext, useContext, useState, useEffect } from 'react'
import api, { authApi } from '../api/axiosConfig'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('refreshToken'))
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

  const loginWithRefresh = (accessToken, userData, newRefreshToken) => {
    login(accessToken, userData)
    if (newRefreshToken) {
      localStorage.setItem('refreshToken', newRefreshToken)
      setRefreshToken(newRefreshToken)
    }
  }

  const logout = () => {
    const rt = localStorage.getItem('refreshToken')
    if (rt) authApi.logout(rt).catch(() => {})
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
    delete api.defaults.headers.common['Authorization']
    setToken(null)
    setRefreshToken(null)
    setUser(null)
  }

  const hasRole = (role) => user?.roles?.includes(role)
  const isAdmin = () => hasRole('ROLE_ADMIN')
  const isManager = () => hasRole('ROLE_MANAGER') || hasRole('ROLE_ADMIN')

  return (
    <AuthContext.Provider value={{ user, token, refreshToken, login: loginWithRefresh, logout, hasRole, isAdmin, isManager, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

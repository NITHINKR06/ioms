import axios from 'axios'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' }
})

const setAuthHeader = (accessToken) => {
  if (accessToken) api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
  else delete api.defaults.headers.common['Authorization']
}

const token = localStorage.getItem('token')
if (token) setAuthHeader(token)

api.interceptors.response.use(
  res => res,
  async err => {
    const originalRequest = err.config

    if (err.response?.status === 401) {
      const refreshToken = localStorage.getItem('refreshToken')
      const isAuthRequest = originalRequest?.url?.includes('/api/v1/auth/')

      if (!isAuthRequest && refreshToken && !originalRequest?._retry) {
        originalRequest._retry = true
        try {
          const refreshRes = await axios.post(`${baseURL}/api/v1/auth/refresh`, { refreshToken })
          const { accessToken, refreshToken: newRefreshToken } = refreshRes.data?.data || {}

          if (accessToken) {
            localStorage.setItem('token', accessToken)
            setAuthHeader(accessToken)
            originalRequest.headers = originalRequest.headers || {}
            originalRequest.headers['Authorization'] = `Bearer ${accessToken}`
          }
          if (newRefreshToken) localStorage.setItem('refreshToken', newRefreshToken)

          return api(originalRequest)
        } catch (refreshErr) {
          localStorage.removeItem('token')
          localStorage.removeItem('refreshToken')
          setAuthHeader(null)
          window.location.href = '/login'
          return Promise.reject(refreshErr)
        }
      }

      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      setAuthHeader(null)
      window.location.href = '/login'
    }

    return Promise.reject(err)
  }
)

export default api

// Auth
export const authApi = {
  login: (data) => api.post('/api/v1/auth/login', data),
  register: (data) => api.post('/api/v1/auth/register', data),
  refresh: (refreshToken) => api.post('/api/v1/auth/refresh', { refreshToken }),
  logout: (refreshToken) => api.post('/api/v1/auth/logout', { refreshToken }),
}

// Products
export const productApi = {
  getAll: (params) => api.get('/api/v1/products', { params }),
  getById: (id) => api.get(`/api/v1/products/${id}`),
  getLowStock: () => api.get('/api/v1/products/low-stock'),
  create: (data) => api.post('/api/v1/products', data),
  update: (id, data) => api.put(`/api/v1/products/${id}`, data),
  delete: (id) => api.delete(`/api/v1/products/${id}`),
}

// Orders
export const orderApi = {
  getAll: (params) => api.get('/api/v1/orders', { params }),
  getById: (id) => api.get(`/api/v1/orders/${id}`),
  create: (data) => api.post('/api/v1/orders', data),
  updateStatus: (id, data) => api.put(`/api/v1/orders/${id}/status`, data),
  delete: (id) => api.delete(`/api/v1/orders/${id}`),
}

// Stock
export const stockApi = {
  getAll: (params) => api.get('/api/v1/stock/movements', { params }),
  getByProduct: (productId, params) => api.get(`/api/v1/stock/movements/product/${productId}`, { params }),
  record: (data) => api.post('/api/v1/stock/movement', data),
}

// Customers
export const customerApi = {
  getAll: (params) => api.get('/api/v1/customers', { params }),
  getById: (id) => api.get(`/api/v1/customers/${id}`),
  create: (data) => api.post('/api/v1/customers', data),
  update: (id, data) => api.put(`/api/v1/customers/${id}`, data),
  delete: (id) => api.delete(`/api/v1/customers/${id}`),
}

// Categories
export const categoryApi = {
  getAll: () => api.get('/api/v1/categories'),
  create: (data) => api.post('/api/v1/categories', data),
  update: (id, data) => api.put(`/api/v1/categories/${id}`, data),
  delete: (id) => api.delete(`/api/v1/categories/${id}`),
}

// Suppliers
export const supplierApi = {
  getAll: (params) => api.get('/api/v1/suppliers', { params }),
  create: (data) => api.post('/api/v1/suppliers', data),
  update: (id, data) => api.put(`/api/v1/suppliers/${id}`, data),
  delete: (id) => api.delete(`/api/v1/suppliers/${id}`),
}

// Dashboard
export const dashboardApi = {
  getStats: () => api.get('/api/v1/dashboard/stats'),
}

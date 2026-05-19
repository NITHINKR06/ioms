import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
  headers: { 'Content-Type': 'application/json' }
})

const token = localStorage.getItem('token')
if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token')
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

import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProductListPage from './pages/products/ProductListPage'
import OrderListPage from './pages/orders/OrderListPage'
import OrderDetailPage from './pages/orders/OrderDetailPage'
import StockPage from './pages/stock/StockPage'
import CustomerPage from './pages/customers/CustomerPage'
import SupplierPage from './pages/suppliers/SupplierPage'

function PrivateRoute({ children }) {
  const { token, loading } = useAuth()
  if (loading) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',color:'#8B8BA0' }}>Loading...</div>
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="products" element={<ProductListPage />} />
        <Route path="orders" element={<OrderListPage />} />
        <Route path="orders/:id" element={<OrderDetailPage />} />
        <Route path="stock" element={<StockPage />} />
        <Route path="customers" element={<CustomerPage />} />
        <Route path="suppliers" element={<SupplierPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

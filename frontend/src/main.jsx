import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import { Toaster } from 'react-hot-toast'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <App />
      <Toaster position="top-right" toastOptions={{
        style: { background: '#111118', color: '#F0F0F8', border: '1px solid #1E1E2E' },
        success: { iconTheme: { primary: '#22C55E', secondary: '#111118' } },
        error: { iconTheme: { primary: '#EF4444', secondary: '#111118' } }
      }} />
    </AuthProvider>
  </BrowserRouter>
)

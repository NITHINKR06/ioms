import { useState, useEffect, useCallback } from 'react'
import { productApi, categoryApi, supplierApi } from '../../api/axiosConfig'
import toast from 'react-hot-toast'
import { Plus, Search, Edit, Trash2, X, AlertTriangle } from 'lucide-react'

const statusBadge = { ACTIVE:'badge-success', INACTIVE:'badge-danger', DISCONTINUED:'badge-gray' }

function ProductModal({ product, categories, suppliers, onClose, onSaved }) {
  const [form, setForm] = useState(product ? {
    name: product.name, description: product.description || '', price: product.price,
    costPrice: product.costPrice, quantityInStock: product.quantityInStock,
    reorderLevel: product.reorderLevel, imageUrl: product.imageUrl || '',
    status: product.status, categoryId: product.categoryId, supplierId: product.supplierId || ''
  } : { name:'', description:'', price:'', costPrice:'', quantityInStock:0, reorderLevel:10, imageUrl:'', status:'ACTIVE', categoryId:'', supplierId:'' })
  const [saving, setSaving] = useState(false)

  const submit = async (e) => {
    e.preventDefault(); setSaving(true)
    try {
      if (product) await productApi.update(product.id, form)
      else await productApi.create(form)
      toast.success(product ? 'Product updated!' : 'Product created!')
      onSaved()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving product')
    } finally { setSaving(false) }
  }

  const f = (k, v) => setForm(prev => ({...prev, [k]: v}))

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <span className="modal-title">{product ? 'Edit Product' : 'Add Product'}</span>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={submit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input className="form-input" value={form.name} onChange={e=>f('name',e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="form-select" value={form.categoryId} onChange={e=>f('categoryId',e.target.value)} required>
                  <option value="">Select category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" rows={2} value={form.description} onChange={e=>f('description',e.target.value)} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Selling Price (₹) *</label>
                <input className="form-input" type="number" min="0" step="0.01" value={form.price} onChange={e=>f('price',e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Cost Price (₹) *</label>
                <input className="form-input" type="number" min="0" step="0.01" value={form.costPrice} onChange={e=>f('costPrice',e.target.value)} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Stock Quantity *</label>
                <input className="form-input" type="number" min="0" value={form.quantityInStock} onChange={e=>f('quantityInStock',e.target.value)} required />
              </div>
              <div className="form-group">
                <label className="form-label">Reorder Level *</label>
                <input className="form-input" type="number" min="0" value={form.reorderLevel} onChange={e=>f('reorderLevel',e.target.value)} required />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Supplier</label>
                <select className="form-select" value={form.supplierId} onChange={e=>f('supplierId',e.target.value)}>
                  <option value="">No supplier</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-select" value={form.status} onChange={e=>f('status',e.target.value)}>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="DISCONTINUED">Discontinued</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Image URL</label>
              <input className="form-input" value={form.imageUrl} onChange={e=>f('imageUrl',e.target.value)} placeholder="https://..." />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <><div className="spinner" /> Saving...</> : (product ? 'Update Product' : 'Create Product')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ProductListPage() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [modal, setModal] = useState(null) // null | 'create' | product
  const [delConfirm, setDelConfirm] = useState(null)

  const loadProducts = useCallback(async () => {
    setLoading(true)
    try {
      const res = await productApi.getAll({ search: search||undefined, categoryId: filterCat||undefined, status: filterStatus||undefined, page, size:15 })
      const data = res.data.data
      setProducts(data.content); setTotalPages(data.totalPages); setTotalElements(data.totalElements)
    } catch { toast.error('Failed to load products') }
    finally { setLoading(false) }
  }, [search, filterCat, filterStatus, page])

  useEffect(() => { categoryApi.getAll().then(r => setCategories(r.data.data)) }, [])
  useEffect(() => { supplierApi.getAll().then(r => setSuppliers(r.data.data?.content || [])) }, [])
  useEffect(() => { loadProducts() }, [loadProducts])

  const handleDelete = async (id) => {
    try { await productApi.delete(id); toast.success('Product deleted'); loadProducts() }
    catch { toast.error('Failed to delete') }
    setDelConfirm(null)
  }

  const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`

  return (
    <div>
      <div className="page-header">
        <div><h1>Products</h1><p className="text-secondary">{totalElements} products total</p></div>
        <button className="btn btn-primary" onClick={() => setModal('create')}><Plus size={16} /> Add Product</button>
      </div>

      <div className="filter-bar">
        <div className="search-bar">
          <Search size={16} className="search-icon" />
          <input className="form-input" placeholder="Search products..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(0) }} />
        </div>
        <select className="form-select" style={{ width:'auto' }} value={filterCat} onChange={e => { setFilterCat(e.target.value); setPage(0) }}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className="form-select" style={{ width:'auto' }} value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(0) }}>
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
          <option value="DISCONTINUED">Discontinued</option>
        </select>
      </div>

      <div className="card">
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>SKU</th><th>Product</th><th>Category</th><th>Stock</th><th>Price</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign:'center', padding:40, color:'var(--text-secondary)' }}>Loading...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={7}><div className="empty-state"><div className="empty-icon">📦</div><div className="empty-title">No products found</div><div className="empty-desc">Try adjusting your filters</div></div></td></tr>
              ) : products.map(p => (
                <tr key={p.id}>
                  <td><span className="font-mono" style={{ fontSize:12, color:'var(--text-secondary)' }}>{p.sku}</span></td>
                  <td>
                    <div style={{ fontWeight:500 }}>{p.name}</div>
                    {p.supplierName && <div style={{ fontSize:11, color:'var(--text-muted)' }}>{p.supplierName}</div>}
                  </td>
                  <td><span className="badge badge-info">{p.categoryName}</span></td>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                      <span style={{ fontWeight:600 }}>{p.quantityInStock}</span>
                      {p.lowStock && <span title="Low stock"><AlertTriangle size={14} color="#F59E0B" /></span>}
                    </div>
                    <div style={{ fontSize:11, color:'var(--text-muted)' }}>Min: {p.reorderLevel}</div>
                  </td>
                  <td>
                    <div style={{ fontWeight:600 }}>{fmt(p.price)}</div>
                    <div style={{ fontSize:11, color:'var(--text-muted)' }}>Cost: {fmt(p.costPrice)}</div>
                  </td>
                  <td><span className={`badge ${statusBadge[p.status] || 'badge-gray'}`}>{p.status}</span></td>
                  <td>
                    <div style={{ display:'flex', gap:4 }}>
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => setModal(p)} title="Edit"><Edit size={15} /></button>
                      <button className="btn btn-danger btn-icon btn-sm" onClick={() => setDelConfirm(p)} title="Delete"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="pagination">
            <button className="page-btn" onClick={() => setPage(p=>Math.max(0,p-1))} disabled={page===0}>←</button>
            {[...Array(Math.min(totalPages,7))].map((_,i) => (
              <button key={i} className={`page-btn ${i===page?'active':''}`} onClick={() => setPage(i)}>{i+1}</button>
            ))}
            <button className="page-btn" onClick={() => setPage(p=>Math.min(totalPages-1,p+1))} disabled={page===totalPages-1}>→</button>
            <span className="page-info">Page {page+1} of {totalPages}</span>
          </div>
        )}
      </div>

      {(modal === 'create' || (modal && modal !== 'create')) && (
        <ProductModal product={modal === 'create' ? null : modal} categories={categories} suppliers={suppliers}
          onClose={() => setModal(null)} onSaved={() => { setModal(null); loadProducts() }} />
      )}

      {delConfirm && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth:400 }}>
            <div className="modal-header"><span className="modal-title">Confirm Delete</span></div>
            <div className="modal-body">
              <p style={{ color:'var(--text-secondary)' }}>Delete <strong style={{ color:'var(--text-primary)' }}>{delConfirm.name}</strong>? This will mark it as inactive.</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDelConfirm(null)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => handleDelete(delConfirm.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

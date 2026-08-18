import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import ProductFormModal from '../components/ProductFormModal';
import { productService } from '../services/productService';
import { categoryService } from '../services/categoryService';
import { supplierService } from '../services/supplierService';
import './Shared.css';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState('');

  // Filter state — category_id / supplier_id can arrive pre-set from the URL
  // (e.g. clicked "View Products" from the Categories or Suppliers page)
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category_id') || '');
  const [supplierFilter, setSupplierFilter] = useState(searchParams.get('supplier_id') || '');
  const [statusFilter, setStatusFilter] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Load categories and suppliers once, for both the filter dropdowns and display names
  useEffect(() => {
    categoryService.getAll().then(setCategories).catch(() => setCategories([]));
    supplierService.getAll().then(setSuppliers).catch(() => setSuppliers([]));
  }, []);

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setPageError('');
    try {
      const data = await productService.getAll({
        search: searchTerm,
        category_id: categoryFilter,
        supplier_id: supplierFilter,
        status: statusFilter,
        low_stock: lowStockOnly ? 'true' : '',
      });
      setProducts(data);
    } catch (err) {
      setPageError('Could not load products. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, categoryFilter, supplierFilter, statusFilter, lowStockOnly]);

  // Debounced reload whenever any filter changes
  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 350);
    return () => clearTimeout(timer);
  }, [loadProducts]);

  // Keep the URL in sync with active filters, so the filtered view is shareable/bookmarkable
  useEffect(() => {
    const params = {};
    if (categoryFilter) params.category_id = categoryFilter;
    if (supplierFilter) params.supplier_id = supplierFilter;
    setSearchParams(params);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter, supplierFilter]);

  const getCategoryName = (categoryId) => {
    const match = categories.find((c) => c.category_id === categoryId);
    return match ? match.category_name : '—';
  };

  const getSupplierName = (supplierId) => {
    const match = suppliers.find((s) => s.supplier_id === supplierId);
    return match ? match.supplier_name : '—';
  };

  const getStockBadge = (product) => {
    if (product.quantity === 0) return <span className="status-badge out-of-stock">Out of Stock</span>;
    if (product.quantity <= product.minimum_stock_level) return <span className="status-badge low-stock">Low Stock</span>;
    return <span className="status-badge active">In Stock</span>;
  };

  const handleAddClick = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleSave = async (formData) => {
    if (editingProduct) {
      await productService.update(editingProduct.product_id, formData);
    } else {
      await productService.create(formData);
    }
    await loadProducts();
  };

  const handleDelete = async (product) => {
    const confirmed = window.confirm(`Delete "${product.product_name}"? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await productService.remove(product.product_id);
      await loadProducts();
    } catch (err) {
      alert(err.response?.data?.error || 'Could not delete this product.');
    }
  };

  const handleToggleStatus = async (product) => {
    try {
      await productService.toggleStatus(product.product_id);
      await loadProducts();
    } catch (err) {
      alert('Could not update status.');
    }
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">Manage everything in your catalog</p>
        </div>
        <button className="btn-primary" onClick={handleAddClick}>+ Add Product</button>
      </div>

      <div className="page-toolbar">
        <input
          type="text"
          className="search-input"
          placeholder="Search by name or code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="form-input"
          style={{ width: '180px' }}
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.category_id} value={cat.category_id}>{cat.category_name}</option>
          ))}
        </select>

        <select
          className="form-input"
          style={{ width: '180px' }}
          value={supplierFilter}
          onChange={(e) => setSupplierFilter(e.target.value)}
        >
          <option value="">All Suppliers</option>
          {suppliers.map((sup) => (
            <option key={sup.supplier_id} value={sup.supplier_id}>{sup.supplier_name}</option>
          ))}
        </select>

        <select
          className="form-input"
          style={{ width: '150px' }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
        </select>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', color: '#374151' }}>
          <input
            type="checkbox"
            checked={lowStockOnly}
            onChange={(e) => setLowStockOnly(e.target.checked)}
          />
          Low stock only
        </label>

        {(categoryFilter || supplierFilter) && (
          <button className="icon-btn" onClick={() => { setCategoryFilter(''); setSupplierFilter(''); }}>
            Clear filters ×
          </button>
        )}
      </div>

      <div className="data-table-wrapper">
        {isLoading ? (
          <div className="empty-state">Loading...</div>
        ) : pageError ? (
          <div className="empty-state">{pageError}</div>
        ) : products.length === 0 ? (
          <div className="empty-state">No products found.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Code</th>
                <th>Category</th>
                <th>Supplier</th>
                <th>Purchase Price</th>
                <th>Selling Price</th>
                <th>Quantity</th>
                <th>Stock</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.product_id}>
                  <td>{product.product_name}</td>
                  <td style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: '0.8rem' }}>{product.product_code}</td>
                  <td>{getCategoryName(product.category_id)}</td>
                  <td>{getSupplierName(product.supplier_id)}</td>
                  <td>₹{Number(product.purchase_price).toFixed(2)}</td>
                  <td>₹{Number(product.selling_price).toFixed(2)}</td>
                  <td>{product.quantity}</td>
                  <td>{getStockBadge(product)}</td>
                  <td>
                    <span className={`status-badge ${product.status === 'Active' ? 'active' : 'inactive'}`}>
                      {product.status}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="icon-btn" onClick={() => handleEditClick(product)}>Edit</button>
                      <button className="icon-btn" onClick={() => handleToggleStatus(product)}>
                        {product.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button className="icon-btn danger" onClick={() => handleDelete(product)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        editingProduct={editingProduct}
      />
    </AppLayout>
  );
}
import { useState, useEffect } from 'react';
import Modal from './Modal';
import { categoryService } from '../services/categoryService';
import { supplierService } from '../services/supplierService';

const emptyForm = {
  product_name: '',
  product_code: '',
  category_id: '',
  supplier_id: '',
  description: '',
  purchase_price: '',
  selling_price: '',
  quantity: '',
  minimum_stock_level: '5',
};

export default function ProductFormModal({ isOpen, onClose, onSave, editingProduct }) {
  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = Boolean(editingProduct);

  // Load categories and suppliers for the dropdowns whenever the modal opens
  useEffect(() => {
    if (isOpen) {
      categoryService.getAll().then(setCategories).catch(() => setCategories([]));
      supplierService.getAll().then(setSuppliers).catch(() => setSuppliers([]));
    }
  }, [isOpen]);

  // Pre-fill the form when editing, or reset it when adding new
  useEffect(() => {
    if (editingProduct) {
      setForm({
        product_name: editingProduct.product_name,
        product_code: editingProduct.product_code,
        category_id: editingProduct.category_id || '',
        supplier_id: editingProduct.supplier_id || '',
        description: editingProduct.description || '',
        purchase_price: editingProduct.purchase_price,
        selling_price: editingProduct.selling_price,
        quantity: editingProduct.quantity,
        minimum_stock_level: editingProduct.minimum_stock_level,
      });
    } else {
      setForm(emptyForm);
    }
    setError('');
  }, [editingProduct, isOpen]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.product_name.trim() || !form.product_code.trim()) {
      setError('Product name and product code are required.');
      return;
    }

    if (Number(form.purchase_price) < 0 || Number(form.selling_price) < 0) {
      setError('Prices cannot be negative.');
      return;
    }

    if (Number(form.quantity) < 0 || Number(form.minimum_stock_level) < 0) {
      setError('Stock values cannot be negative.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        product_name: form.product_name.trim(),
        product_code: form.product_code.trim(),
        category_id: form.category_id ? Number(form.category_id) : null,
        supplier_id: form.supplier_id ? Number(form.supplier_id) : null,
        description: form.description.trim(),
        purchase_price: Number(form.purchase_price) || 0,
        selling_price: Number(form.selling_price) || 0,
        quantity: Number(form.quantity) || 0,
        minimum_stock_level: Number(form.minimum_stock_level) || 5,
      };
      await onSave(payload);
      onClose();
    } catch (err) {
      const message = err.response?.data?.error || 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? 'Edit Product' : 'Add Product'}>
      {error && <div className="form-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label className="form-label" htmlFor="product_name">Product Name</label>
          <input
            id="product_name"
            type="text"
            className="form-input"
            value={form.product_name}
            onChange={handleChange('product_name')}
            placeholder="e.g. Wireless Mouse"
            autoFocus
          />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="product_code">Product Code / SKU</label>
          <input
            id="product_code"
            type="text"
            className="form-input"
            value={form.product_code}
            onChange={handleChange('product_code')}
            placeholder="e.g. WM-001"
            disabled={isEditMode}
          />
          {isEditMode && (
            <small style={{ color: '#9CA3AF', fontSize: '0.75rem' }}>
              Product code can't be changed after creation.
            </small>
          )}
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="category_id">Category</label>
          <select
            id="category_id"
            className="form-input"
            value={form.category_id}
            onChange={handleChange('category_id')}
          >
            <option value="">— No category —</option>
            {categories.map((cat) => (
              <option key={cat.category_id} value={cat.category_id}>
                {cat.category_name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="supplier_id">Supplier</label>
          <select
            id="supplier_id"
            className="form-input"
            value={form.supplier_id}
            onChange={handleChange('supplier_id')}
          >
            <option value="">— No supplier —</option>
            {suppliers.map((sup) => (
              <option key={sup.supplier_id} value={sup.supplier_id}>
                {sup.supplier_name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="description">Description</label>
          <textarea
            id="description"
            className="form-input"
            value={form.description}
            onChange={handleChange('description')}
            rows={2}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' }}>
          <div className="form-field">
            <label className="form-label" htmlFor="purchase_price">Purchase Price</label>
            <input
              id="purchase_price"
              type="number"
              min="0"
              step="0.01"
              className="form-input"
              value={form.purchase_price}
              onChange={handleChange('purchase_price')}
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="selling_price">Selling Price</label>
            <input
              id="selling_price"
              type="number"
              min="0"
              step="0.01"
              className="form-input"
              value={form.selling_price}
              onChange={handleChange('selling_price')}
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="quantity">
              {isEditMode ? 'Quantity' : 'Starting Quantity'}
            </label>
            <input
              id="quantity"
              type="number"
              min="0"
              className="form-input"
              value={form.quantity}
              onChange={handleChange('quantity')}
              disabled={isEditMode}
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="minimum_stock_level">Min. Stock Level</label>
            <input
              id="minimum_stock_level"
              type="number"
              min="0"
              className="form-input"
              value={form.minimum_stock_level}
              onChange={handleChange('minimum_stock_level')}
            />
          </div>
        </div>

        {isEditMode && (
          <small style={{ color: '#9CA3AF', fontSize: '0.75rem', display: 'block', marginTop: '-0.5rem', marginBottom: '1rem' }}>
            Quantity is managed through Stock In/Out in the Inventory module — coming in a later step.
          </small>
        )}

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Add Product'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
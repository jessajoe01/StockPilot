import { useState, useEffect } from 'react';
import Modal from './Modal';

const emptyForm = {
  supplier_name: '',
  company_name: '',
  email: '',
  phone: '',
  address: '',
  gst_number: '',
};

export default function SupplierFormModal({ isOpen, onClose, onSave, editingSupplier }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = Boolean(editingSupplier);

  useEffect(() => {
    if (editingSupplier) {
      setForm({
        supplier_name: editingSupplier.supplier_name || '',
        company_name: editingSupplier.company_name || '',
        email: editingSupplier.email || '',
        phone: editingSupplier.phone || '',
        address: editingSupplier.address || '',
        gst_number: editingSupplier.gst_number || '',
      });
    } else {
      setForm(emptyForm);
    }
    setError('');
  }, [editingSupplier, isOpen]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.supplier_name.trim()) {
      setError('Supplier name is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) {
      const message = err.response?.data?.error || 'Something went wrong. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? 'Edit Supplier' : 'Add Supplier'}>
      {error && <div className="form-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label className="form-label" htmlFor="supplier_name">Supplier Name</label>
          <input
            id="supplier_name"
            type="text"
            className="form-input"
            value={form.supplier_name}
            onChange={handleChange('supplier_name')}
            placeholder="e.g. Ramesh Kumar"
            autoFocus
          />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="company_name">Company Name</label>
          <input
            id="company_name"
            type="text"
            className="form-input"
            value={form.company_name}
            onChange={handleChange('company_name')}
            placeholder="e.g. ABC Traders Pvt Ltd"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.9rem' }}>
          <div className="form-field">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="form-input"
              value={form.email}
              onChange={handleChange('email')}
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="phone">Phone</label>
            <input
              id="phone"
              type="text"
              className="form-input"
              value={form.phone}
              onChange={handleChange('phone')}
            />
          </div>
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="address">Address</label>
          <textarea
            id="address"
            className="form-input"
            value={form.address}
            onChange={handleChange('address')}
            rows={2}
          />
        </div>

        <div className="form-field">
          <label className="form-label" htmlFor="gst_number">GST Number</label>
          <input
            id="gst_number"
            type="text"
            className="form-input"
            value={form.gst_number}
            onChange={handleChange('gst_number')}
            placeholder="Optional"
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Add Supplier'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
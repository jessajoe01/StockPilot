import { useState, useEffect } from 'react';
import Modal from './Modal';

const emptyForm = {
  customer_name: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
};

export default function CustomerFormModal({ isOpen, onClose, onSave, editingCustomer }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = Boolean(editingCustomer);

  useEffect(() => {
    if (editingCustomer) {
      setForm({
        customer_name: editingCustomer.customer_name || '',
        email: editingCustomer.email || '',
        phone: editingCustomer.phone || '',
        address: editingCustomer.address || '',
        city: editingCustomer.city || '',
        state: editingCustomer.state || '',
        pincode: editingCustomer.pincode || '',
      });
    } else {
      setForm(emptyForm);
    }
    setError('');
  }, [editingCustomer, isOpen]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.customer_name.trim()) {
      setError('Customer name is required.');
      return;
    }

    if (form.phone && !/^\d{10}$/.test(form.phone)) {
        setError('Phone number must contain 10 digits.');
        return;
    }

    if (form.pincode && !/^\d{6}$/.test(form.pincode)) {
        setError('Pincode must contain 6 digits.');
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
    <Modal isOpen={isOpen} onClose={onClose} title={isEditMode ? 'Edit Customer' : 'Add Customer'}>
      {error && <div className="form-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label className="form-label" htmlFor="customer_name">Customer Name</label>
          <input
            id="customer_name"
            type="text"
            className="form-input"
            value={form.customer_name}
            onChange={handleChange('customer_name')}
            placeholder="e.g. Priya Sharma"
            autoFocus
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
              type="tel"
              className="form-input"
              value={form.phone}
              onChange={handleChange('phone')}
              placeholder="10-digit number"
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.9rem' }}>
          <div className="form-field">
            <label className="form-label" htmlFor="city">City</label>
            <input
              id="city"
              type="text"
              className="form-input"
              value={form.city}
              onChange={handleChange('city')}
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="state">State</label>
            <input
              id="state"
              type="text"
              className="form-input"
              value={form.state}
              onChange={handleChange('state')}
            />
          </div>

          <div className="form-field">
            <label className="form-label" htmlFor="pincode">Pincode</label>
            <input
              id="pincode"
              type="text"
              inputMode="numeric"
              maxLength="6"
              className="form-input"
              value={form.pincode}
              onChange={handleChange('pincode')}
              placeholder="6-digit code"
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Add Customer'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
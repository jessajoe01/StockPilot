import { useState, useEffect, useCallback } from 'react';
import AppLayout from '../components/AppLayout';
import CustomerFormModal from '../components/CustomerFormModal';
import { customerService } from '../services/customerService';
import './Shared.css';

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [pageError, setPageError] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);

  const loadCustomers = useCallback(async (search, status) => {
    setIsLoading(true);
    setPageError('');
    try {
      const data = await customerService.getAll({ search, status });
      setCustomers(data);
    } catch (err) {
      setPageError('Could not load customers. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCustomers('', '');
  }, [loadCustomers]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCustomers(searchTerm, statusFilter);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter, loadCustomers]);

  const handleAddClick = () => {
    setEditingCustomer(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (customer) => {
    setEditingCustomer(customer);
    setIsFormOpen(true);
  };

  const handleSave = async (formData) => {
    if (editingCustomer) {
      await customerService.update(editingCustomer.customer_id, formData);
    } else {
      await customerService.create(formData);
    }
    loadCustomers(searchTerm, statusFilter);
  };

  const handleDelete = async (customer) => {
    const confirmed = window.confirm(`Delete "${customer.customer_name}"? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await customerService.remove(customer.customer_id);
      loadCustomers(searchTerm, statusFilter);
    } catch (err) {
      alert(err.response?.data?.error || 'Could not delete this customer.');
    }
  };

  const handleToggleStatus = async (customer) => {
    try {
      await customerService.toggleStatus(customer.customer_id);
      loadCustomers(searchTerm, statusFilter);
    } catch (err) {
      alert('Could not update status.');
    }
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">Manage who you sell to</p>
        </div>
        <button className="btn-primary" onClick={handleAddClick}>+ Add Customer</button>
      </div>

      <div className="page-toolbar">
        <input
          type="text"
          className="search-input"
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

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
      </div>

      <div className="data-table-wrapper">
        {isLoading ? (
          <div className="empty-state">Loading...</div>
        ) : pageError ? (
          <div className="empty-state">{pageError}</div>
        ) : customers.length === 0 ? (
          <div className="empty-state">No customers found. Click "Add Customer" to create one.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Phone</th>
                <th>Email</th>
                <th>City</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.customer_id}>
                  <td>{customer.customer_name}</td>
                  <td>{customer.phone || '—'}</td>
                  <td>{customer.email || '—'}</td>
                  <td>{customer.city || '—'}</td>
                  <td>
                    <span className={`status-badge ${customer.status === 'Active' ? 'active' : 'inactive'}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="icon-btn" onClick={() => handleEditClick(customer)}>Edit</button>
                      <button className="icon-btn" onClick={() => handleToggleStatus(customer)}>
                        {customer.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button className="icon-btn danger" onClick={() => handleDelete(customer)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <CustomerFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        editingCustomer={editingCustomer}
      />
    </AppLayout>
  );
}
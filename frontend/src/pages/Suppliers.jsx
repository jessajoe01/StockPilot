import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import SupplierFormModal from '../components/SupplierFormModal';
import SupplierHistoryModal from '../components/SupplierHistoryModal';
import { supplierService } from '../services/supplierService';
import './Shared.css';

export default function Suppliers() {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageError, setPageError] = useState('');

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historySupplier, setHistorySupplier] = useState(null);

  const loadSuppliers = useCallback(async (search) => {
    setIsLoading(true);
    setPageError('');
    try {
      const data = await supplierService.getAll(search);
      setSuppliers(data);
    } catch (err) {
      setPageError('Could not load suppliers. Is the backend running?');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSuppliers('');
  }, [loadSuppliers]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadSuppliers(searchTerm);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm, loadSuppliers]);

  const handleAddClick = () => {
    setEditingSupplier(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (supplier) => {
    setEditingSupplier(supplier);
    setIsFormOpen(true);
  };

  const handleSave = async (formData) => {
    if (editingSupplier) {
      await supplierService.update(editingSupplier.supplier_id, formData);
    } else {
      await supplierService.create(formData);
    }
    loadSuppliers(searchTerm);
  };

  const handleDelete = async (supplier) => {
    const confirmed = window.confirm(`Delete "${supplier.supplier_name}"? This cannot be undone.`);
    if (!confirmed) return;

    try {
      await supplierService.remove(supplier.supplier_id);
      loadSuppliers(searchTerm);
    } catch (err) {
      alert(err.response?.data?.error || 'Could not delete this supplier.');
    }
  };

  const handleToggleStatus = async (supplier) => {
    try {
      await supplierService.toggleStatus(supplier.supplier_id);
      loadSuppliers(searchTerm);
    } catch (err) {
      alert('Could not update status.');
    }
  };

  const handleViewHistory = (supplier) => {
    setHistorySupplier(supplier);
    setIsHistoryOpen(true);
  };

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h1 className="page-title">Suppliers</h1>
          <p className="page-subtitle">Manage who supplies your products</p>
        </div>
        <button className="btn-primary" onClick={handleAddClick}>+ Add Supplier</button>
      </div>

      <div className="page-toolbar">
        <input
          type="text"
          className="search-input"
          placeholder="Search suppliers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="data-table-wrapper">
        {isLoading ? (
          <div className="empty-state">Loading...</div>
        ) : pageError ? (
          <div className="empty-state">{pageError}</div>
        ) : suppliers.length === 0 ? (
          <div className="empty-state">No suppliers found. Click "Add Supplier" to create one.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Company</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier) => (
                <tr key={supplier.supplier_id}>
                  <td>{supplier.supplier_name}</td>
                  <td>{supplier.company_name || '—'}</td>
                  <td>{supplier.phone || '—'}</td>
                  <td>{supplier.email || '—'}</td>
                  <td>
                    <span className={`status-badge ${supplier.status === 'Active' ? 'active' : 'inactive'}`}>
                      {supplier.status}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="icon-btn" onClick={() => navigate(`/products?supplier_id=${supplier.supplier_id}`)}>
                        View Products
                      </button>
                      <button className="icon-btn" onClick={() => handleViewHistory(supplier)}>
                        View History
                      </button>
                      <button className="icon-btn" onClick={() => handleEditClick(supplier)}>Edit</button>
                      <button className="icon-btn" onClick={() => handleToggleStatus(supplier)}>
                        {supplier.status === 'Active' ? 'Deactivate' : 'Activate'}
                      </button>
                      <button className="icon-btn danger" onClick={() => handleDelete(supplier)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <SupplierFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={handleSave}
        editingSupplier={editingSupplier}
      />

      <SupplierHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        supplier={historySupplier}
      />
    </AppLayout>
  );
}
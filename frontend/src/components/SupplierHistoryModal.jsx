import { useState, useEffect } from 'react';
import Modal from './Modal';
import { supplierService } from '../services/supplierService';

export default function SupplierHistoryModal({ isOpen, onClose, supplier }) {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && supplier) {
      setIsLoading(true);
      supplierService.getHistory(supplier.supplier_id)
        .then(setHistory)
        .catch(() => setHistory([]))
        .finally(() => setIsLoading(false));
    }
  }, [isOpen, supplier]);

  const formatDate = (isoString) => {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleDateString('en-IN', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Stock History — ${supplier?.supplier_name || ''}`}>
      {isLoading ? (
        <div className="empty-state">Loading...</div>
      ) : history.length === 0 ? (
        <div className="empty-state">
          No stock transactions yet for this supplier's products.
          <br />
          Stock In entries will appear here once you start receiving stock (Inventory module).
        </div>
      ) : (
        <table className="data-table" style={{ fontSize: '0.825rem' }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Product</th>
              <th>Type</th>
              <th>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {history.map((entry) => (
              <tr key={entry.transaction_id}>
                <td>{formatDate(entry.transaction_date)}</td>
                <td>{entry.product_name}</td>
                <td>{entry.transaction_type}</td>
                <td>
                  {entry.transaction_type === 'Stock In' ? '+' : '-'}
                  {entry.quantity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </Modal>
  );
}
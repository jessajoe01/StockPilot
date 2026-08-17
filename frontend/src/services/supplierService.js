import api from './api';

export const supplierService = {
  getAll: async (searchTerm = '') => {
    const params = searchTerm ? { search: searchTerm } : {};
    const response = await api.get('/suppliers', { params });
    return response.data;
  },

  create: async (supplierData) => {
    const response = await api.post('/suppliers', supplierData);
    return response.data;
  },

  update: async (supplierId, supplierData) => {
    const response = await api.put(`/suppliers/${supplierId}`, supplierData);
    return response.data;
  },

  remove: async (supplierId) => {
    const response = await api.delete(`/suppliers/${supplierId}`);
    return response.data;
  },

  toggleStatus: async (supplierId) => {
    const response = await api.patch(`/suppliers/${supplierId}/toggle-status`);
    return response.data;
  },

  getHistory: async (supplierId) => {
    const response = await api.get(`/suppliers/${supplierId}/history`);
    return response.data;
  },
};
import api from './api';

export const customerService = {
  getAll: async (filters = {}) => {
    const params = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        params[key] = value;
      }
    });

    const response = await api.get('/customers', { params });
    return response.data;
  },

  create: async (customerData) => {
    const response = await api.post('/customers', customerData);
    return response.data;
  },

  update: async (customerId, customerData) => {
    const response = await api.put(`/customers/${customerId}`, customerData);
    return response.data;
  },

  remove: async (customerId) => {
    const response = await api.delete(`/customers/${customerId}`);
    return response.data;
  },

  toggleStatus: async (customerId) => {
    const response = await api.patch(`/customers/${customerId}/toggle-status`);
    return response.data;
  },
};
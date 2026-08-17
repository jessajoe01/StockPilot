import api from './api';

export const productService = {
  // filters can include: { search, category_id, supplier_id, status, low_stock }
  getAll: async (filters = {}) => {
    const params = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        params[key] = value;
      }
    });
    const response = await api.get('/products', { params });
    return response.data;
  },

  create: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  update: async (productId, productData) => {
    const response = await api.put(`/products/${productId}`, productData);
    return response.data;
  },

  remove: async (productId) => {
    const response = await api.delete(`/products/${productId}`);
    return response.data;
  },

  toggleStatus: async (productId) => {
    const response = await api.patch(`/products/${productId}/toggle-status`);
    return response.data;
  },
};
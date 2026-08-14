import api from './api';

// Every function here returns response.data directly, so pages
// don't need to know about axios's response object structure.

export const categoryService = {
  getAll: async (searchTerm = '') => {
    const params = searchTerm ? { search: searchTerm } : {};
    const response = await api.get('/categories', { params });
    return response.data;
  },

  create: async (categoryData) => {
    const response = await api.post('/categories', categoryData);
    return response.data;
  },

  update: async (categoryId, categoryData) => {
    const response = await api.put(`/categories/${categoryId}`, categoryData);
    return response.data;
  },

  remove: async (categoryId) => {
    const response = await api.delete(`/categories/${categoryId}`);
    return response.data;
  },

  toggleStatus: async (categoryId) => {
    const response = await api.patch(`/categories/${categoryId}/toggle-status`);
    return response.data;
  },
};
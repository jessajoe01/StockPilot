import axios from 'axios';

// The base URL of your Flask backend.
// Every request we make will start with this.
const API_BASE_URL = 'http://127.0.0.1:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// This runs automatically BEFORE every single request sent through 'api'.
// It checks if we have a saved login token, and if so, attaches it.
// This means we don't have to manually add the token to every single call.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('stockpilot_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('inventory_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('inventory_token');
      localStorage.removeItem('inventory_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const productService = {
  getAll: () => api.get('/products').then(res => res.data),
  getById: (id) => api.get(`/products/${id}`).then(res => res.data),
  create: (data) => api.post('/products', data).then(res => res.data),
  update: (id, data) => api.put(`/products/${id}`, data).then(res => res.data),
  delete: (id) => api.delete(`/products/${id}`).then(res => res.data),
};

export const salesService = {
  getAll: () => api.get('/sales').then(res => res.data.data),
  getById: (id) => api.get(`/sales/${id}`).then(res => res.data.data),
  create: (data) => api.post('/sales', data).then(res => res.data.data),
};

export const stockService = {
  getAll: () => api.get('/stock').then(res => res.data.data),
  add: (data) => api.post('/stock', data).then(res => res.data.data),
};

export const approvalService = {
  getAll: () => api.get('/approvals').then(res => res.data.data),
  process: (id, data) => api.put(`/approvals/${id}/process`, data).then(res => res.data.data),
};

export const reportService = {
  getDaily: () => api.get('/reports/daily').then(res => res.data.data),
  getMonthly: () => api.get('/reports/monthly').then(res => res.data.data),
  getStock: () => api.get('/reports/stock').then(res => res.data.data),
};

export default api;

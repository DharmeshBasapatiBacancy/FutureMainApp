import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect on 401 from backend (not on network error when backend is down)
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (accessToken) => api.post('/api/admin/auth/login', { accessToken }),
  verify: () => api.get('/api/admin/auth/verify'),
  logout: () => api.post('/api/admin/auth/logout'),
};

// Users API
export const usersAPI = {
  getAll: (params) => api.get('/api/admin/users', { params }),
  getById: (id) => api.get(`/api/admin/users/${id}`),
  update: (id, data) => api.put(`/api/admin/users/${id}`, data),
  delete: (id) => api.delete(`/api/admin/users/${id}`),
};

// Products API
export const productsAPI = {
  getAll: (params) => api.get('/api/admin/products', { params }),
  getById: (id) => api.get(`/api/admin/products/${id}`),
  create: (data) => api.post('/api/admin/products', data),
  update: (id, data) => api.put(`/api/admin/products/${id}`, data),
  delete: (id) => api.delete(`/api/admin/products/${id}`),
  approve: (id) => api.post(`/api/admin/products/${id}/approve`),
  reject: (id) => api.post(`/api/admin/products/${id}/reject`),
};

// Orders API
export const ordersAPI = {
  getAll: (params) => api.get('/api/admin/orders', { params }),
  getById: (id) => api.get(`/api/admin/orders/${id}`),
  update: (id, data) => api.put(`/api/admin/orders/${id}`, data),
};

// Customers API
export const customersAPI = {
  getAll: (params) => api.get('/api/admin/customers', { params }),
  getById: (id) => api.get(`/api/admin/customers/${id}`),
  update: (id, data) => api.put(`/api/admin/customers/${id}`, data),
  getOrders: (id, params) => api.get(`/api/admin/customers/${id}/orders`, { params }),
};

// Vendors API
export const vendorsAPI = {
  getAll: (params) => api.get('/api/admin/vendors', { params }),
  getById: (id) => api.get(`/api/admin/vendors/${id}`),
  create: (data) => api.post('/api/admin/vendors', data),
  update: (id, data) => api.put(`/api/admin/vendors/${id}`, data),
  delete: (id) => api.delete(`/api/admin/vendors/${id}`),
  getProducts: (id, params) => api.get(`/api/admin/vendors/${id}/products`, { params }),
  getOrders: (id, params) => api.get(`/api/admin/vendors/${id}/orders`, { params }),
};

// Categories API
export const categoriesAPI = {
  getAll: (params) => api.get('/api/admin/categories', { params }),
  getById: (id) => api.get(`/api/admin/categories/${id}`),
  create: (data) => api.post('/api/admin/categories', data),
  update: (id, data) => api.put(`/api/admin/categories/${id}`, data),
  delete: (id) => api.delete(`/api/admin/categories/${id}`),
};

// Dashboard stats (we'll create a combined endpoint or use existing ones)
export const dashboardAPI = {
  getStats: async () => {
    const [usersRes, productsRes, ordersRes] = await Promise.all([
      api.get('/api/admin/users', { params: { limit: 1 } }),
      api.get('/api/admin/products', { params: { limit: 1 } }),
      api.get('/api/admin/orders', { params: { limit: 1 } }),
    ]);
    
    return {
      totalUsers: usersRes.data.pagination?.total || 0,
      totalProducts: productsRes.data.pagination?.total || 0,
      totalOrders: ordersRes.data.pagination?.total || 0,
    };
  },
};

// Vendor API (uses vendorToken for /api/vendor/*)
const vendorApi = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});
vendorApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vendorToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (e) => Promise.reject(e)
);
vendorApi.interceptors.response.use(
  (r) => r,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('vendorToken');
      localStorage.removeItem('vendorUser');
      window.location.href = '/vendor-login';
    }
    return Promise.reject(error);
  }
);

export const vendorAPI = {
  auth: {
    login: (accessToken) => vendorApi.post('/api/vendor/auth/login', { accessToken }),
    verify: () => vendorApi.get('/api/vendor/auth/verify'),
    logout: () => vendorApi.post('/api/vendor/auth/logout'),
  },
  getMe: () => vendorApi.get('/api/vendor/me'),
  getProducts: (params) => vendorApi.get('/api/vendor/products', { params }),
   createProduct: (data) => vendorApi.post('/api/vendor/products', data),
  getOrders: (params) => vendorApi.get('/api/vendor/orders', { params }),
  getCategories: (params) => vendorApi.get('/api/vendor/categories', { params }),
};

export default api;


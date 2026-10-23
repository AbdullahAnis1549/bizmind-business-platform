import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bizmind_admin_token') || localStorage.getItem('bizmind_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle auth errors gracefully
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      if (window.location.pathname.startsWith('/admin')) {
        localStorage.removeItem('bizmind_admin_token');
        localStorage.removeItem('bizmind_admin_user');
        if (window.location.pathname !== '/admin') {
          window.location.href = '/admin';
        }
      } else {
        localStorage.removeItem('bizmind_token');
        localStorage.removeItem('bizmind_user');
        if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
          window.location.href = '/login';
        }
      }
    }
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred.';
    return Promise.reject(new Error(message));
  }
);

// Auth Service
export const authService = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  resendOTP: (data) => api.post('/auth/resend-otp', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Business Service
export const businessService = {
  onboard: (data) => api.post('/business/onboard', data),
  getBusiness: () => api.get('/business'),
  updateBusiness: (data) => api.put('/business', data),
};

// Customer Service
export const customerService = {
  getCustomers: (params) => api.get('/customers', { params }),
  getCustomerById: (id) => api.get(`/customers/${id}`),
  createCustomer: (data) => api.post('/customers', data),
  updateCustomer: (id, data) => api.put(`/customers/${id}`, data),
  deleteCustomer: (id) => api.delete(`/customers/${id}`),
};

// Product Service
export const productService = {
  getProducts: (params) => api.get('/products', { params }),
  getCategories: () => api.get('/products/categories'),
  getProductById: (id) => api.get(`/products/${id}`),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
};

// Order Service
export const orderService = {
  getOrders: (params) => api.get('/orders', { params }),
  getOrderById: (id) => api.get(`/orders/${id}`),
  createOrder: (data) => api.post('/orders', data),
  updateOrderStatus: (id, data) => api.put(`/orders/${id}/status`, data),
};

// Invoice Service
export const invoiceService = {
  getInvoices: (params) => api.get('/invoices', { params }),
  getInvoiceById: (id) => api.get(`/invoices/${id}`),
  createInvoice: (data) => api.post('/invoices', data),
  updateInvoiceStatus: (id, data) => api.put(`/invoices/${id}/status`, data),
  deleteInvoice: (id) => api.delete(`/invoices/${id}`),
};

// Analytics Service
export const analyticsService = {
  getDashboardKPIs: () => api.get('/analytics/dashboard'),
  getDetailedAnalytics: (params) => api.get('/analytics/detailed', { params }),
  getStaffSummary: () => api.get('/analytics/staff-summary'),
};

// AI Service
export const aiService = {
  chat: (question) => api.post('/ai/chat', { question }),
  getInsights: () => api.get('/ai/insights'),
  generateReport: (reportType) => api.post('/ai/report', { reportType }),
  generateContent: (data) => api.post('/ai/content', data),
  getStatus: () => api.get('/ai/status'),
};

// Team Service
export const teamService = {
  getTeamMembers: () => api.get('/team'),
  inviteMember: (data) => api.post('/team/invite', data),
  updateRole: (id, role) => api.put(`/team/${id}/role`, { role }),
  removeMember: (id) => api.delete(`/team/${id}`),
};

// Notification Service
export const notificationService = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
};

// Global Search
export const searchService = {
  search: (q) => api.get('/search', { params: { q } }),
};

// Super Admin Platform Service
export const adminService = {
  login: (data) => api.post('/admin/login', data),
  verifyOTP: (data) => api.post('/admin/verify-otp', data),
  resendOTP: (data) => api.post('/admin/resend-otp', data),
  getStats: () => api.get('/admin/stats'),
  getWorkspaces: (params) => api.get('/admin/workspaces', { params }),
  updateWorkspaceStatus: (id, status) => api.put(`/admin/workspaces/${id}/status`, { status }),
};

// Image Upload Service (Cloudinary & Local Fallback)
export const uploadService = {
  uploadImage: (file, folder = 'bizmind/avatars') => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post(`/upload?folder=${encodeURIComponent(folder)}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default api;



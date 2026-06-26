import axios from 'axios'
import Cookies from 'js-cookie'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Aumentado a 30 segundos
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // Add session ID for guest users
    const sessionId = localStorage.getItem('sessionId')
    if (sessionId) {
      config.headers['x-session-id'] = sessionId
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear invalid token
      Cookies.remove('token')
      localStorage.removeItem('user')
      
      // Redirect to login if not already there
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Generate session ID for guest users
export const generateSessionId = () => {
  const sessionId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  localStorage.setItem('sessionId', sessionId)
  return sessionId
}

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (data) => api.post('/auth/reset-password', data),
}

// Products API
export const productsAPI = {
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (slug) => api.get(`/products/${slug}`),
  getFeatured: () => api.get('/products/featured'),
  searchSuggestions: (query, limit = 10) => api.get('/products/search/suggestions', { params: { q: query, limit } }),
  getFilterOptions: () => api.get('/products/search/filters'),
  
  // Admin only
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  updateStock: (id, data) => api.patch(`/products/${id}/stock`, data),
}

// Categories API
export const categoriesAPI = {
  getCategories: () => api.get('/categories'),
  getCategory: (slug) => api.get(`/categories/${slug}`),
  
  // Admin only
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
}

// Cart API
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (data) => api.post('/cart/add', data),
  updateItem: (itemId, data) => api.put(`/cart/item/${itemId}`, data),
  removeItem: (itemId) => api.delete(`/cart/item/${itemId}`),
  clearCart: () => api.delete('/cart/clear'),
  mergeCart: (data) => api.post('/cart/merge', data),
}

// Orders API
export const ordersAPI = {
  getUserOrders: (params) => api.get('/orders/my-orders', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  createOrder: (data) => api.post('/orders', data),
  cancelOrder: (id) => api.patch(`/orders/${id}/cancel`),
  
  // Admin only
  getAllOrders: (params) => api.get('/orders', { params }),
  updateOrderStatus: (id, data) => api.patch(`/orders/${id}/status`, data),
}

// Payments API
export const paymentsAPI = {
  createPayment: (data) => api.post('/payments/create', data),
  getPaymentStatus: (orderId) => api.get(`/payments/status/${orderId}`),
  
  // Admin only
  processRefund: (orderId, data) => api.post(`/payments/refund/${orderId}`, data),
}

// Users API (Admin only)
export const usersAPI = {
  getUsers: (params) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getDashboardStats: () => api.get('/users/dashboard-stats'),
}

// Wishlist API
export const wishlistAPI = {
  getWishlist: () => api.get('/wishlist'),
  getWishlistCount: () => api.get('/wishlist/count'),
  isInWishlist: (productId) => api.get(`/wishlist/check/${productId}`),
  addToWishlist: (productId) => api.post('/wishlist/add', { productId }),
  removeFromWishlist: (productId) => api.delete(`/wishlist/remove/${productId}`),
  clearWishlist: () => api.delete('/wishlist/clear'),
  moveToCart: (productIds) => api.post('/wishlist/move-to-cart', { productIds }),
}

// Bank Accounts API
export const bankAccountsAPI = {
  getAll: () => api.get('/bank-accounts'),
  getActive: () => api.get('/bank-accounts/active'),
  create: (data) => api.post('/bank-accounts', data),
  update: (id, data) => api.put(`/bank-accounts/${id}`, data),
  setPrimary: (id) => api.patch(`/bank-accounts/${id}/set-primary`),
  delete: (id) => api.delete(`/bank-accounts/${id}`),
}

// Upload payment proof
export const uploadPaymentProof = (orderId, file) => {
  const formData = new FormData()
  formData.append('proof', file)
  return api.post(`/orders/${orderId}/payment-proof`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

export default api
import { create } from 'zustand'
import { useAuthStore } from './authStore'

// Re-export the auth store from authStore.js
export { useAuthStore }

// Cart Store
export const useCartStore = create((set, get) => ({
  items: [],
  isLoading: false,
  total: 0,
  itemCount: 0,
  
  setCart: (cartData) => {
    const items = cartData.CartItems || []
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
    const total = items.reduce((sum, item) => {
      const price = item.Product?.salePrice || item.Product?.price || item.price
      return sum + (price * item.quantity)
    }, 0)
    
    set({ items, itemCount, total })
  },
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  addItem: (item) => {
    const items = get().items
    const existingItem = items.find(i => 
      i.productId === item.productId && 
      JSON.stringify(i.attributes) === JSON.stringify(item.attributes)
    )
    
    if (existingItem) {
      get().updateQuantity(existingItem.id, existingItem.quantity + item.quantity)
    } else {
      set((state) => ({
        items: [...state.items, item]
      }))
    }
  },
  
  updateQuantity: (itemId, quantity) => {
    set((state) => ({
      items: state.items.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    }))
  },
  
  removeItem: (itemId) => {
    set((state) => ({
      items: state.items.filter(item => item.id !== itemId)
    }))
  },
  
  clearCart: () => {
    set({ items: [], total: 0, itemCount: 0 })
  }
}))

// UI Store
export const useUIStore = create((set) => ({
  mobileMenuOpen: false,
  cartSidebarOpen: false,
  searchQuery: '',
  
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  setCartSidebarOpen: (open) => set({ cartSidebarOpen: open }),
  setSearchQuery: (query) => set({ searchQuery: query }),
}))

// Products Store
export const useProductsStore = create((set, get) => ({
  products: [],
  featuredProducts: [],
  categories: [],
  filters: {
    category: '',
    search: '',
    minPrice: '',
    maxPrice: '',
    sortBy: 'createdAt',
    sortOrder: 'DESC',
  },
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12,
  },
  
  setProducts: (products) => set({ products }),
  setFeaturedProducts: (products) => set({ featuredProducts: products }),
  setCategories: (categories) => set({ categories }),
  
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters }
  })),
  
  setPagination: (pagination) => set({ pagination }),
  
  clearFilters: () => set({
    filters: {
      category: '',
      search: '',
      minPrice: '',
      maxPrice: '',
      sortBy: 'createdAt',
      sortOrder: 'DESC',
    }
  })
}))

// Admin Store
export const useAdminStore = create((set) => ({
  dashboardStats: null,
  orders: [],
  users: [],
  
  setDashboardStats: (stats) => set({ dashboardStats: stats }),
  setOrders: (orders) => set({ orders }),
  setUsers: (users) => set({ users }),
}))
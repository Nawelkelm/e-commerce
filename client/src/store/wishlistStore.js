import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { wishlistAPI } from '../services/api'
import toast from 'react-hot-toast'

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      wishlist: [],
      wishlistCount: 0,
      isLoading: false,

      // Load wishlist from API
      loadWishlist: async () => {
        try {
          set({ isLoading: true })
          const response = await wishlistAPI.getWishlist()
          set({ 
            wishlist: response.data.wishlist || [],
            wishlistCount: response.data.count || 0,
            isLoading: false
          })
        } catch (error) {
          // Si es timeout o error de red, usar datos locales sin mostrar error
          if (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK') {
            console.warn('Wishlist timeout, using local data')
          } else {
            console.error('Error loading wishlist:', error)
          }
          set({ isLoading: false })
        }
      },

      // Add product to wishlist
      addToWishlist: async (productId, productData = null) => {
        try {
          await wishlistAPI.addToWishlist(productId)
          
          // Optimistic update
          const newItem = {
            id: `temp-${Date.now()}`,
            productId,
            product: productData,
            addedAt: new Date().toISOString()
          }
          
          set((state) => ({
            wishlist: [newItem, ...state.wishlist],
            wishlistCount: state.wishlistCount + 1
          }))

          toast.success('Agregado a tu lista de deseos ❤️')
          
          // Reload to get actual data
          get().loadWishlist()
          
          return true
        } catch (error) {
          const message = error.response?.data?.message || 'Error al agregar a wishlist'
          toast.error(message)
          return false
        }
      },

      // Remove from wishlist
      removeFromWishlist: async (productId) => {
        try {
          await wishlistAPI.removeFromWishlist(productId)
          
          set((state) => ({
            wishlist: state.wishlist.filter(item => item.productId !== productId),
            wishlistCount: Math.max(0, state.wishlistCount - 1)
          }))

          toast.success('Eliminado de tu lista de deseos')
          return true
        } catch (error) {
          const message = error.response?.data?.message || 'Error al eliminar'
          toast.error(message)
          return false
        }
      },

      // Toggle wishlist (add or remove)
      toggleWishlist: async (productId, productData = null) => {
        const { wishlist } = get()
        const isInWishlist = wishlist.some(item => item.productId === productId)
        
        if (isInWishlist) {
          return await get().removeFromWishlist(productId)
        } else {
          return await get().addToWishlist(productId, productData)
        }
      },

      // Check if product is in wishlist
      isInWishlist: (productId) => {
        const { wishlist } = get()
        return wishlist.some(item => item.productId === productId)
      },

      // Clear wishlist
      clearWishlist: async () => {
        try {
          await wishlistAPI.clearWishlist()
          set({ wishlist: [], wishlistCount: 0 })
          toast.success('Lista de deseos vaciada')
          return true
        } catch (error) {
          toast.error('Error al vaciar lista')
          return false
        }
      },

      // Get wishlist count
      getWishlistCount: () => {
        return get().wishlistCount
      },

      // Reset wishlist (on logout)
      resetWishlist: () => {
        set({ wishlist: [], wishlistCount: 0 })
      }
    }),
    {
      name: 'wishlist-storage',
      partialize: (state) => ({
        // Only persist wishlist data, not loading state
        wishlist: state.wishlist,
        wishlistCount: state.wishlistCount
      })
    }
  )
)

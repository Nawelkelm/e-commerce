import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import Cookies from 'js-cookie'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      token: null,
      cart: [],

      setUser: (user) => set({ user, isAuthenticated: true }),
      setToken: (token) => set({ token }),
      
      login: (userData, token) => {
        // Guardar token en cookies
        Cookies.set('token', token, { expires: 7, path: '/' }) // 7 días
        
        set({ 
          user: userData, 
          token, 
          isAuthenticated: true 
        })
      },

      logout: () => {
        // Limpiar cookie
        Cookies.remove('token', { path: '/' })
        
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false,
          cart: []
        })
      },

      updateUser: (userData) => {
        set((state) => ({ 
          user: { ...state.user, ...userData } 
        }))
      },

      // Cart functionality
      addToCart: (product) => {
        const { cart } = get()
        const existingItem = cart.find(item => item.id === product.id)
        
        if (existingItem) {
          set({
            cart: cart.map(item =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
            )
          })
        } else {
          set({
            cart: [...cart, { ...product, quantity: 1 }]
          })
        }
      },

      removeFromCart: (productId) => {
        const { cart } = get()
        set({
          cart: cart.filter(item => item.id !== productId)
        })
      },

      updateCartQuantity: (productId, quantity) => {
        const { cart } = get()
        if (quantity <= 0) {
          get().removeFromCart(productId)
        } else {
          set({
            cart: cart.map(item =>
              item.id === productId
                ? { ...item, quantity }
                : item
            )
          })
        }
      },

      clearCart: () => {
        set({ cart: [] })
      },

      getCartTotal: () => {
        const { cart } = get()
        return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
      },

      getCartItemsCount: () => {
        const { cart } = get()
        return cart.reduce((count, item) => count + item.quantity, 0)
      },

      // Initialize auth from cookies
      initialize: async () => {
        const currentState = get()
        
        // Si ya hay usuario y token en el estado (de localStorage), verificar que siga siendo válido
        if (currentState.isAuthenticated && currentState.token && currentState.user) {
          // Verificar que el token de las cookies coincida
          const cookieToken = Cookies.get('token')
          if (cookieToken && cookieToken === currentState.token) {
            return // Mantener el estado actual
          }
        }
        
        try {
          // Obtener token de las cookies usando js-cookie
          const token = Cookies.get('token')
          
          if (token) {
            set({ token })
            
            // Verificar que el token sea válido obteniendo el perfil del usuario
            try {
              const response = await fetch('/api/auth/profile', {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              })
              
              if (response.ok) {
                const userData = await response.json()
                set({ 
                  user: userData.user || userData, 
                  isAuthenticated: true,
                  token 
                })
              } else {
                // Token inválido, limpiar datos
                Cookies.remove('token', { path: '/' })
                set({ 
                  user: null, 
                  token: null, 
                  isAuthenticated: false 
                })
              }
            } catch (error) {
              // En caso de error, limpiar estado
              Cookies.remove('token', { path: '/' })
              set({ 
                user: null, 
                token: null, 
                isAuthenticated: false 
              })
            }
          } else {
            set({ 
              user: null, 
              token: null, 
              isAuthenticated: false 
            })
          }
        } catch (error) {
          console.error('Error initializing auth:', error)
        }
      },

      // Verificar estado de autenticación periódicamente
      checkAuthStatus: () => {
        const { isAuthenticated } = get()
        const token = Cookies.get('token')
        
        // Si debería estar autenticado pero no hay token, logout
        if (isAuthenticated && !token) {
          set({ 
            user: null, 
            token: null, 
            isAuthenticated: false 
          })
        }
        
        // Si hay token pero no está marcado como autenticado, reinicializar
        if (!isAuthenticated && token) {
          get().initialize()
        }
      },
    }),
    {
      name: 'auth-store',
      getStorage: () => localStorage,
      partialize: (state) => ({ 
        cart: state.cart,
        // También persistir el estado de auth para evitar recargas
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)
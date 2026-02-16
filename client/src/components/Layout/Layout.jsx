import React, { useState, useEffect } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { ShoppingCartIcon, HeartIcon } from '@heroicons/react/24/outline'
import { useAuthStore } from '../../store/authStore'
import { useWishlistStore } from '../../store/wishlistStore'
import ThemeToggle from '../Theme/ThemeToggle'
import SearchBar from '../Search/SearchBar'
import Footer from './Footer'

const Layout = () => {
  const navigate = useNavigate()
  const { isAuthenticated, user, logout, getCartItemsCount } = useAuthStore()
  const { getWishlistCount, loadWishlist } = useWishlistStore()
  const cartItemsCount = getCartItemsCount()
  const wishlistCount = getWishlistCount()
  const [settings, setSettings] = useState({ site_name: 'E-Commerce', site_logo: '' })

  // Load public settings and wishlist
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings/public')
        if (response.ok) {
          const data = await response.json()
          setSettings(data)
          
          // Update favicon if exists
          if (data.site_favicon) {
            updateFavicon(data.site_favicon)
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    }
    loadSettings()
    
    // Load wishlist if authenticated
    if (isAuthenticated) {
      loadWishlist()
    }
  }, [isAuthenticated, loadWishlist])

  const updateFavicon = (faviconUrl) => {
    // Remove existing favicon links
    const existingLinks = document.querySelectorAll("link[rel*='icon']")
    existingLinks.forEach(link => link.remove())
    
    // Add new favicon link
    const link = document.createElement('link')
    link.rel = 'icon'
    link.href = faviconUrl
    document.head.appendChild(link)
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-24">
            <div className="flex items-center">
              <Link to="/" className="flex-shrink-0 flex items-center">
                {settings.site_logo ? (
                  <img 
                    src={settings.site_logo} 
                    alt={settings.site_name || 'E-Commerce'} 
                    className="h-20 w-auto"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'block'
                    }}
                  />
                ) : null}
                <h1 
                  className="text-xl font-bold text-indigo-600 dark:text-indigo-400" 
                  style={{ display: settings.site_logo ? 'none' : 'block' }}
                >
                  {settings.site_name || 'E-Commerce'}
                </h1>
              </Link>
              <div className="hidden md:block ml-10">
                <div className="flex items-baseline space-x-4">
                  <Link to="/" className="text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 text-sm font-medium">
                    Inicio
                  </Link>
                  <Link to="/productos" className="text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 text-sm font-medium">
                    Productos
                  </Link>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Search Bar con Autocomplete */}
              <div className="hidden lg:flex items-center">
                <SearchBar 
                  placeholder="Buscar productos..." 
                  className="w-80"
                />
              </div>

              {/* Theme Toggle */}
              <ThemeToggle />
              
              {/* Wishlist */}
              {isAuthenticated && (
                <Link to="/wishlist" className="relative text-gray-900 dark:text-gray-100 hover:text-red-600 dark:hover:text-red-400 p-2" title="Lista de deseos">
                  <HeartIcon className="h-6 w-6" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-600 text-white text-xs rounded-full flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              )}
              
              {/* Carrito */}
              <Link to="/carrito" className="relative text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 p-2">
                <ShoppingCartIcon className="h-6 w-6" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 bg-indigo-600 text-white text-xs rounded-full flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </Link>

              {/* Navegación según estado de autenticación */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <span className="text-gray-700 dark:text-gray-300 text-sm">
                    Hola, {user?.firstName}
                  </span>
                  <Link to="/perfil" className="text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-medium">
                    Perfil
                  </Link>
                  <Link to="/pedidos" className="text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-medium">
                    Pedidos
                  </Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin" className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 text-sm font-medium">
                      Admin
                    </Link>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-medium"
                  >
                    Salir
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link to="/login" className="text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 text-sm font-medium">
                    Iniciar Sesión
                  </Link>
                  <Link to="/registro" className="bg-indigo-600 dark:bg-indigo-500 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 dark:hover:bg-indigo-600">
                    Registrarse
                  </Link>
                </div>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Main content */}
      <main>
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default Layout
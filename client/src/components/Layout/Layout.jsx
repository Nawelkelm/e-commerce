import React, { useState, useEffect } from 'react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { ShoppingCartIcon, HeartIcon, Bars3Icon, XMarkIcon, UserCircleIcon } from '@heroicons/react/24/outline'
import { useAuthStore } from '../../store/authStore'
import { useWishlistStore } from '../../store/wishlistStore'
import ThemeToggle from '../Theme/ThemeToggle'
import SearchBar from '../Search/SearchBar'
import Footer from './Footer'

const Layout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, user, logout, getCartItemsCount } = useAuthStore()
  const { getWishlistCount, loadWishlist } = useWishlistStore()
  const cartItemsCount = getCartItemsCount()
  const wishlistCount = getWishlistCount()
  const [settings, setSettings] = useState({ site_name: 'TiendaKit', site_logo: '' })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/settings/public')
        if (response.ok) {
          const data = await response.json()
          setSettings(data)
          if (data.site_favicon) updateFavicon(data.site_favicon)
        }
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    }
    loadSettings()
    if (isAuthenticated) loadWishlist()
  }, [isAuthenticated, loadWishlist])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMobileMenuOpen(false) }, [location.pathname])

  const updateFavicon = (faviconUrl) => {
    document.querySelectorAll("link[rel*='icon']").forEach(l => l.remove())
    const link = document.createElement('link')
    link.rel = 'icon'
    link.href = faviconUrl
    document.head.appendChild(link)
  }

  const handleLogout = () => { logout(); navigate('/') }

  const navLinks = [
    { to: '/', label: 'Inicio' },
    { to: '/productos', label: 'Productos' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 dark:bg-surface-950">
      {/* Header */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'glass shadow-sm'
          : 'bg-white/95 dark:bg-surface-900/95 backdrop-blur-sm'
      } border-b border-surface-200/60 dark:border-surface-700/40`}>
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo + nav */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                {settings.site_logo ? (
                  <img
                    src={settings.site_logo}
                    alt={settings.site_name || 'TiendaKit'}
                    className="h-9 w-auto"
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block' }}
                  />
                ) : null}
                <span
                  className="text-xl font-bold text-gradient"
                  style={{ display: settings.site_logo ? 'none' : 'block' }}
                >
                  {settings.site_name || 'TiendaKit'}
                </span>
              </Link>

              <div className="hidden md:flex items-center gap-1">
                {navLinks.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(to)
                        ? 'text-primary-700 bg-primary-50 dark:text-primary-300 dark:bg-primary-950/50'
                        : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:text-white hover:bg-surface-100 dark:bg-surface-800 dark:text-surface-300 dark:hover:text-surface-100 dark:hover:bg-surface-800'
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden lg:flex">
                <SearchBar placeholder="Buscar productos..." className="w-72" />
              </div>

              <ThemeToggle />

              {isAuthenticated && (
                <Link to="/wishlist" className="relative p-2 rounded-lg text-surface-500 dark:text-surface-400 hover:text-rose-500 hover:bg-surface-100 dark:bg-surface-800 dark:hover:bg-surface-800 transition-colors" title="Lista de deseos">
                  <HeartIcon className="h-5 w-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              )}

              <Link to="/carrito" className="relative p-2 rounded-lg text-surface-500 dark:text-surface-400 hover:text-primary-600 hover:bg-surface-100 dark:bg-surface-800 dark:hover:bg-surface-800 transition-colors">
                <ShoppingCartIcon className="h-5 w-5" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-primary-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </Link>

              {/* Desktop user nav */}
              <div className="hidden md:flex items-center gap-2">
                {isAuthenticated ? (
                  <>
                    <Link to="/perfil" className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:text-white hover:bg-surface-100 dark:bg-surface-800 dark:text-surface-300 dark:hover:text-surface-100 dark:hover:bg-surface-800 transition-colors">
                      <UserCircleIcon className="h-5 w-5" />
                      {user?.firstName}
                    </Link>
                    {user?.role === 'admin' && (
                      <Link to="/admin" className="px-3 py-1.5 rounded-lg text-sm font-medium text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-primary-950/50 transition-colors">
                        Admin
                      </Link>
                    )}
                    <button onClick={handleLogout} className="px-3 py-1.5 rounded-lg text-sm font-medium text-surface-500 dark:text-surface-400 hover:text-surface-900 dark:text-white hover:bg-surface-100 dark:bg-surface-800 dark:text-surface-400 dark:hover:text-surface-100 dark:hover:bg-surface-800 transition-colors">
                      Salir
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="px-3 py-1.5 rounded-lg text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:text-white hover:bg-surface-100 dark:bg-surface-800 dark:text-surface-300 dark:hover:text-surface-100 dark:hover:bg-surface-800 transition-colors">
                      Iniciar Sesión
                    </Link>
                    <Link to="/registro" className="btn-primary btn-sm">
                      Registrarse
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:bg-surface-800 dark:hover:bg-surface-800 transition-colors"
              >
                {mobileMenuOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 dark:bg-surface-900 animate-slide-up">
            <div className="px-4 py-3 space-y-1">
              <div className="pb-3">
                <SearchBar placeholder="Buscar..." className="w-full" />
              </div>
              {navLinks.map(({ to, label }) => (
                <Link key={to} to={to} className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive(to)
                    ? 'text-primary-700 bg-primary-50 dark:text-primary-300 dark:bg-primary-950/50'
                    : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-800'
                }`}>
                  {label}
                </Link>
              ))}
              {isAuthenticated ? (
                <>
                  <Link to="/perfil" className="block px-3 py-2 rounded-lg text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-800">
                    Mi Perfil
                  </Link>
                  <Link to="/pedidos" className="block px-3 py-2 rounded-lg text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:bg-surface-800 dark:text-surface-300 dark:hover:bg-surface-800">
                    Mis Pedidos
                  </Link>
                  {user?.role === 'admin' && (
                    <Link to="/admin" className="block px-3 py-2 rounded-lg text-sm font-medium text-primary-600 dark:text-primary-400">
                      Panel Admin
                    </Link>
                  )}
                  <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:bg-surface-800 dark:text-surface-400 dark:hover:bg-surface-800">
                    Cerrar Sesión
                  </button>
                </>
              ) : (
                <div className="flex gap-2 pt-2">
                  <Link to="/login" className="btn-outline flex-1 text-center">Iniciar Sesión</Link>
                  <Link to="/registro" className="btn-primary flex-1 text-center">Registrarse</Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="animate-fade-in">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

export default Layout

import React, { useState, useEffect, useRef } from 'react'
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
  const [cartBumped, setCartBumped] = useState(false)
  const prevCartCount = useRef(cartItemsCount)

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

  useEffect(() => {
    if (cartItemsCount > prevCartCount.current) {
      setCartBumped(true)
      const t = setTimeout(() => setCartBumped(false), 450)
      return () => clearTimeout(t)
    }
    prevCartCount.current = cartItemsCount
  }, [cartItemsCount])

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
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
      {/* Header — siempre verde oscuro, identidad de marca */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-primary-950/95 backdrop-blur-md shadow-lg shadow-black/25' : 'bg-primary-900'
      } border-b border-primary-800`}>

        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo + nav */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                {settings.site_logo ? (
                  <img
                    src={settings.site_logo}
                    alt={settings.site_name || 'TiendaKit'}
                    className="h-8 w-auto brightness-0 invert"
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'block' }}
                  />
                ) : null}
                <span
                  className="text-xl font-bold text-white tracking-tight"
                  style={{ display: settings.site_logo ? 'none' : 'block' }}
                >
                  {settings.site_name || 'Tienda'}
                  <span className="text-accent-400">Kit</span>
                </span>
              </Link>

              <div className="hidden md:flex items-center gap-0.5">
                {navLinks.map(({ to, label }) => (
                  <Link
                    key={to}
                    to={to}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive(to)
                        ? 'text-white bg-primary-700/70'
                        : 'text-primary-200 hover:text-white hover:bg-primary-800/60'
                    }`}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="hidden lg:flex">
                <SearchBar placeholder="Buscar productos..." className="w-64" variant="dark" />
              </div>

              <ThemeToggle variant="dark" />

              {isAuthenticated && (
                <Link
                  to="/wishlist"
                  className="relative p-2 rounded-lg text-primary-200 hover:text-rose-400 hover:bg-primary-800/60 transition-colors"
                  title="Lista de deseos"
                >
                  <HeartIcon className="h-5 w-5" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                      {wishlistCount}
                    </span>
                  )}
                </Link>
              )}

              <Link
                to="/carrito"
                className="relative p-2 rounded-lg text-primary-200 hover:text-white hover:bg-primary-800/60 transition-colors"
              >
                <ShoppingCartIcon className="h-5 w-5" />
                {cartItemsCount > 0 && (
                  <span className={`absolute -top-0.5 -right-0.5 h-4 w-4 bg-accent-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ${cartBumped ? 'cart-badge-bump' : ''}`}>
                    {cartItemsCount}
                  </span>
                )}
              </Link>

              {/* Desktop user nav */}
              <div className="hidden md:flex items-center gap-1">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/perfil"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-primary-200 hover:text-white hover:bg-primary-800/60 transition-colors"
                    >
                      <UserCircleIcon className="h-4 w-4" />
                      {user?.firstName}
                    </Link>
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        className="px-3 py-1.5 rounded-lg text-sm font-medium text-accent-300 hover:text-accent-200 hover:bg-primary-800/60 transition-colors"
                      >
                        Admin
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="px-3 py-1.5 rounded-lg text-sm font-medium text-primary-300 hover:text-white hover:bg-primary-800/60 transition-colors"
                    >
                      Salir
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="px-3 py-1.5 rounded-lg text-sm font-medium text-primary-200 hover:text-white hover:bg-primary-800/60 transition-colors"
                    >
                      Iniciar sesión
                    </Link>
                    <Link
                      to="/registro"
                      className="inline-flex items-center px-4 py-1.5 bg-accent-500 hover:bg-accent-600 text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                      Registrarse
                    </Link>
                  </>
                )}
              </div>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg text-primary-200 hover:text-white hover:bg-primary-800/60 transition-colors"
              >
                {mobileMenuOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile menu — mismo tono oscuro */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-primary-800 bg-primary-900 animate-slide-up">
            <div className="px-4 py-3 space-y-0.5">
              <div className="pb-3">
                <SearchBar placeholder="Buscar..." className="w-full" variant="dark" />
              </div>
              {navLinks.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive(to)
                      ? 'text-white bg-primary-700/70'
                      : 'text-primary-200 hover:text-white hover:bg-primary-800/60'
                  }`}
                >
                  {label}
                </Link>
              ))}
              <div className="pt-2 border-t border-primary-800 mt-2">
                {isAuthenticated ? (
                  <>
                    <Link to="/perfil" className="block px-3 py-2 rounded-lg text-sm font-medium text-primary-200 hover:text-white hover:bg-primary-800/60 transition-colors">
                      Mi Perfil
                    </Link>
                    <Link to="/pedidos" className="block px-3 py-2 rounded-lg text-sm font-medium text-primary-200 hover:text-white hover:bg-primary-800/60 transition-colors">
                      Mis Pedidos
                    </Link>
                    {user?.role === 'admin' && (
                      <Link to="/admin" className="block px-3 py-2 rounded-lg text-sm font-medium text-accent-300 hover:text-accent-200 hover:bg-primary-800/60 transition-colors">
                        Panel Admin
                      </Link>
                    )}
                    <button onClick={handleLogout} className="block w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-primary-300 hover:text-white hover:bg-primary-800/60 transition-colors">
                      Cerrar Sesión
                    </button>
                  </>
                ) : (
                  <div className="flex gap-2 py-1">
                    <Link to="/login" className="flex-1 text-center px-3 py-2 rounded-lg text-sm font-medium text-primary-200 border border-primary-700 hover:border-primary-500 hover:text-white transition-colors">
                      Iniciar sesión
                    </Link>
                    <Link to="/registro" className="flex-1 text-center px-3 py-2 rounded-lg text-sm font-semibold bg-accent-500 hover:bg-accent-600 text-white transition-colors">
                      Registrarse
                    </Link>
                  </div>
                )}
              </div>
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

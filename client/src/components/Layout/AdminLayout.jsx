import React, { useState } from 'react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import ThemeToggle from '../Theme/ThemeToggle'
import {
  HomeIcon,
  ShoppingBagIcon,
  UsersIcon,
  ChartBarIcon,
  CogIcon,
  TagIcon,
  FolderIcon,
  TicketIcon,
  TruckIcon,
  ClipboardDocumentListIcon,
  ShieldCheckIcon,
  PaintBrushIcon,
  EnvelopeIcon,
  StarIcon,
  DocumentTextIcon,
  KeyIcon,
  BuildingLibraryIcon,
  ArrowRightOnRectangleIcon as LogoutIcon,
  Bars3Icon as MenuIcon,
  XMarkIcon as XIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline'

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => { logout(); navigate('/') }

  const navGroups = [
    {
      label: 'General',
      items: [
        { name: 'Dashboard', href: '/admin', icon: HomeIcon },
        { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
      ]
    },
    {
      label: 'Catálogo',
      items: [
        { name: 'Productos', href: '/admin/productos', icon: ShoppingBagIcon },
        { name: 'Categorías', href: '/admin/categorias', icon: FolderIcon },
        { name: 'Stock', href: '/admin/stock', icon: TagIcon },
        { name: 'Proveedores', href: '/admin/proveedores', icon: TruckIcon },
      ]
    },
    {
      label: 'Ventas',
      items: [
        { name: 'Pedidos', href: '/admin/pedidos', icon: ClipboardDocumentListIcon },
        { name: 'Cupones', href: '/admin/cupones', icon: TicketIcon },
        { name: 'Facturas', href: '/admin/facturas', icon: DocumentTextIcon },
        { name: 'AFIP', href: '/admin/afip', icon: ShieldCheckIcon },
        { name: 'Cuentas Bancarias', href: '/admin/cuentas-bancarias', icon: BuildingLibraryIcon },
      ]
    },
    {
      label: 'Envíos',
      items: [
        { name: 'Envíos', href: '/admin/envios', icon: TruckIcon },
        { name: 'Métodos de Envío', href: '/admin/metodos-envio', icon: TruckIcon },
        { name: 'Credenciales', href: '/admin/credenciales-logistica', icon: KeyIcon },
      ]
    },
    {
      label: 'Sistema',
      items: [
        { name: 'Usuarios', href: '/admin/usuarios', icon: UsersIcon },
        { name: 'Roles', href: '/admin/roles', icon: ShieldCheckIcon },
        { name: 'Emails', href: '/admin/emails', icon: EnvelopeIcon },
        { name: 'SMTP', href: '/admin/smtp', icon: CogIcon },
        { name: 'Reseñas', href: '/admin/resenas', icon: StarIcon },
        { name: 'Personalizar', href: '/admin/home', icon: PaintBrushIcon },
      ]
    },
  ]

  const isActivePath = (path) => {
    if (path === '/admin') return location.pathname === '/admin'
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-surface-100 dark:bg-surface-800 dark:bg-surface-950">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-surface-900/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex w-72 flex-col bg-white dark:bg-surface-800 dark:bg-surface-900 border-r border-surface-200 dark:border-surface-700 dark:border-surface-800 shadow-xl animate-slide-up">
            <div className="absolute top-3 right-3">
              <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg text-surface-400 hover:bg-surface-100 dark:bg-surface-800 dark:hover:bg-surface-800">
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent navGroups={navGroups} isActivePath={isActivePath} onNavigate={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <SidebarContent navGroups={navGroups} isActivePath={isActivePath} />
      </div>

      {/* Main content */}
      <div className="md:pl-64 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 glass border-b border-surface-200/60 dark:border-surface-700/40">
          <div className="flex items-center justify-between h-14 px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="md:hidden p-2 -ml-2 rounded-lg text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:bg-surface-800 dark:hover:bg-surface-800"
              >
                <MenuIcon className="h-5 w-5" />
              </button>
              <h1 className="text-sm font-semibold text-surface-900 dark:text-white hidden sm:block">
                Panel de Administración
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-1.5 text-xs text-surface-500 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                <ArrowLeftIcon className="h-3.5 w-3.5" />
                Ir a la tienda
              </Link>
              <ThemeToggle />
              <span className="text-xs text-surface-500 dark:text-surface-400 hidden sm:block">
                {user?.firstName} {user?.lastName}
              </span>
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg text-surface-400 hover:text-error-500 hover:bg-surface-100 dark:bg-surface-800 dark:hover:bg-surface-800 transition-colors"
                title="Cerrar sesión"
              >
                <LogoutIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}

const SidebarContent = ({ navGroups, isActivePath, onNavigate }) => (
  <div className="flex flex-col h-full bg-white dark:bg-surface-800 dark:bg-surface-900 border-r border-surface-200 dark:border-surface-700 dark:border-surface-800">
    {/* Brand */}
    <div className="flex items-center h-14 px-5 border-b border-surface-200 dark:border-surface-700 dark:border-surface-800 flex-shrink-0">
      <Link to="/admin" className="text-lg font-bold text-gradient" onClick={onNavigate}>
        TiendaKit
      </Link>
      <span className="ml-2 badge-primary text-[10px]">Admin</span>
    </div>

    {/* Navigation */}
    <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
      {navGroups.map((group) => (
        <div key={group.label}>
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-surface-400 dark:text-surface-500 dark:text-surface-400">
            {group.label}
          </p>
          <div className="space-y-0.5">
            {group.items.map((item) => {
              const Icon = item.icon
              const active = isActivePath(item.href)
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={onNavigate}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    active
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-950/50 dark:text-primary-300'
                      : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:bg-surface-800 hover:text-surface-900 dark:text-white dark:text-surface-400 dark:hover:bg-surface-800 dark:hover:text-surface-200'
                  }`}
                >
                  <Icon className={`h-4.5 w-4.5 flex-shrink-0 ${
                    active ? 'text-primary-600 dark:text-primary-400' : 'text-surface-400 dark:text-surface-500'
                  }`} style={{ width: '18px', height: '18px' }} />
                  {item.name}
                  {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500" />}
                </Link>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  </div>
)

export default AdminLayout

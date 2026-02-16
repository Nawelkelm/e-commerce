import React, { useState } from 'react'
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
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
  XMarkIcon as XIcon
} from '@heroicons/react/24/outline'

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: HomeIcon },
    { name: 'Productos', href: '/admin/productos', icon: ShoppingBagIcon },
    { name: 'Gestión de Stock', href: '/admin/stock', icon: ChartBarIcon },
    { name: 'Categorías', href: '/admin/categorias', icon: FolderIcon },
    { name: 'Proveedores', href: '/admin/proveedores', icon: TruckIcon },
    { name: 'Cupones', href: '/admin/cupones', icon: TicketIcon },
    { name: 'Pedidos', href: '/admin/pedidos', icon: ClipboardDocumentListIcon },
    { name: 'Envíos', href: '/admin/envios', icon: TruckIcon },
    { name: 'Credenciales Logística', href: '/admin/credenciales-logistica', icon: KeyIcon },
    { name: 'Métodos de Envío', href: '/admin/metodos-envio', icon: TruckIcon },
    { name: 'Cuentas Bancarias', href: '/admin/cuentas-bancarias', icon: BuildingLibraryIcon },
    { name: 'Facturas', href: '/admin/facturas', icon: DocumentTextIcon },
    { name: 'AFIP', href: '/admin/afip', icon: ShieldCheckIcon },
    { name: 'Usuarios', href: '/admin/usuarios', icon: UsersIcon },
    { name: 'Plantillas de Email', href: '/admin/emails', icon: EnvelopeIcon },
    { name: 'Configuración SMTP', href: '/admin/smtp', icon: CogIcon },
    { name: 'Reseñas', href: '/admin/resenas', icon: StarIcon },
    { name: 'Roles y Permisos', href: '/admin/roles', icon: ShieldCheckIcon },
    { name: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon },
    { name: 'Personalizar Home', href: '/admin/home', icon: PaintBrushIcon },
    // { name: 'Configuración', href: '/admin/settings', icon: CogIcon },
  ]

  const isActivePath = (path) => {
    if (path === '/admin') {
      return location.pathname === '/admin'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar móvil */}
      <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div className={`fixed inset-0 bg-gray-600 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75 transition-opacity ease-linear duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setSidebarOpen(false)} />
        <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-white dark:bg-gray-800 transform ease-in-out duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <XIcon className="h-6 w-6 text-white" aria-hidden="true" />
            </button>
          </div>
          <SidebarContent navigation={navigation} isActivePath={isActivePath} />
        </div>
      </div>

      {/* Sidebar estática */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <SidebarContent navigation={navigation} isActivePath={isActivePath} />
      </div>

      {/* Contenido principal */}
      <div className="md:pl-64 flex flex-col flex-1">
        {/* Header */}
        <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-100 dark:bg-gray-900">
          <button
            type="button"
            className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
            onClick={() => setSidebarOpen(true)}
          >
            <MenuIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {/* Top bar */}
        <div className="bg-white dark:bg-gray-800 shadow">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Panel de Administración
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Bienvenido, {user?.firstName} {user?.lastName}
                </span>
                <button
                  onClick={handleLogout}
                  className="bg-white dark:bg-gray-700 p-1 rounded-full text-gray-400 dark:text-gray-300 hover:text-gray-500 dark:hover:text-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <LogoutIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido de la página */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

const SidebarContent = ({ navigation, isActivePath }) => (
  <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
    <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
      <div className="flex items-center flex-shrink-0 px-4">
        <h1 className="text-xl font-bold text-indigo-600 dark:text-indigo-400">E-Commerce Admin</h1>
      </div>
      <nav className="mt-5 flex-1 px-2 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon
          return (
            <Link
              key={item.name}
              to={item.href}
              className={`${
                isActivePath(item.href)
                  ? 'bg-indigo-50 dark:bg-indigo-900 border-r-4 border-indigo-500 text-indigo-700 dark:text-indigo-300'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
              } group flex items-center px-2 py-2 text-sm font-medium`}
            >
              <Icon
                className={`${
                  isActivePath(item.href) ? 'text-indigo-500 dark:text-indigo-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-500 dark:group-hover:text-gray-300'
                } mr-3 flex-shrink-0 h-6 w-6`}
                aria-hidden="true"
              />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  </div>
)

export default AdminLayout
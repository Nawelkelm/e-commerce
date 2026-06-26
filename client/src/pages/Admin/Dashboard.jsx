import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ShoppingBagIcon,
  UsersIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../../store/authStore'

const statusConfig = {
  delivered:  { label: 'Entregado', class: 'badge-success' },
  pending:    { label: 'Pendiente', class: 'badge-warning' },
  processing: { label: 'Procesando', class: 'badge-info' },
  confirmed:  { label: 'Confirmado', class: 'badge-info' },
  shipped:    { label: 'Enviado', class: 'badge-primary' },
  cancelled:  { label: 'Cancelado', class: 'badge-error' },
}

const Dashboard = () => {
  const [dashboardStats, setDashboardStats] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const { token } = useAuthStore()

  useEffect(() => { fetchDashboardData() }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const headers = { 'Authorization': `Bearer ${token}` }

      const [statsRes, ordersRes] = await Promise.all([
        fetch('/api/admin/dashboard/stats', { headers }),
        fetch('/api/admin/orders?page=1&limit=5', { headers })
      ])

      if (statsRes.ok) setDashboardStats(await statsRes.json())
      if (ordersRes.ok) { const d = await ordersRes.json(); setRecentOrders(d.orders || []) }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      name: 'Total Ventas',
      value: dashboardStats ? `$${dashboardStats.totalRevenue?.toLocaleString('es-AR', { minimumFractionDigits: 0 })}` : '$0',
      change: dashboardStats ? `${dashboardStats.revenueGrowth > 0 ? '+' : ''}${dashboardStats.revenueGrowth}%` : '0%',
      up: dashboardStats?.revenueGrowth > 0,
      icon: CurrencyDollarIcon,
      color: 'primary',
    },
    {
      name: 'Productos',
      value: dashboardStats?.totalProducts || 0,
      change: dashboardStats?.lowStockProducts ? `${dashboardStats.lowStockProducts} bajo stock` : 'Stock OK',
      up: !(dashboardStats?.lowStockProducts > 5),
      icon: ShoppingBagIcon,
      color: 'accent',
    },
    {
      name: 'Usuarios',
      value: dashboardStats?.totalUsers || 0,
      change: dashboardStats ? `${dashboardStats.userGrowth > 0 ? '+' : ''}${dashboardStats.userGrowth}%` : '0%',
      up: dashboardStats?.userGrowth > 0,
      icon: UsersIcon,
      color: 'emerald',
    },
    {
      name: 'Pedidos',
      value: dashboardStats?.totalOrders || 0,
      change: dashboardStats ? `${dashboardStats.ordersGrowth > 0 ? '+' : ''}${dashboardStats.ordersGrowth}%` : '0%',
      up: dashboardStats?.ordersGrowth > 0,
      icon: ChartBarIcon,
      color: 'blue',
    },
  ]

  const colorStyles = {
    primary: 'bg-primary-100 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 border-primary-500',
    accent: 'bg-accent-100 dark:bg-accent-950/50 text-accent-600 dark:text-accent-400 border-accent-500',
    emerald: 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-500',
    blue: 'bg-primary-100 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 border-primary-500',
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="loading-spinner h-10 w-10" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="section-heading">Dashboard</h1>
        <p className="section-subheading mt-1">Resumen general de tu tienda</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.name}
            className={`card p-5 border-l-4 ${colorStyles[stat.color].split(' ').filter(c => c.startsWith('border-')).join(' ')}`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-caption font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wide">{stat.name}</p>
                <p className="mt-2 text-2xl font-bold text-surface-900 dark:text-white">{stat.value}</p>
              </div>
              <div className={`p-2.5 rounded-xl ${colorStyles[stat.color].split(' ').filter(c => c.startsWith('bg-') || c.startsWith('dark:bg-') || c.startsWith('text-') || c.startsWith('dark:text-')).join(' ')}`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1">
              {stat.up ? (
                <ArrowTrendingUpIcon className="h-4 w-4 text-emerald-500" />
              ) : (
                <ArrowTrendingDownIcon className="h-4 w-4 text-error-500" />
              )}
              <span className={`text-xs font-medium ${stat.up ? 'text-emerald-600 dark:text-emerald-400' : 'text-error-600 dark:text-error-400'}`}>
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between">
          <h3 className="text-base font-semibold text-surface-900 dark:text-white">Pedidos Recientes</h3>
          <Link to="/admin/pedidos" className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 transition-colors">
            Ver todos
          </Link>
        </div>
        <div className="table-wrapper border-0 rounded-none">
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.length > 0 ? recentOrders.map((order) => {
                const st = statusConfig[order.status] || { label: order.status, class: 'badge-info' }
                return (
                  <tr key={order.id}>
                    <td className="font-medium text-surface-900 dark:text-white">#{order.orderNumber || order.id?.slice(0, 8)}</td>
                    <td>{order.shippingAddress ? `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}` : 'N/A'}</td>
                    <td className="font-medium text-surface-900 dark:text-white">${parseFloat(order.total).toLocaleString('es-AR')}</td>
                    <td><span className={st.class}>{st.label}</span></td>
                    <td>{new Date(order.createdAt).toLocaleDateString('es-AR')}</td>
                  </tr>
                )
              }) : (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-surface-400">No hay pedidos recientes</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

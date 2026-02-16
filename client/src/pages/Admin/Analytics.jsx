import React, { useState, useEffect } from 'react'
import { 
  ChartBarIcon,
  CurrencyDollarIcon,
  ShoppingBagIcon,
  UsersIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../../store/authStore'

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const { token } = useAuthStore()

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/analytics/sales', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  const { summary, salesByMonth, topProducts } = analytics

  const stats = [
    {
      name: 'Ventas Totales',
      value: `$${summary.totalSales.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: `${summary.salesGrowth > 0 ? '+' : ''}${summary.salesGrowth}%`,
      changeType: summary.salesGrowth > 0 ? 'increase' : 'decrease',
      icon: CurrencyDollarIcon,
    },
    {
      name: 'Órdenes Totales',
      value: summary.totalOrders.toLocaleString(),
      change: `${summary.ordersGrowth > 0 ? '+' : ''}${summary.ordersGrowth}%`,
      changeType: summary.ordersGrowth > 0 ? 'increase' : 'decrease',
      icon: ShoppingBagIcon,
    },
    {
      name: 'Ticket Promedio',
      value: `$${summary.averageOrder.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      change: `${summary.avgOrderGrowth > 0 ? '+' : ''}${summary.avgOrderGrowth}%`,
      changeType: summary.avgOrderGrowth > 0 ? 'increase' : 'decrease',
      icon: ChartBarIcon,
    },
    {
      name: 'Tasa Conversión',
      value: `${summary.conversionRate}%`,
      change: `${summary.conversionGrowth > 0 ? '+' : ''}${summary.conversionGrowth}%`,
      changeType: summary.conversionGrowth > 0 ? 'increase' : 'decrease',
      icon: UsersIcon,
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600">Análisis de ventas y rendimiento de tu tienda</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="relative bg-white pt-5 px-4 pb-12 sm:pt-6 sm:px-6 shadow rounded-lg overflow-hidden"
          >
            <dt>
              <div className="absolute bg-indigo-500 rounded-md p-3">
                <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 text-sm font-medium text-gray-500 truncate">{stat.name}</p>
            </dt>
            <dd className="ml-16 pb-6 flex items-baseline sm:pb-7">
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
              <p
                className={`ml-2 flex items-baseline text-sm font-semibold ${
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {stat.changeType === 'increase' ? (
                  <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
                ) : (
                  <ArrowTrendingDownIcon className="h-4 w-4 mr-1" />
                )}
                {stat.change}
              </p>
            </dd>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Chart */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Ventas por Mes
          </h3>
          {salesByMonth && salesByMonth.length > 0 ? (
            <div className="h-64 flex items-end space-x-2">
              {salesByMonth.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center group relative">
                  <div 
                    className="bg-indigo-500 w-full rounded-t hover:bg-indigo-600 transition-colors"
                    style={{ 
                      height: `${(item.sales / Math.max(...salesByMonth.map(d => d.sales))) * 200}px`,
                      minHeight: '20px'
                    }}
                  >
                    <div className="hidden group-hover:block absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                      ${item.sales.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 mt-2">{item.month}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <p>No hay datos de ventas disponibles</p>
            </div>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Productos Más Vendidos
          </h3>
          {topProducts && topProducts.length > 0 ? (
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="flex items-center flex-1">
                    <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-indigo-600 font-semibold text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.sales} unidades vendidas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      ${product.revenue.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              <p>No hay productos vendidos en este período</p>
            </div>
          )}
        </div>
      </div>

      {/* Performance Insights */}
      <div className="mt-8 bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Insights de Rendimiento
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {summary.salesGrowth > 0 && (
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <ArrowTrendingUpIcon className="h-5 w-5 text-green-600 mr-2" />
                <h4 className="font-medium text-green-900">Crecimiento Positivo en Ventas</h4>
              </div>
              <p className="text-sm text-green-700 mt-1">
                Las ventas han aumentado un {summary.salesGrowth}% en comparación con el período anterior.
              </p>
            </div>
          )}
          
          {summary.salesGrowth < 0 && (
            <div className="p-4 bg-red-50 rounded-lg">
              <div className="flex items-center">
                <ArrowTrendingDownIcon className="h-5 w-5 text-red-600 mr-2" />
                <h4 className="font-medium text-red-900">Disminución en Ventas</h4>
              </div>
              <p className="text-sm text-red-700 mt-1">
                Las ventas han disminuido un {Math.abs(summary.salesGrowth)}% comparado con el período anterior.
              </p>
            </div>
          )}
          
          {summary.ordersGrowth < 0 && (
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center">
                <ChartBarIcon className="h-5 w-5 text-yellow-600 mr-2" />
                <h4 className="font-medium text-yellow-900">Oportunidad de Mejora</h4>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                El número de órdenes ha disminuido un {Math.abs(summary.ordersGrowth)}%. Considera estrategias de marketing.
              </p>
            </div>
          )}

          {summary.conversionRate > 0 && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <UsersIcon className="h-5 w-5 text-blue-600 mr-2" />
                <h4 className="font-medium text-blue-900">Tasa de Conversión</h4>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                El {summary.conversionRate}% de tus usuarios han realizado al menos una compra.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Analytics
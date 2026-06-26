import React, { useState, useEffect } from 'react'
import {
  TruckIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  MapPinIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../../store/authStore'

const Shipments = () => {
  const [activeTab, setActiveTab] = useState('shipments') // 'shipments' o 'pending'
  const [shipments, setShipments] = useState([])
  const [pendingOrders, setPendingOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedShipment, setSelectedShipment] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [stats, setStats] = useState(null)
  const [editingOrder, setEditingOrder] = useState(null)
  const [shippingData, setShippingData] = useState({
    firstName: '',
    lastName: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Argentina',
    phone: ''
  })
  const [filters, setFilters] = useState({
    status: '',
    carrier: '',
    search: '',
    dateFrom: '',
    dateTo: ''
  })
  const { token } = useAuthStore()

  const shipmentStatuses = [
    { value: 'pending', label: 'Pendiente', color: 'gray', icon: ClockIcon },
    { value: 'label_created', label: 'Etiqueta Creada', color: 'blue', icon: ClockIcon },
    { value: 'picked_up', label: 'Recogido', color: 'indigo', icon: TruckIcon },
    { value: 'in_transit', label: 'En Tránsito', color: 'purple', icon: TruckIcon },
    { value: 'out_for_delivery', label: 'En Reparto', color: 'yellow', icon: TruckIcon },
    { value: 'delivered', label: 'Entregado', color: 'green', icon: CheckCircleIcon },
    { value: 'failed_delivery', label: 'Entrega Fallida', color: 'red', icon: XCircleIcon },
    { value: 'returned', label: 'Devuelto', color: 'orange', icon: ExclamationTriangleIcon },
    { value: 'cancelled', label: 'Cancelado', color: 'red', icon: XCircleIcon }
  ]

  const carriers = [
    'Correo Argentino',
    'Andreani',
    'OCA',
    'DHL',
    'FedEx',
    'Otro'
  ]

  useEffect(() => {
    if (activeTab === 'shipments') {
      fetchShipments()
      fetchStats()
    } else {
      fetchPendingOrders()
    }
  }, [token, filters, activeTab])

  const fetchShipments = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams()
      if (filters.status) queryParams.append('status', filters.status)
      if (filters.carrier) queryParams.append('carrier', filters.carrier)
      if (filters.search) queryParams.append('search', filters.search)
      if (filters.dateFrom) queryParams.append('dateFrom', filters.dateFrom)
      if (filters.dateTo) queryParams.append('dateTo', filters.dateTo)

      const response = await fetch(`/api/shipments?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setShipments(data.shipments || [])
      } else {
        throw new Error('Error al cargar envíos')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/shipments/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }

  const fetchPendingOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/orders/shipping/pending', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setPendingOrders(data.orders || [])
      } else {
        throw new Error('Error al cargar pedidos pendientes')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEditAddress = (order) => {
    setEditingOrder(order.id)
    setShippingData({
      firstName: order.shippingAddress?.firstName || order.user?.firstName || '',
      lastName: order.shippingAddress?.lastName || order.user?.lastName || '',
      street: order.shippingAddress?.street || '',
      city: order.shippingAddress?.city || '',
      state: order.shippingAddress?.state || '',
      postalCode: order.shippingAddress?.postalCode || '',
      country: order.shippingAddress?.country || 'Argentina',
      phone: order.shippingAddress?.phone || order.user?.phone || ''
    })
  }

  const handleSaveAddress = async (orderId) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/shipping-address`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ shippingAddress: shippingData })
      })

      if (response.ok) {
        await fetchPendingOrders()
        setEditingOrder(null)
        alert('Dirección actualizada correctamente')
      } else {
        alert('Error al actualizar la dirección')
      }
    } catch (error) {
      console.error('Error updating address:', error)
      alert('Error al actualizar la dirección')
    }
  }

  const handleCancelEdit = () => {
    setEditingOrder(null)
    setShippingData({
      firstName: '',
      lastName: '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'Argentina',
      phone: ''
    })
  }

  const syncShipmentTracking = async (shipmentId) => {
    try {
      const response = await fetch(`/api/shipments/${shipmentId}/sync`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Sincronización exitosa. ${data.newEventsCount} nuevos eventos agregados.`)
        fetchShipments()
        if (selectedShipment && selectedShipment.id === shipmentId) {
          handleViewDetails({ id: shipmentId })
        }
      } else {
        const error = await response.json()
        alert(`Error al sincronizar: ${error.message}`)
      }
    } catch (err) {
      console.error('Error syncing shipment:', err)
      alert('Error al sincronizar el envío')
    }
  }

  const syncAllShipments = async () => {
    if (!confirm('¿Deseas sincronizar todos los envíos activos? Esto puede tomar algunos minutos.')) {
      return
    }

    try {
      const response = await fetch('/api/shipments/sync/all', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        alert(`Sincronización completada.\nTotal: ${data.results.total}\nExitosos: ${data.results.successful}\nFallidos: ${data.results.failed}\nNuevos eventos: ${data.results.newEventsTotal}`)
        fetchShipments()
        fetchStats()
      } else {
        const error = await response.json()
        alert(`Error al sincronizar: ${error.message}`)
      }
    } catch (err) {
      console.error('Error syncing all shipments:', err)
      alert('Error al sincronizar los envíos')
    }
  }

  const handleViewDetails = async (shipment) => {
    try {
      const response = await fetch(`/api/shipments/${shipment.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setSelectedShipment(data)
        setShowModal(true)
      }
    } catch (err) {
      console.error('Error fetching shipment details:', err)
    }
  }

  const getStatusColor = (status) => {
    const statusConfig = shipmentStatuses.find(s => s.value === status)
    return statusConfig ? statusConfig.color : 'gray'
  }

  const getStatusLabel = (status) => {
    const statusConfig = shipmentStatuses.find(s => s.value === status)
    return statusConfig ? statusConfig.label : status
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Gestión de Envíos</h1>
          <p className="mt-2 text-sm text-surface-700 dark:text-surface-300">
            Administra y rastrea todos los envíos de tu tienda
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          {activeTab === 'shipments' && (
            <>
              <button
                onClick={syncAllShipments}
                className="inline-flex items-center px-4 py-2 border border-surface-300 dark:border-surface-600 rounded-md shadow-sm text-sm font-medium text-surface-700 dark:text-surface-300 dark:text-surface-200 bg-white dark:bg-surface-800 dark:bg-surface-700 hover:bg-surface-50 dark:bg-surface-900 dark:hover:bg-surface-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Sincronizar Todo
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Crear Envío
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-surface-200 dark:border-surface-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('shipments')}
            className={`${
              activeTab === 'shipments'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:text-surface-300 hover:border-surface-300 dark:border-surface-600 dark:text-surface-400 dark:hover:text-surface-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <TruckIcon className="h-5 w-5 mr-2" />
            Envíos Activos
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`${
              activeTab === 'pending'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:text-surface-300 hover:border-surface-300 dark:border-surface-600 dark:text-surface-400 dark:hover:text-surface-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            <MapPinIcon className="h-5 w-5 mr-2" />
            Pedidos Pendientes
          </button>
        </nav>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white dark:bg-surface-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TruckIcon className="h-6 w-6 text-surface-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-surface-500 dark:text-surface-400 truncate">
                      Total Envíos
                    </dt>
                    <dd className="text-lg font-medium text-surface-900 dark:text-white">
                      {stats.totalShipments}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-surface-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-6 w-6 text-purple-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-surface-500 dark:text-surface-400 truncate">
                      En Tránsito
                    </dt>
                    <dd className="text-lg font-medium text-surface-900 dark:text-white">
                      {stats.inTransitShipments}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-surface-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-surface-500 dark:text-surface-400 truncate">
                      Entregados
                    </dt>
                    <dd className="text-lg font-medium text-surface-900 dark:text-white">
                      {stats.deliveredShipments}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-surface-800 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-6 w-6 text-primary-400" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-surface-500 dark:text-surface-400 truncate">
                      Tiempo Promedio
                    </dt>
                    <dd className="text-lg font-medium text-surface-900 dark:text-white">
                      {stats.averageDeliveryDays} días
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-surface-800 p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Buscar
            </label>
            <div className="relative">
              <input
                type="text"
                name="search"
                id="search"
                placeholder="Tracking o N° orden..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                className="block w-full rounded-md border-surface-300 dark:border-surface-600 dark:bg-surface-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm pl-10"
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-surface-400 absolute left-3 top-2" />
            </div>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Estado
            </label>
            <select
              id="status"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="block w-full rounded-md border-surface-300 dark:border-surface-600 dark:bg-surface-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="">Todos</option>
              {shipmentStatuses.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="carrier" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Transportista
            </label>
            <select
              id="carrier"
              value={filters.carrier}
              onChange={(e) => setFilters({...filters, carrier: e.target.value})}
              className="block w-full rounded-md border-surface-300 dark:border-surface-600 dark:bg-surface-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="">Todos</option>
              {carriers.map(carrier => (
                <option key={carrier} value={carrier}>{carrier}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="dateFrom" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Desde
            </label>
            <input
              type="date"
              id="dateFrom"
              value={filters.dateFrom}
              onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
              className="block w-full rounded-md border-surface-300 dark:border-surface-600 dark:bg-surface-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="dateTo" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Hasta
            </label>
            <input
              type="date"
              id="dateTo"
              value={filters.dateTo}
              onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
              className="block w-full rounded-md border-surface-300 dark:border-surface-600 dark:bg-surface-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
        </div>

        {(filters.search || filters.status || filters.carrier || filters.dateFrom || filters.dateTo) && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-surface-500 dark:text-surface-400">
              Mostrando {shipments.length} envíos
            </p>
            <button
              onClick={() => setFilters({ status: '', carrier: '', search: '', dateFrom: '', dateTo: '' })}
              className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Content based on active tab */}
      {activeTab === 'shipments' ? (
        <>
          {/* Shipments Table */}
          <div className="bg-white dark:bg-surface-800 shadow rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-surface-200 dark:divide-surface-700">
          <thead className="bg-surface-50 dark:bg-surface-900 dark:bg-surface-700">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 dark:text-surface-300 uppercase tracking-wider whitespace-nowrap">
                Tracking
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 dark:text-surface-300 uppercase tracking-wider whitespace-nowrap">
                Pedido
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 dark:text-surface-300 uppercase tracking-wider whitespace-nowrap">
                Cliente
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 dark:text-surface-300 uppercase tracking-wider whitespace-nowrap">
                Transportista
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 dark:text-surface-300 uppercase tracking-wider whitespace-nowrap">
                Estado
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 dark:text-surface-300 uppercase tracking-wider whitespace-nowrap">
                Entrega Est.
              </th>
              <th className="px-3 py-3 text-center text-xs font-medium text-surface-500 dark:text-surface-400 dark:text-surface-300 uppercase tracking-wider whitespace-nowrap">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-surface-800 divide-y divide-surface-200 dark:divide-surface-700">
            {shipments.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-3 py-8 text-center text-surface-500 dark:text-surface-400">
                  No hay envíos registrados
                </td>
              </tr>
            ) : (
              shipments.map((shipment) => (
                <tr key={shipment.id} className="hover:bg-surface-50 dark:bg-surface-900 dark:hover:bg-surface-700">
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-surface-900 dark:text-white">
                      {shipment.trackingNumber}
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="text-sm text-surface-900 dark:text-white">
                      {shipment.order?.orderNumber || 'N/A'}
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap max-w-xs">
                    <div className="text-sm font-medium text-surface-900 dark:text-white truncate">
                      {shipment.order?.user ? 
                        `${shipment.order.user.firstName} ${shipment.order.user.lastName}` : 
                        'N/A'
                      }
                    </div>
                    <div className="text-xs text-surface-500 dark:text-surface-400 truncate">
                      {shipment.order?.user?.email || ''}
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-surface-900 dark:text-white">
                    {shipment.carrier}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-${getStatusColor(shipment.status)}-100 text-${getStatusColor(shipment.status)}-800 dark:bg-${getStatusColor(shipment.status)}-900 dark:text-${getStatusColor(shipment.status)}-200`}
                    >
                      {getStatusLabel(shipment.status)}
                    </span>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-surface-900 dark:text-white">
                    {shipment.estimatedDeliveryDate ? 
                      new Date(shipment.estimatedDeliveryDate).toLocaleDateString('es-ES') : 
                      'N/A'
                    }
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm font-medium">
                    <div className="flex justify-center items-center gap-1">
                      <button
                        onClick={() => handleViewDetails(shipment)}
                        className="text-primary-600 hover:text-indigo-900 dark:text-primary-400 dark:hover:text-primary-300 p-1 rounded hover:bg-surface-100 dark:bg-surface-800 dark:hover:bg-surface-700 transition-colors"
                        title="Ver detalles"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      {shipment.status !== 'delivered' && shipment.status !== 'cancelled' && (
                        <button
                          onClick={() => syncShipmentTracking(shipment.id)}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 p-1 rounded hover:bg-surface-100 dark:bg-surface-800 dark:hover:bg-surface-700 transition-colors"
                          title="Sincronizar tracking"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

        </>
      ) : (
        /* Pending Orders List */
        <div className="space-y-6">
          {pendingOrders.length === 0 ? (
            <div className="bg-white dark:bg-surface-800 rounded-lg shadow p-12 text-center">
              <TruckIcon className="h-16 w-16 mx-auto text-surface-400 mb-4" />
              <h3 className="text-lg font-medium text-surface-900 dark:text-white mb-2">
                No hay pedidos pendientes
              </h3>
              <p className="text-surface-500 dark:text-surface-400">
                Todos los pedidos tienen su información de envío completa
              </p>
            </div>
          ) : (
            pendingOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white dark:bg-surface-800 rounded-lg shadow-lg overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <h3 className="text-xl font-bold text-white">
                        Pedido #{order.orderNumber}
                      </h3>
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        {order.shippingMethodName}
                      </span>
                    </div>
                    <div className="text-white text-sm">
                      {new Date(order.createdAt).toLocaleDateString('es-AR')}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Cliente Info */}
                    <div className="space-y-4">
                      <h4 className="font-semibold text-surface-900 dark:text-white flex items-center">
                        <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Información del Cliente
                      </h4>
                      <div className="bg-surface-50 dark:bg-surface-900 dark:bg-surface-700 rounded-lg p-4 space-y-2">
                        <p className="text-surface-700 dark:text-surface-300">
                          <span className="font-medium">Nombre:</span> {order.user?.firstName} {order.user?.lastName}
                        </p>
                        <p className="text-surface-700 dark:text-surface-300">
                          <span className="font-medium">Email:</span> {order.user?.email}
                        </p>
                        {order.user?.phone && (
                          <p className="text-surface-700 dark:text-surface-300">
                            <span className="font-medium">Teléfono:</span> {order.user.phone}
                          </p>
                        )}
                      </div>

                      {/* Productos */}
                      <div>
                        <h5 className="font-medium text-surface-900 dark:text-white mb-2">
                          Productos ({order.items?.length || 0})
                        </h5>
                        <div className="space-y-2">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="flex items-center space-x-3 text-sm bg-surface-50 dark:bg-surface-900 dark:bg-surface-700 p-2 rounded">
                              {item.product?.images?.[0] && (
                                <img
                                  src={item.product.images[0]}
                                  alt={item.productName}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              )}
                              <div className="flex-1">
                                <p className="text-surface-900 dark:text-white font-medium">
                                  {item.productName}
                                </p>
                                <p className="text-surface-500 dark:text-surface-400">
                                  Cantidad: {item.quantity} | ${parseFloat(item.totalPrice).toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Dirección de Envío */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-surface-900 dark:text-white flex items-center">
                          <MapPinIcon className="h-5 w-5 mr-2" />
                          Dirección de Envío
                        </h4>
                        {editingOrder !== order.id && (
                          <button
                            onClick={() => handleEditAddress(order)}
                            className="flex items-center px-3 py-1 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
                          >
                            <PencilIcon className="h-4 w-4 mr-1" />
                            Editar
                          </button>
                        )}
                      </div>

                      {editingOrder === order.id ? (
                        <div className="bg-surface-50 dark:bg-surface-900 dark:bg-surface-700 rounded-lg p-4 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="Nombre"
                              value={shippingData.firstName}
                              onChange={(e) => setShippingData({ ...shippingData, firstName: e.target.value })}
                              className="px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 text-surface-900 dark:text-white text-sm"
                            />
                            <input
                              type="text"
                              placeholder="Apellido"
                              value={shippingData.lastName}
                              onChange={(e) => setShippingData({ ...shippingData, lastName: e.target.value })}
                              className="px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 text-surface-900 dark:text-white text-sm"
                            />
                          </div>
                          <input
                            type="text"
                            placeholder="Calle y número"
                            value={shippingData.street}
                            onChange={(e) => setShippingData({ ...shippingData, street: e.target.value })}
                            className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 text-surface-900 dark:text-white text-sm"
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="Ciudad"
                              value={shippingData.city}
                              onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                              className="px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 text-surface-900 dark:text-white text-sm"
                            />
                            <input
                              type="text"
                              placeholder="Provincia"
                              value={shippingData.state}
                              onChange={(e) => setShippingData({ ...shippingData, state: e.target.value })}
                              className="px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 text-surface-900 dark:text-white text-sm"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="Código Postal"
                              value={shippingData.postalCode}
                              onChange={(e) => setShippingData({ ...shippingData, postalCode: e.target.value })}
                              className="px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 text-surface-900 dark:text-white text-sm"
                            />
                            <input
                              type="text"
                              placeholder="Teléfono"
                              value={shippingData.phone}
                              onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                              className="px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 text-surface-900 dark:text-white text-sm"
                            />
                          </div>
                          <div className="flex justify-end space-x-2 pt-2">
                            <button
                              onClick={handleCancelEdit}
                              className="flex items-center px-4 py-2 bg-surface-200 dark:bg-surface-600 text-surface-700 dark:text-surface-300 dark:text-surface-200 rounded-lg hover:bg-surface-300 dark:hover:bg-surface-500 transition-colors text-sm"
                            >
                              <XCircleIcon className="h-4 w-4 mr-1" />
                              Cancelar
                            </button>
                            <button
                              onClick={() => handleSaveAddress(order.id)}
                              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                            >
                              <CheckCircleIcon className="h-4 w-4 mr-1" />
                              Guardar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-surface-50 dark:bg-surface-900 dark:bg-surface-700 rounded-lg p-4 space-y-2">
                          {order.shippingAddress?.street ? (
                            <>
                              <p className="text-surface-900 dark:text-white font-medium">
                                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                              </p>
                              <p className="text-surface-700 dark:text-surface-300">
                                {order.shippingAddress.street}
                              </p>
                              <p className="text-surface-700 dark:text-surface-300">
                                {order.shippingAddress.city}, {order.shippingAddress.state}
                              </p>
                              <p className="text-surface-700 dark:text-surface-300">
                                CP: {order.shippingAddress.postalCode}
                              </p>
                              {order.shippingAddress.phone && (
                                <p className="text-surface-700 dark:text-surface-300">
                                  Tel: {order.shippingAddress.phone}
                                </p>
                              )}
                            </>
                          ) : (
                            <div className="text-center py-6">
                              <MapPinIcon className="h-12 w-12 mx-auto text-surface-400 mb-2" />
                              <p className="text-surface-500 dark:text-surface-400">
                                No hay dirección de envío registrada
                              </p>
                              <p className="text-sm text-surface-400 dark:text-surface-500 dark:text-surface-400">
                                Haz clic en "Editar" para agregar los datos
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Detail Modal */}
      {showModal && selectedShipment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-surface-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-surface-900 dark:text-white">
                Detalles del Envío #{selectedShipment.trackingNumber}
              </h2>
              <div className="flex items-center gap-3">
                {selectedShipment.status !== 'delivered' && selectedShipment.status !== 'cancelled' && (
                  <button
                    onClick={() => syncShipmentTracking(selectedShipment.id)}
                    className="inline-flex items-center px-3 py-1.5 border border-green-300 dark:border-green-600 rounded-md text-sm font-medium text-green-700 dark:text-green-300 bg-white dark:bg-surface-800 dark:bg-surface-700 hover:bg-green-50 dark:hover:bg-surface-600 transition-colors"
                  >
                    <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Sincronizar
                  </button>
                )}
                <button
                  onClick={() => setShowModal(false)}
                  className="text-surface-400 hover:text-surface-600 dark:text-surface-400 dark:hover:text-surface-300"
                >
                  <XCircleIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Shipment Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-surface-50 dark:bg-surface-900 dark:bg-surface-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4 flex items-center">
                    <TruckIcon className="h-5 w-5 mr-2" />
                    Información del Envío
                  </h3>
                  <dl className="space-y-2">
                    <div>
                      <dt className="text-sm font-medium text-surface-500 dark:text-surface-400">Tracking Number</dt>
                      <dd className="text-sm text-surface-900 dark:text-white font-mono">{selectedShipment.trackingNumber}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-surface-500 dark:text-surface-400">Transportista</dt>
                      <dd className="text-sm text-surface-900 dark:text-white">{selectedShipment.carrier}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-surface-500 dark:text-surface-400">Servicio</dt>
                      <dd className="text-sm text-surface-900 dark:text-white">{selectedShipment.carrierService || 'Standard'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-surface-500 dark:text-surface-400">Estado</dt>
                      <dd className="text-sm">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-${getStatusColor(selectedShipment.status)}-100 text-${getStatusColor(selectedShipment.status)}-800`}>
                          {getStatusLabel(selectedShipment.status)}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-surface-500 dark:text-surface-400">Costo de Envío</dt>
                      <dd className="text-sm text-surface-900 dark:text-white">${Number(selectedShipment.shippingCost).toFixed(2)}</dd>
                    </div>
                    {selectedShipment.weight && (
                      <div>
                        <dt className="text-sm font-medium text-surface-500 dark:text-surface-400">Peso</dt>
                        <dd className="text-sm text-surface-900 dark:text-white">{selectedShipment.weight} kg</dd>
                      </div>
                    )}
                    {selectedShipment.trackingUrl && (
                      <div>
                        <dt className="text-sm font-medium text-surface-500 dark:text-surface-400">URL de Seguimiento</dt>
                        <dd className="text-sm">
                          <a href={selectedShipment.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-500 dark:text-primary-400">
                            Ver en {selectedShipment.carrier}
                          </a>
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div className="bg-surface-50 dark:bg-surface-900 dark:bg-surface-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4 flex items-center">
                    <MapPinIcon className="h-5 w-5 mr-2" />
                    Dirección de Entrega
                  </h3>
                  <div className="text-sm text-surface-900 dark:text-white space-y-1">
                    {selectedShipment.shippingAddress?.recipientName && (
                      <p className="font-medium">{selectedShipment.shippingAddress.recipientName}</p>
                    )}
                    <p>{selectedShipment.shippingAddress?.street}</p>
                    <p>{selectedShipment.shippingAddress?.city}, {selectedShipment.shippingAddress?.state}</p>
                    <p>CP: {selectedShipment.shippingAddress?.postalCode}</p>
                    <p>{selectedShipment.shippingAddress?.country}</p>
                    {selectedShipment.shippingAddress?.phone && (
                      <p className="mt-2">Tel: {selectedShipment.shippingAddress.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Order Info */}
              {selectedShipment.order && (
                <div className="bg-surface-50 dark:bg-surface-900 dark:bg-surface-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Orden Asociada</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-surface-500 dark:text-surface-400">Número de Orden</dt>
                      <dd className="text-sm text-surface-900 dark:text-white">{selectedShipment.order.orderNumber}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-surface-500 dark:text-surface-400">Cliente</dt>
                      <dd className="text-sm text-surface-900 dark:text-white">
                        {selectedShipment.order.user?.firstName} {selectedShipment.order.user?.lastName}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-surface-500 dark:text-surface-400">Email</dt>
                      <dd className="text-sm text-surface-900 dark:text-white">{selectedShipment.order.user?.email}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-surface-500 dark:text-surface-400">Total</dt>
                      <dd className="text-sm text-surface-900 dark:text-white">${Number(selectedShipment.order.total).toFixed(2)}</dd>
                    </div>
                  </div>

                  {selectedShipment.order.items && selectedShipment.order.items.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-surface-900 dark:text-white mb-2">Productos:</h4>
                      <div className="space-y-2">
                        {selectedShipment.order.items.map((item, index) => (
                          <div key={index} className="flex items-center text-sm text-surface-700 dark:text-surface-300">
                            <span className="font-medium">{item.quantity}x</span>
                            <span className="ml-2">{item.product?.name || 'Producto'}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tracking History */}
              {selectedShipment.trackingHistory && selectedShipment.trackingHistory.length > 0 && (
                <div className="bg-surface-50 dark:bg-surface-900 dark:bg-surface-700 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Historial de Seguimiento</h3>
                  <div className="flow-root">
                    <ul className="-mb-8">
                      {selectedShipment.trackingHistory.map((event, eventIdx) => (
                        <li key={event.id}>
                          <div className="relative pb-8">
                            {eventIdx !== selectedShipment.trackingHistory.length - 1 ? (
                              <span
                                className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-surface-200 dark:bg-surface-600"
                                aria-hidden="true"
                              />
                            ) : null}
                            <div className="relative flex space-x-3">
                              <div>
                                <span className={`h-8 w-8 rounded-full bg-${getStatusColor(event.status)}-500 flex items-center justify-center ring-8 ring-white dark:ring-gray-700`}>
                                  <CheckCircleIcon className="h-5 w-5 text-white" />
                                </span>
                              </div>
                              <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                                <div>
                                  <p className="text-sm font-medium text-surface-900 dark:text-white">{event.description}</p>
                                  {event.location && (
                                    <p className="mt-0.5 text-sm text-surface-500 dark:text-surface-400">{event.location}</p>
                                  )}
                                  {event.carrierMessage && (
                                    <p className="mt-1 text-xs text-surface-500 dark:text-surface-400 italic">{event.carrierMessage}</p>
                                  )}
                                </div>
                                <div className="whitespace-nowrap text-right text-sm text-surface-500 dark:text-surface-400">
                                  {formatDate(event.timestamp)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-surface-50 dark:bg-surface-900 dark:bg-surface-700 p-4 rounded-lg">
                  <dt className="text-sm font-medium text-surface-500 dark:text-surface-400">Fecha Estimada de Entrega</dt>
                  <dd className="mt-1 text-sm text-surface-900 dark:text-white">
                    {selectedShipment.estimatedDeliveryDate ? formatDate(selectedShipment.estimatedDeliveryDate) : 'No especificada'}
                  </dd>
                </div>
                {selectedShipment.shippedAt && (
                  <div className="bg-surface-50 dark:bg-surface-900 dark:bg-surface-700 p-4 rounded-lg">
                    <dt className="text-sm font-medium text-surface-500 dark:text-surface-400">Fecha de Envío</dt>
                    <dd className="mt-1 text-sm text-surface-900 dark:text-white">{formatDate(selectedShipment.shippedAt)}</dd>
                  </div>
                )}
                {selectedShipment.deliveredAt && (
                  <div className="bg-surface-50 dark:bg-surface-900 dark:bg-surface-700 p-4 rounded-lg">
                    <dt className="text-sm font-medium text-surface-500 dark:text-surface-400">Fecha de Entrega</dt>
                    <dd className="mt-1 text-sm text-surface-900 dark:text-white">{formatDate(selectedShipment.deliveredAt)}</dd>
                  </div>
                )}
              </div>

              {selectedShipment.notes && (
                <div className="bg-surface-50 dark:bg-surface-900 dark:bg-surface-700 p-4 rounded-lg">
                  <dt className="text-sm font-medium text-surface-500 dark:text-surface-400 mb-2">Notas</dt>
                  <dd className="text-sm text-surface-900 dark:text-white">{selectedShipment.notes}</dd>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white dark:bg-surface-800 border-t border-surface-200 dark:border-surface-700 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-surface-300 dark:bg-surface-600 text-surface-700 dark:text-surface-300 dark:text-surface-200 rounded hover:bg-surface-400 dark:hover:bg-surface-500"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Shipment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-surface-500 dark:bg-surface-900 bg-opacity-75 dark:bg-opacity-75" onClick={() => setShowCreateModal(false)}></div>
            
            <div className="inline-block align-bottom bg-white dark:bg-surface-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white dark:bg-surface-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-surface-900 dark:text-white mb-4">
                  Crear Nuevo Envío
                </h3>
                <p className="text-sm text-surface-600 dark:text-surface-400 mb-4">
                  Para crear un envío, primero necesitas una orden confirmada. Ve a la sección de <strong>Pedidos</strong> para confirmar órdenes pendientes.
                </p>
                <p className="text-sm text-surface-600 dark:text-surface-400">
                  Los envíos se crearán automáticamente cuando cambies el estado de una orden a "Enviado" desde la gestión de pedidos.
                </p>
              </div>
              <div className="bg-surface-50 dark:bg-surface-900 dark:bg-surface-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="w-full inline-flex justify-center rounded-md border border-surface-300 dark:border-surface-600 shadow-sm px-4 py-2 bg-white dark:bg-surface-800 text-base font-medium text-surface-700 dark:text-surface-300 dark:text-surface-200 hover:bg-surface-50 dark:bg-surface-900 dark:hover:bg-surface-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cerrar
                </button>
                <a
                  href="/admin/pedidos"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Ir a Pedidos
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Shipments

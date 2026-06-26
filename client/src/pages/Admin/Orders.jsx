import React, { useState, useEffect } from 'react'
import { 
  EyeIcon, 
  CheckIcon, 
  XMarkIcon,
  TruckIcon,
  ClockIcon,
  PencilIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
  PhotoIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../../store/authStore'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [statusForm, setStatusForm] = useState({
    status: '',
    trackingNumber: '',
    adminNotes: ''
  })
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  })
  const { token } = useAuthStore()

  const orderStatuses = [
    { value: 'pending', label: 'Pendiente', color: 'yellow' },
    { value: 'confirmed', label: 'Confirmado', color: 'blue' },
    { value: 'processing', label: 'Procesando', color: 'indigo' },
    { value: 'shipped', label: 'Enviado', color: 'purple' },
    { value: 'delivered', label: 'Entregado', color: 'green' },
    { value: 'cancelled', label: 'Cancelado', color: 'red' },
    { value: 'refunded', label: 'Reembolsado', color: 'gray' }
  ]

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/orders', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          // Backend returns { orders: [...], pagination: {...} }
          setOrders(data.orders || [])
        } else {
          throw new Error('Error al cargar las órdenes')
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    if (token) {
      fetchOrders()
    }
  }, [token])

  // Update order status
  const updateOrderStatus = async (orderId, newStatus, trackingNumber = '', adminNotes = '') => {
    try {
      const response = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: newStatus,
          trackingNumber,
          adminNotes
        })
      })
      
      if (response.ok) {
        const updatedOrder = await response.json()
        setOrders(orders.map(order => 
          order.id === orderId ? updatedOrder : order
        ))
        setShowStatusModal(false)
      } else {
        throw new Error('Error al actualizar el estado de la orden')
      }
    } catch (err) {
      setError(err.message)
    }
  }

  // Approve payment proof
  const handleApprovePayment = async (orderId) => {
    if (!confirm('¿Estás seguro de que quieres aprobar este pago?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/approve-payment`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const updatedOrder = await response.json()
        setOrders(orders.map(order => 
          order.id === orderId ? updatedOrder : order
        ))
        setSelectedOrder(updatedOrder)
        alert('Pago aprobado exitosamente')
      } else {
        throw new Error('Error al aprobar el pago')
      }
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  // Reject payment proof
  const handleRejectPayment = async (orderId) => {
    const reason = prompt('Ingresa el motivo del rechazo (será enviado al cliente):')
    if (!reason) return

    try {
      const response = await fetch(`/api/admin/orders/${orderId}/reject-payment`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason })
      })

      if (response.ok) {
        const updatedOrder = await response.json()
        setOrders(orders.map(order => 
          order.id === orderId ? updatedOrder : order
        ))
        setSelectedOrder(updatedOrder)
        alert('Pago rechazado. Se ha notificado al cliente.')
      } else {
        throw new Error('Error al rechazar el pago')
      }
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  // Filter and search orders
  const filteredOrders = Array.isArray(orders) ? orders.filter(order => {
    // Status filter
    if (filters.status && order.status !== filters.status) return false
    
    // Date range filter
    if (filters.dateFrom && new Date(order.createdAt) < new Date(filters.dateFrom)) return false
    if (filters.dateTo && new Date(order.createdAt) > new Date(filters.dateTo)) return false
    
    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase()
      const matchesOrderNumber = order.orderNumber?.toLowerCase().includes(searchTerm)
      const matchesCustomer = order.User?.firstName?.toLowerCase().includes(searchTerm) || 
                             order.User?.lastName?.toLowerCase().includes(searchTerm) ||
                             order.User?.email?.toLowerCase().includes(searchTerm)
      if (!matchesOrderNumber && !matchesCustomer) return false
    }
    
    return true
  }) : []

  const handleStatusUpdate = (order) => {
    setSelectedOrder(order)
    setStatusForm({
      status: order.status,
      trackingNumber: order.tracking_number || '',
      adminNotes: order.admin_notes || ''
    })
    setShowStatusModal(true)
  }

  const handleViewDetails = (order) => {
    setSelectedOrder(order)
    setShowModal(true)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'confirmed':
        return 'bg-primary-100 text-primary-800'
      case 'processing':
        return 'bg-primary-100 text-primary-800'
      case 'shipped':
        return 'bg-purple-100 text-purple-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'refunded':
        return 'bg-surface-100 dark:bg-surface-800 text-surface-800'
      default:
        return 'bg-surface-100 dark:bg-surface-800 text-surface-800'
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Pendiente'
      case 'confirmed':
        return 'Confirmado'
      case 'processing':
        return 'Procesando'
      case 'shipped':
        return 'Enviado'
      case 'delivered':
        return 'Entregado'
      case 'cancelled':
        return 'Cancelado'
      case 'refunded':
        return 'Reembolsado'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Pedidos</h1>
          <p className="mt-2 text-sm text-surface-700 dark:text-surface-300">
            Lista de todos los pedidos de tu tienda ({orders.length} total)
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6 bg-white dark:bg-surface-800 p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Buscar
            </label>
            <input
              type="text"
              name="search"
              id="search"
              placeholder="ID de orden o cliente..."
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
              className="block w-full rounded-md border-surface-300 dark:border-surface-600 dark:bg-surface-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
          
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Estado
            </label>
            <select 
              id="status"
              name="status"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="block w-full rounded-md border-surface-300 dark:border-surface-600 dark:bg-surface-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="">Todos los estados</option>
              {orderStatuses.map(status => (
                <option key={status.value} value={status.value}>{status.label}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label htmlFor="dateFrom" className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
              Desde
            </label>
            <input
              type="date"
              name="dateFrom"
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
              name="dateTo"
              id="dateTo"
              value={filters.dateTo}
              onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
              className="block w-full rounded-md border-surface-300 dark:border-surface-600 dark:bg-surface-700 dark:text-white shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
        </div>
        
        {(filters.search || filters.status || filters.dateFrom || filters.dateTo) && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-surface-500 dark:text-surface-400">
              Mostrando {filteredOrders.length} de {orders.length} pedidos
            </p>
            <button
              onClick={() => setFilters({ status: '', dateFrom: '', dateTo: '', search: '' })}
              className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-surface-800 shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-surface-200 dark:divide-surface-700">
          <thead className="bg-surface-50 dark:bg-surface-900 dark:bg-surface-700">
            <tr>
              <th className="px-3 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 dark:text-surface-300 uppercase tracking-wider whitespace-nowrap">
                Pedido
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 dark:text-surface-300 uppercase tracking-wider whitespace-nowrap">
                Cliente
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 dark:text-surface-300 uppercase tracking-wider whitespace-nowrap">
                Fecha
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 dark:text-surface-300 uppercase tracking-wider whitespace-nowrap">
                Estado
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 dark:text-surface-300 uppercase tracking-wider whitespace-nowrap">
                Pago
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 dark:text-surface-300 uppercase tracking-wider whitespace-nowrap">
                Items
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 dark:text-surface-300 uppercase tracking-wider whitespace-nowrap">
                Total
              </th>
              <th className="px-3 py-3 text-center text-xs font-medium text-surface-500 dark:text-surface-400 dark:text-surface-300 uppercase tracking-wider whitespace-nowrap">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-surface-800 divide-y divide-surface-200 dark:divide-surface-700">
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-3 py-8 text-center text-surface-500 dark:text-surface-400">
                  {orders.length === 0 ? 'No hay pedidos aún' : 'No se encontraron pedidos con los filtros aplicados'}
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-surface-50 dark:bg-surface-900 dark:hover:bg-surface-700">
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="text-sm font-medium text-surface-900 dark:text-white">
                      {order.orderNumber}
                    </div>
                    {order.trackingNumber && (
                      <div className="text-xs text-surface-500 dark:text-surface-400">
                        Track: {order.trackingNumber.substring(0, 10)}...
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap max-w-xs">
                    <div className="text-sm font-medium text-surface-900 dark:text-white truncate">
                      {order.user ? `${order.user.firstName} ${order.user.lastName}` : 'Usuario no disponible'}
                    </div>
                    <div className="text-xs text-surface-500 dark:text-surface-400 truncate">
                      {order.user?.email || 'N/A'}
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-xs text-surface-900 dark:text-white">
                    {new Date(order.createdAt).toLocaleDateString('es-ES', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric'
                    })}
                    <div className="text-xs text-surface-500 dark:text-surface-400">
                      {new Date(order.createdAt).toLocaleTimeString('es-ES', { 
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}
                    >
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <div className="text-xs text-surface-900 dark:text-white">
                      {order.paymentMethod === 'bank_transfer' ? 'Transferencia' : order.paymentMethod || 'MercadoPago'}
                    </div>
                    {order.paymentMethod && order.paymentMethod.toLowerCase().includes('transfer') && (
                      <div className="mt-1">
                        {order.paymentProofUrl ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium rounded-full bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200">
                            <PhotoIcon className="h-3 w-3" />
                            Con comp.
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-medium rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                            <ClockIcon className="h-3 w-3" />
                            Sin comp.
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm text-center text-surface-900 dark:text-white">
                    {order.items?.length || 0}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-surface-900 dark:text-white">
                    ${Number(order.total).toFixed(2)}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-sm font-medium">
                    <div className="flex justify-center items-center gap-1">
                      <button
                        onClick={() => handleViewDetails(order)}
                        className="text-primary-600 hover:text-indigo-900 dark:text-primary-400 dark:hover:text-primary-300 p-1 rounded hover:bg-surface-100 dark:bg-surface-800 dark:hover:bg-surface-700 transition-colors"
                        title="Ver detalles"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(order)}
                        className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300 p-1 rounded hover:bg-surface-100 dark:bg-surface-800 dark:hover:bg-surface-700 transition-colors"
                        title="Cambiar estado"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="bg-white dark:bg-surface-800 px-4 py-3 flex items-center justify-between border-t border-surface-200 dark:border-surface-700 sm:px-6 mt-4 rounded-lg">
        <div className="flex-1 flex justify-between sm:hidden">
          <button className="relative inline-flex items-center px-4 py-2 border border-surface-300 dark:border-surface-600 text-sm font-medium rounded-md text-surface-700 dark:text-surface-300 bg-white dark:bg-surface-800 hover:bg-surface-50 dark:bg-surface-900">
            Anterior
          </button>
          <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-surface-300 dark:border-surface-600 text-sm font-medium rounded-md text-surface-700 dark:text-surface-300 bg-white dark:bg-surface-800 hover:bg-surface-50 dark:bg-surface-900">
            Siguiente
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-surface-700 dark:text-surface-300">
              Mostrando <span className="font-medium">1</span> a{' '}
              <span className="font-medium">4</span> de{' '}
              <span className="font-medium">4</span> pedidos
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-sm font-medium text-surface-500 dark:text-surface-400 hover:bg-surface-50 dark:bg-surface-900">
                Anterior
              </button>
              <button className="relative inline-flex items-center px-4 py-2 border border-surface-300 dark:border-surface-600 bg-primary-50 text-sm font-medium text-primary-600">
                1
              </button>
              <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-surface-300 dark:border-surface-600 bg-white dark:bg-surface-800 text-sm font-medium text-surface-500 dark:text-surface-400 hover:bg-surface-50 dark:bg-surface-900">
                Siguiente
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Modal de detalles de orden */}
      {showModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-surface-800 rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-surface-900 dark:text-white">
                  Detalles del Pedido #{selectedOrder.id}
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-surface-400 hover:text-surface-600 dark:text-surface-400"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Información del cliente y orden */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-surface-50 dark:bg-surface-900 p-4 rounded-lg">
                  <h3 className="font-medium text-surface-900 dark:text-white mb-2">Información del Cliente</h3>
                  <p className="text-sm text-surface-600 dark:text-surface-400">
                    Nombre: {selectedOrder.user ? `${selectedOrder.user.firstName} ${selectedOrder.user.lastName}` : 'N/A'}
                  </p>
                  <p className="text-sm text-surface-600 dark:text-surface-400">Email: {selectedOrder.user?.email || 'N/A'}</p>
                  {selectedOrder.user?.phone && (
                    <p className="text-sm text-surface-600 dark:text-surface-400">Teléfono: {selectedOrder.user.phone}</p>
                  )}
                </div>
                
                <div className="bg-surface-50 dark:bg-surface-900 p-4 rounded-lg">
                  <h3 className="font-medium text-surface-900 dark:text-white mb-2">Información de Envío</h3>
                  {selectedOrder.shippingAddress ? (
                    <>
                      <p className="text-sm text-surface-600 dark:text-surface-400">
                        Nombre: {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}
                      </p>
                      <p className="text-sm text-surface-600 dark:text-surface-400">
                        Dirección: {selectedOrder.shippingAddress.street}
                      </p>
                      <p className="text-sm text-surface-600 dark:text-surface-400">
                        Ciudad: {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state}
                      </p>
                      <p className="text-sm text-surface-600 dark:text-surface-400">
                        CP: {selectedOrder.shippingAddress.postalCode}
                      </p>
                      <p className="text-sm text-surface-600 dark:text-surface-400">
                        País: {selectedOrder.shippingAddress.country}
                      </p>
                      {selectedOrder.shippingAddress.phone && (
                        <p className="text-sm text-surface-600 dark:text-surface-400">
                          Teléfono: {selectedOrder.shippingAddress.phone}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-surface-600 dark:text-surface-400">No hay información de envío</p>
                  )}
                  {selectedOrder.trackingNumber && (
                    <p className="text-sm text-surface-600 dark:text-surface-400 mt-2 pt-2 border-t border-surface-200 dark:border-surface-700">
                      Tracking: {selectedOrder.trackingNumber}
                    </p>
                  )}
                  
                  {/* Método de Envío */}
                  {selectedOrder.shippingMethodName && (
                    <div className="mt-2 pt-2 border-t border-surface-200 dark:border-surface-700">
                      <p className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Método de Envío:</p>
                      <p className="text-sm text-surface-900 dark:text-white">{selectedOrder.shippingMethodName}</p>
                      {selectedOrder.shippingMethodCode && (
                        <p className="text-xs text-surface-500 dark:text-surface-400">
                          ({selectedOrder.shippingMethodCode})
                        </p>
                      )}
                      <p className="text-sm text-surface-600 dark:text-surface-400 mt-1">
                        Costo: {parseFloat(selectedOrder.shippingAmount) === 0 ? (
                          <span className="text-green-600 font-medium">Gratis</span>
                        ) : (
                          <span className="font-medium">${parseFloat(selectedOrder.shippingAmount).toFixed(2)}</span>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Información de pago y comprobante de transferencia */}
              {selectedOrder.paymentMethod && selectedOrder.paymentMethod.toLowerCase().includes('transferencia') && (
                <div className="mb-6 bg-primary-50 border border-primary-200 rounded-lg p-4">
                  <h3 className="font-medium text-primary-900 mb-3 flex items-center gap-2">
                    <DocumentTextIcon className="h-5 w-5" />
                    Información de Pago - Transferencia Bancaria
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-primary-800">
                        <strong>Estado del pago:</strong>{' '}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          selectedOrder.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                          selectedOrder.paymentStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-surface-100 dark:bg-surface-800 text-surface-800'
                        }`}>
                          {selectedOrder.paymentStatus === 'paid' ? 'Pagado' : 
                           selectedOrder.paymentStatus === 'pending' ? 'Pendiente de verificación' : 
                           'No verificado'}
                        </span>
                      </p>
                      
                      {selectedOrder.paymentProofUploadedAt && (
                        <p className="text-sm text-primary-700 mt-2">
                          <strong>Comprobante subido:</strong>{' '}
                          {new Date(selectedOrder.paymentProofUploadedAt).toLocaleString('es-AR')}
                        </p>
                      )}
                    </div>

                    {selectedOrder.paymentProofUrl && (
                      <div>
                        <p className="text-sm text-primary-800 mb-2"><strong>Comprobante:</strong></p>
                        <div className="flex gap-2">
                          <a
                            href={selectedOrder.paymentProofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors text-sm"
                          >
                            <EyeIcon className="h-4 w-4" />
                            Ver Comprobante
                          </a>
                          <a
                            href={selectedOrder.paymentProofUrl}
                            download
                            className="inline-flex items-center gap-1 px-3 py-2 bg-surface-600 text-white rounded-md hover:bg-surface-700 transition-colors text-sm"
                          >
                            <ArrowDownTrayIcon className="h-4 w-4" />
                            Descargar
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {!selectedOrder.paymentProofUrl && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                      <p className="text-sm text-yellow-800">
                        <ExclamationTriangleIcon className="h-4 w-4 inline mr-1" />
                        El cliente aún no ha subido el comprobante de transferencia
                      </p>
                    </div>
                  )}

                  {selectedOrder.paymentProofUrl && selectedOrder.paymentStatus === 'pending' && (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handleApprovePayment(selectedOrder.id)}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        <CheckIcon className="h-5 w-5" />
                        Aprobar Pago
                      </button>
                      <button
                        onClick={() => handleRejectPayment(selectedOrder.id)}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                      >
                        <XMarkIcon className="h-5 w-5" />
                        Rechazar Pago
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Items del pedido */}
              <div className="mb-6">
                <h3 className="font-medium text-surface-900 dark:text-white mb-4">Items del Pedido</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-surface-200 dark:divide-surface-700">
                    <thead className="bg-surface-50 dark:bg-surface-900">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">Producto</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">Cantidad</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">Precio</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-surface-500 dark:text-surface-400 uppercase">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-surface-800 divide-y divide-surface-200 dark:divide-surface-700">
                      {selectedOrder.items?.map((item, index) => {
                        // Función para obtener la URL de la imagen
                        const getImageUrl = (images) => {
                          if (!images) return null;
                          
                          // Si es un array de objetos
                          if (Array.isArray(images) && images.length > 0) {
                            const primaryImage = images.find(img => img.isPrimary) || images[0];
                            if (typeof primaryImage === 'object' && primaryImage.url) {
                              return primaryImage.url.startsWith('http') ? primaryImage.url : primaryImage.url;
                            }
                            // Si es un array de strings (formato antiguo)
                            if (typeof primaryImage === 'string') {
                              return primaryImage.startsWith('http') ? primaryImage : `/uploads/products/${primaryImage}`;
                            }
                          }
                          return null;
                        };

                        const imageUrl = getImageUrl(item.product?.images);

                        return (
                          <tr key={index}>
                            <td className="px-4 py-2">
                              <div className="flex items-center">
                                {imageUrl && (
                                  <img
                                    className="h-10 w-10 rounded-md mr-3 object-cover"
                                    src={imageUrl}
                                    alt={item.product?.name || 'Producto'}
                                  />
                                )}
                                <div>
                                  <p className="text-sm font-medium text-surface-900 dark:text-white">{item.product?.name || 'Producto eliminado'}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-2 text-sm text-surface-900 dark:text-white">{item.quantity}</td>
                            <td className="px-4 py-2 text-sm text-surface-900 dark:text-white">{formatCurrency(item.unitPrice)}</td>
                            <td className="px-4 py-2 text-sm text-surface-900 dark:text-white">{formatCurrency(item.totalPrice)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total y estado */}
              <div className="flex justify-between items-center pt-4 border-t border-surface-200 dark:border-surface-700">
                <div>
                  <span
                    className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedOrder.status)}`}
                  >
                    {getStatusText(selectedOrder.status)}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-surface-900 dark:text-white">
                    Total: {formatCurrency(selectedOrder.total)}
                  </p>
                  <p className="text-sm text-surface-500 dark:text-surface-400">
                    Fecha: {formatDate(selectedOrder.created_at)}
                  </p>
                </div>
              </div>

              {selectedOrder.admin_notes && (
                <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                  <h4 className="text-sm font-medium text-yellow-800 mb-1">Notas del Administrador:</h4>
                  <p className="text-sm text-yellow-700">{selectedOrder.admin_notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de cambio de estado */}
      {showStatusModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-surface-800 rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-surface-900 dark:text-white">
                  Cambiar Estado
                </h2>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="text-surface-400 hover:text-surface-600 dark:text-surface-400"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault()
                updateOrderStatus(
                  selectedOrder.id,
                  statusForm.status,
                  statusForm.trackingNumber,
                  statusForm.adminNotes
                )
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                      Estado *
                    </label>
                    <select
                      value={statusForm.status}
                      onChange={(e) => setStatusForm({...statusForm, status: e.target.value})}
                      required
                      className="block w-full rounded-md border-surface-300 dark:border-surface-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    >
                      {orderStatuses.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                      Número de Seguimiento
                    </label>
                    <input
                      type="text"
                      value={statusForm.trackingNumber}
                      onChange={(e) => setStatusForm({...statusForm, trackingNumber: e.target.value})}
                      placeholder="Opcional - número de tracking"
                      className="block w-full rounded-md border-surface-300 dark:border-surface-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                      Notas del Administrador
                    </label>
                    <textarea
                      rows={3}
                      value={statusForm.adminNotes}
                      onChange={(e) => setStatusForm({...statusForm, adminNotes: e.target.value})}
                      placeholder="Notas internas opcionales..."
                      className="block w-full rounded-md border-surface-300 dark:border-surface-600 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowStatusModal(false)}
                    className="px-4 py-2 text-sm font-medium text-surface-700 dark:text-surface-300 bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-md hover:bg-surface-50 dark:bg-surface-900"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md hover:bg-primary-700"
                  >
                    Actualizar Estado
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Orders
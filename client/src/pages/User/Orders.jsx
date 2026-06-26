import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Cookies from 'js-cookie'
import { getImageUrl, PLACEHOLDER_IMAGE } from '../../utils/imageHelpers'
import { 
  ShoppingBagIcon, 
  ClockIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  TruckIcon,
  CreditCardIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  ArrowUpTrayIcon,
  PhotoIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [filteredOrders, setFilteredOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [cancellingOrderId, setCancellingOrderId] = useState(null)
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [uploadModal, setUploadModal] = useState({ isOpen: false, orderId: null, orderNumber: '' })
  const [uploadingFile, setUploadingFile] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const token = Cookies.get('token')

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    filterOrders()
  }, [orders, selectedStatus, searchTerm])

  const filterOrders = () => {
    let filtered = orders

    // Filtrar por estado
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(order => order.status === selectedStatus)
    }

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.OrderItems?.some(item => 
          item.productName.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    setFilteredOrders(filtered)
  }

  const fetchOrders = async () => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/orders/my-orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error('Error al cargar pedidos:', errorData)
        throw new Error('Error al cargar los pedidos')
      }

      const data = await response.json()
      setOrders(data.orders || [])
    } catch (err) {
      setError(err.message)
      console.error('Error fetching orders:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = async (orderId, orderNumber) => {
    if (!confirm(`¿Estás seguro de que quieres cancelar el pedido ${orderNumber}?\n\nEsta acción no se puede deshacer y se restaurará el stock de los productos.`)) {
      return
    }

    try {
      setCancellingOrderId(orderId)

      const response = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al cancelar el pedido')
      }

      const data = await response.json()

      // Actualizar la lista de pedidos
      setOrders(orders.map(order => 
        order.id === orderId 
          ? { ...order, status: 'cancelled' }
          : order
      ))

      alert(`Pedido ${orderNumber} cancelado exitosamente`)
    } catch (err) {
      console.error('❌ Error al cancelar pedido:', err)
      alert(`Error: ${err.message}`)
    } finally {
      setCancellingOrderId(null)
    }
  }

  const openUploadModal = (orderId, orderNumber) => {
    setUploadModal({ isOpen: true, orderId, orderNumber })
    setSelectedFile(null)
    setPreviewUrl(null)
  }

  const closeUploadModal = () => {
    setUploadModal({ isOpen: false, orderId: null, orderNumber: '' })
    setSelectedFile(null)
    setPreviewUrl(null)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      alert('Solo se permiten archivos JPG, PNG o PDF')
      return
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('El archivo no debe superar los 5MB')
      return
    }

    setSelectedFile(file)

    // Crear preview para imágenes
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result)
      }
      reader.readAsDataURL(file)
    } else {
      setPreviewUrl(null)
    }
  }

  const handleUploadProof = async () => {
    if (!selectedFile) {
      alert('Por favor selecciona un archivo')
      return
    }

    try {
      setUploadingFile(true)

      const formData = new FormData()
      formData.append('proof', selectedFile)

      const response = await fetch(`/api/orders/${uploadModal.orderId}/payment-proof`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al subir el comprobante')
      }

      const data = await response.json()

      // Actualizar la orden en la lista
      setOrders(orders.map(order => 
        order.id === uploadModal.orderId
          ? { 
              ...order, 
              paymentProofUrl: data.proofUrl,
              paymentProofUploadedAt: new Date().toISOString(),
              paymentStatus: 'pending'
            }
          : order
      ))

      alert('¡Comprobante subido exitosamente! Tu pago está pendiente de verificación.')
      closeUploadModal()
    } catch (err) {
      console.error('❌ Error al subir comprobante:', err)
      alert(`Error: ${err.message}`)
    } finally {
      setUploadingFile(false)
    }
  }

  // Función para obtener el icono y color según el estado
  const getStatusInfo = (status) => {
    const statusMap = {
      pending: { 
        icon: ClockIcon, 
        text: 'Pendiente', 
        color: 'text-yellow-600 bg-yellow-50' 
      },
      processing: { 
        icon: CreditCardIcon, 
        text: 'Procesando', 
        color: 'text-primary-600 bg-primary-50' 
      },
      shipped: { 
        icon: TruckIcon, 
        text: 'Enviado', 
        color: 'text-primary-600 bg-primary-50' 
      },
      delivered: { 
        icon: CheckCircleIcon, 
        text: 'Entregado', 
        color: 'text-green-600 bg-green-50' 
      },
      cancelled: { 
        icon: XCircleIcon, 
        text: 'Cancelado', 
        color: 'text-red-600 bg-red-50' 
      }
    }
    return statusMap[status] || statusMap.pending
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-surface-600 dark:text-surface-400">Cargando pedidos...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={fetchOrders}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Mis Pedidos</h1>
          <p className="mt-2 text-surface-600 dark:text-surface-400 dark:text-surface-300">Gestiona y rastrea tus compras</p>
        </div>

        {orders.length > 0 && (
          <>
            {/* Barra de búsqueda y filtros */}
            <div className="mb-6 bg-white dark:bg-surface-800 rounded-lg shadow-sm p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Búsqueda */}
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-surface-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar por número de pedido o producto..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2.5 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 dark:bg-surface-700 text-surface-900 dark:text-white placeholder-surface-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {/* Filtros por estado */}
                <div className="flex gap-2 overflow-x-auto">
                  <button
                    onClick={() => setSelectedStatus('all')}
                    className={`px-4 py-2.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                      selectedStatus === 'all'
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-surface-100 dark:bg-surface-800 dark:bg-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600'
                    }`}
                  >
                    Todos ({orders.length})
                  </button>
                  <button
                    onClick={() => setSelectedStatus('pending')}
                    className={`px-4 py-2.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                      selectedStatus === 'pending'
                        ? 'bg-yellow-500 text-white shadow-md'
                        : 'bg-surface-100 dark:bg-surface-800 dark:bg-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600'
                    }`}
                  >
                    Pendientes ({orders.filter(o => o.status === 'pending').length})
                  </button>
                  <button
                    onClick={() => setSelectedStatus('processing')}
                    className={`px-4 py-2.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                      selectedStatus === 'processing'
                        ? 'bg-primary-500 text-white shadow-md'
                        : 'bg-surface-100 dark:bg-surface-800 dark:bg-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600'
                    }`}
                  >
                    En proceso ({orders.filter(o => o.status === 'processing').length})
                  </button>
                  <button
                    onClick={() => setSelectedStatus('shipped')}
                    className={`px-4 py-2.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                      selectedStatus === 'shipped'
                        ? 'bg-primary-500 text-white shadow-md'
                        : 'bg-surface-100 dark:bg-surface-800 dark:bg-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600'
                    }`}
                  >
                    Enviados ({orders.filter(o => o.status === 'shipped').length})
                  </button>
                  <button
                    onClick={() => setSelectedStatus('delivered')}
                    className={`px-4 py-2.5 rounded-lg font-medium whitespace-nowrap transition-all ${
                      selectedStatus === 'delivered'
                        ? 'bg-green-500 text-white shadow-md'
                        : 'bg-surface-100 dark:bg-surface-800 dark:bg-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-600'
                    }`}
                  >
                    Entregados ({orders.filter(o => o.status === 'delivered').length})
                  </button>
                </div>
              </div>
            </div>
          </>
        )}

        {orders.length === 0 ? (
          <div className="bg-white dark:bg-surface-800 rounded-lg shadow p-12 text-center">
            <ShoppingBagIcon className="mx-auto h-16 w-16 text-surface-400" />
            <h3 className="mt-4 text-lg font-medium text-surface-900 dark:text-white">No tienes pedidos aún</h3>
            <p className="mt-2 text-surface-600 dark:text-surface-400 dark:text-surface-300">Cuando realices una compra, aparecerá aquí</p>
            <div className="mt-6">
              <Link
                to="/productos"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
              >
                Explorar productos
              </Link>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white dark:bg-surface-800 rounded-lg shadow p-12 text-center">
            <ShoppingBagIcon className="mx-auto h-16 w-16 text-surface-400" />
            <h3 className="mt-4 text-lg font-medium text-surface-900 dark:text-white">No se encontraron pedidos</h3>
            <p className="mt-2 text-surface-600 dark:text-surface-400 dark:text-surface-300">Intenta con otros filtros o búsqueda</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const statusInfo = getStatusInfo(order.status)
              const StatusIcon = statusInfo.icon
              
              return (
                <div key={order.id} className="bg-white dark:bg-surface-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  {/* Header mejorado del pedido */}
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="text-white">
                        <div className="flex items-center gap-3">
                          <ShoppingBagIcon className="h-6 w-6" />
                          <div>
                            <p className="text-lg font-bold">#{order.orderNumber}</p>
                            <p className="text-sm opacity-90">
                              {new Date(order.createdAt).toLocaleDateString('es-AR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                            {order.trackingNumber && (
                              <div className="mt-1 flex items-center gap-2 bg-white/20 rounded px-2 py-1">
                                <TruckIcon className="h-4 w-4" />
                                <span className="text-xs font-mono">Tracking: {order.trackingNumber}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusInfo.color} shadow-md`}>
                          <StatusIcon className="h-5 w-5" />
                          <span className="text-sm font-bold">{statusInfo.text}</span>
                        </div>
                        <div className="text-white text-right">
                          <p className="text-sm opacity-90">Total</p>
                          <p className="text-2xl font-bold">${parseFloat(order.total).toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline de seguimiento */}
                  <div className="px-6 py-4 bg-surface-50 dark:bg-surface-900 dark:bg-surface-700/50 border-b border-surface-200 dark:border-surface-700 dark:border-surface-600">
                    <div className="flex items-center justify-between">
                      {['pending', 'processing', 'shipped', 'delivered'].map((step, index) => {
                        const stepInfo = getStatusInfo(step)
                        const StepIcon = stepInfo.icon
                        const isActive = ['pending', 'processing', 'shipped', 'delivered'].indexOf(order.status) >= index
                        const isCurrent = order.status === step
                        
                        return (
                          <React.Fragment key={step}>
                            <div className="flex flex-col items-center">
                              <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                                isCurrent 
                                  ? 'bg-primary-600 text-white ring-4 ring-primary-200 scale-110' 
                                  : isActive 
                                  ? 'bg-green-500 text-white' 
                                  : 'bg-surface-200 dark:bg-surface-600 text-surface-400'
                              }`}>
                                <StepIcon className="h-5 w-5" />
                              </div>
                              <p className={`mt-2 text-xs font-medium ${
                                isActive ? 'text-surface-900 dark:text-white' : 'text-surface-400'
                              }`}>
                                {stepInfo.text}
                              </p>
                            </div>
                            {index < 3 && (
                              <div className={`flex-1 h-1 mx-2 ${
                                isActive ? 'bg-green-500' : 'bg-surface-200 dark:bg-surface-600'
                              }`} />
                            )}
                          </React.Fragment>
                        )
                      })}
                    </div>
                  </div>

                  {/* Items del pedido mejorados */}
                  <div className="px-6 py-4">
                    <h3 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-3">
                      Productos ({order.OrderItems?.length || 0})
                    </h3>
                    <div className="space-y-3">
                      {order.OrderItems && order.OrderItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg bg-surface-50 dark:bg-surface-900 dark:bg-surface-700/50 hover:bg-surface-100 dark:bg-surface-800 dark:hover:bg-surface-700 transition-colors">
                          <div className="flex-shrink-0">
                            <img
                              src={item.Product?.images?.[0] ? getImageUrl(item.Product.images[0]) : PLACEHOLDER_IMAGE}
                              alt={item.productName}
                              className="h-20 w-20 rounded-lg object-cover bg-surface-100 dark:bg-surface-800 dark:bg-surface-700 shadow-sm"
                              onError={(e) => {
                                e.target.src = PLACEHOLDER_IMAGE
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-surface-900 dark:text-white">
                              {item.productName}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-indigo-200">
                                Cantidad: {item.quantity}
                              </span>
                              <span className="text-sm text-surface-500 dark:text-surface-400">
                                ${parseFloat(item.unitPrice).toFixed(2)} c/u
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-surface-500 dark:text-surface-400">Subtotal</p>
                            <p className="text-lg font-bold text-surface-900 dark:text-white">
                              ${parseFloat(item.totalPrice).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Resumen de costos */}
                  <div className="px-6 py-4 bg-surface-50 dark:bg-surface-900 dark:bg-surface-700/50 border-t border-surface-200 dark:border-surface-700 dark:border-surface-600">
                    <div className="space-y-2 max-w-sm ml-auto">
                      <div className="flex justify-between text-sm">
                        <span className="text-surface-600 dark:text-surface-400">Subtotal:</span>
                        <span className="font-medium text-surface-900 dark:text-white">
                          ${parseFloat(order.subtotal || order.total).toFixed(2)}
                        </span>
                      </div>
                      {order.tax > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-surface-600 dark:text-surface-400">Impuestos:</span>
                          <span className="font-medium text-surface-900 dark:text-white">
                            ${parseFloat(order.tax).toFixed(2)}
                          </span>
                        </div>
                      )}
                      {order.shippingCost > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-surface-600 dark:text-surface-400">Envío:</span>
                          <span className="font-medium text-surface-900 dark:text-white">
                            ${parseFloat(order.shippingCost).toFixed(2)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between text-base font-bold pt-2 border-t border-surface-300 dark:border-surface-600">
                        <span className="text-surface-900 dark:text-white">Total:</span>
                        <span className="text-primary-600 dark:text-primary-400">
                          ${parseFloat(order.total).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Footer con dirección y acciones mejoradas */}
                  <div className="px-6 py-4 bg-white dark:bg-surface-800 border-t border-surface-200 dark:border-surface-700 dark:border-surface-600">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
                          📍 Dirección de envío
                        </p>
                        <div className="text-sm text-surface-600 dark:text-surface-400 space-y-0.5">
                          {order.shippingAddress?.street && (
                            <>
                              <p>{order.shippingAddress.street}</p>
                              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}</p>
                              <p>{order.shippingAddress.country || 'Argentina'}</p>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3">
                        {/* Botón subir comprobante de transferencia */}
                        {order.paymentMethod && order.paymentMethod.toLowerCase().includes('transferencia') && 
                         order.paymentStatus !== 'paid' && 
                         order.status !== 'cancelled' && (
                          <button
                            onClick={() => openUploadModal(order.id, order.orderNumber)}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors shadow-sm"
                          >
                            <ArrowUpTrayIcon className="h-5 w-5" />
                            <span className="font-medium">
                              {order.paymentProofUrl ? 'Actualizar Comprobante' : 'Subir Comprobante'}
                            </span>
                          </button>
                        )}

                        {/* Botón ver comprobante */}
                        {order.paymentProofUrl && (
                          <a
                            href={order.paymentProofUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
                          >
                            <PhotoIcon className="h-5 w-5" />
                            <span className="font-medium">Ver Comprobante</span>
                          </a>
                        )}

                        {/* Badge de comprobante subido */}
                        {order.paymentProofUrl && (order.paymentStatus === 'pending' || order.paymentStatus === 'pending_verification') && (
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-100 text-primary-800 rounded-lg border border-blue-300">
                            <CheckCircleIcon className="h-5 w-5" />
                            <span className="font-medium text-sm">En verificación</span>
                          </div>
                        )}

                        {/* Badge de pago aprobado */}
                        {order.paymentStatus === 'paid' && (
                          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg border border-green-300">
                            <CheckCircleIcon className="h-5 w-5" />
                            <span className="font-medium text-sm">Pago Verificado</span>
                          </div>
                        )}

                        {/* Botón de factura */}
                        {order.status === 'delivered' && (
                          <a
                            href={`/api/invoices/order/${order.id}/pdf`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                          >
                            <DocumentArrowDownIcon className="h-5 w-5" />
                            <span className="font-medium">Descargar Factura</span>
                          </a>
                        )}

                        {/* Botón ver detalles */}
                        <Link
                          to={`/pedidos/${order.id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
                        >
                          <EyeIcon className="h-5 w-5" />
                          <span className="font-medium">Ver Detalles</span>
                        </Link>

                        {/* Botón cancelar */}
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleCancelOrder(order.id, order.orderNumber)}
                            disabled={cancellingOrderId === order.id}
                            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                              cancellingOrderId === order.id
                                ? 'bg-surface-100 dark:bg-surface-800 text-surface-400 border-surface-300 dark:border-surface-600 cursor-not-allowed'
                                : 'bg-white dark:bg-surface-800 text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400 shadow-sm'
                            }`}
                          >
                            {cancellingOrderId === order.id ? (
                              <>
                                <div className="animate-spin h-4 w-4 border-2 border-surface-400 border-t-transparent rounded-full"></div>
                                Cancelando...
                              </>
                            ) : (
                              <>
                                <XCircleIcon className="h-5 w-5" />
                                Cancelar Pedido
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal para subir comprobante */}
      {uploadModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-800 rounded-xl shadow-2xl max-w-lg w-full">
            {/* Header del modal */}
            <div className="flex items-center justify-between p-6 border-b border-surface-200 dark:border-surface-700">
              <h3 className="text-xl font-bold text-surface-900 dark:text-white">
                Subir Comprobante de Transferencia
              </h3>
              <button
                onClick={closeUploadModal}
                className="text-surface-400 hover:text-surface-600 dark:text-surface-400 dark:hover:text-surface-300 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            {/* Body del modal */}
            <div className="p-6 space-y-4">
              <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-primary-800 dark:text-primary-300">
                  <strong>Pedido:</strong> #{uploadModal.orderNumber}
                </p>
                <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">
                  Sube una foto o captura del comprobante de transferencia bancaria
                </p>
              </div>

              {/* Zona de selección de archivo */}
              <div className="space-y-3">
                <label className="block">
                  <div className="border-2 border-dashed border-surface-300 dark:border-surface-600 rounded-lg p-6 text-center hover:border-primary-500 dark:hover:border-indigo-400 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      disabled={uploadingFile}
                    />
                    {previewUrl ? (
                      <div className="space-y-3">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="max-h-48 mx-auto rounded-lg shadow-md"
                        />
                        <p className="text-sm text-surface-600 dark:text-surface-400">
                          {selectedFile?.name}
                        </p>
                      </div>
                    ) : selectedFile ? (
                      <div className="space-y-2">
                        <PhotoIcon className="h-12 w-12 mx-auto text-surface-400" />
                        <p className="text-sm text-surface-600 dark:text-surface-400">
                          {selectedFile.name}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <ArrowUpTrayIcon className="h-12 w-12 mx-auto text-surface-400" />
                        <p className="text-sm text-surface-600 dark:text-surface-400">
                          Haz clic para seleccionar un archivo
                        </p>
                        <p className="text-xs text-surface-500 dark:text-surface-400 dark:text-surface-500 dark:text-surface-400">
                          JPG, PNG o PDF (máx. 5MB)
                        </p>
                      </div>
                    )}
                  </div>
                </label>

                {selectedFile && (
                  <button
                    onClick={() => {
                      setSelectedFile(null)
                      setPreviewUrl(null)
                    }}
                    className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-1"
                  >
                    <XMarkIcon className="h-4 w-4" />
                    Eliminar archivo
                  </button>
                )}
              </div>

              {/* Instrucciones */}
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <p className="text-xs text-yellow-800 dark:text-yellow-300">
                  <strong>Importante:</strong> Asegúrate de que el comprobante sea legible y muestre:
                </p>
                <ul className="mt-2 text-xs text-yellow-700 dark:text-yellow-400 list-disc list-inside space-y-1">
                  <li>Número de transacción</li>
                  <li>Fecha y hora de la transferencia</li>
                  <li>Monto transferido</li>
                  <li>CBU o Alias de destino</li>
                </ul>
              </div>
            </div>

            {/* Footer del modal */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-surface-200 dark:border-surface-700">
              <button
                onClick={closeUploadModal}
                disabled={uploadingFile}
                className="px-4 py-2 text-surface-700 dark:text-surface-300 bg-surface-100 dark:bg-surface-800 dark:bg-surface-700 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={handleUploadProof}
                disabled={!selectedFile || uploadingFile}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploadingFile ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Subiendo...
                  </>
                ) : (
                  <>
                    <ArrowUpTrayIcon className="h-5 w-5" />
                    Subir Comprobante
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Orders
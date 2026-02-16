import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import {
  TruckIcon,
  MapPinIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowLeftIcon,
  ExclamationCircleIcon,
  CreditCardIcon,
  PhotoIcon
} from '@heroicons/react/24/outline'

const OrderDetail = () => {
  const { id } = useParams()
  const { token } = useAuthStore()
  const [order, setOrder] = useState(null)
  const [shipment, setShipment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchOrderDetails()
  }, [id, token])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/orders/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setOrder(data)

        // Fetch shipment info if order has tracking number
        if (data.trackingNumber) {
          fetchShipmentTracking(data.trackingNumber)
        }
      } else {
        throw new Error('Error al cargar el pedido')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchShipmentTracking = async (trackingNumber) => {
    try {
      const response = await fetch(`/api/shipments/track/${trackingNumber}`)
      if (response.ok) {
        const data = await response.json()
        setShipment(data)
      }
    } catch (err) {
      console.error('Error fetching shipment:', err)
    }
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'yellow',
      confirmed: 'blue',
      processing: 'indigo',
      shipped: 'purple',
      delivered: 'green',
      cancelled: 'red',
      refunded: 'gray'
    }
    return colors[status] || 'gray'
  }

  const getStatusText = (status) => {
    const texts = {
      pending: 'Pendiente',
      confirmed: 'Confirmado',
      processing: 'Procesando',
      shipped: 'Enviado',
      delivered: 'Entregado',
      cancelled: 'Cancelado',
      refunded: 'Reembolsado'
    }
    return texts[status] || status
  }

  const getShipmentStatusColor = (status) => {
    const colors = {
      pending: 'gray',
      label_created: 'blue',
      picked_up: 'indigo',
      in_transit: 'purple',
      out_for_delivery: 'yellow',
      delivered: 'green',
      failed_delivery: 'red',
      returned: 'orange',
      cancelled: 'red'
    }
    return colors[status] || 'gray'
  }

  const getShipmentStatusText = (status) => {
    const texts = {
      pending: 'Pendiente',
      label_created: 'Etiqueta Creada',
      picked_up: 'Recogido',
      in_transit: 'En Tránsito',
      out_for_delivery: 'En Reparto',
      delivered: 'Entregado',
      failed_delivery: 'Intento Fallido',
      returned: 'Devuelto',
      cancelled: 'Cancelado'
    }
    return texts[status] || status
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Fecha no disponible'
    
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return 'Fecha no disponible'
      
      return date.toLocaleDateString('es-AR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch (error) {
      return 'Fecha no disponible'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
            <div className="flex">
              <ExclamationCircleIcon className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">Error</h3>
                <p className="mt-2 text-sm text-red-700 dark:text-red-300">{error || 'Pedido no encontrado'}</p>
              </div>
            </div>
          </div>
          <Link to="/pedidos" className="mt-4 inline-flex items-center text-indigo-600 hover:text-indigo-500">
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Volver a Mis Pedidos
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <Link to="/pedidos" className="inline-flex items-center text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 mb-4">
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Volver a Mis Pedidos
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Pedido #{order.orderNumber || 'N/A'}
              </h1>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Realizado el {order.createdAt ? new Date(order.createdAt).toLocaleDateString('es-AR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'Fecha no disponible'}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold bg-${getStatusColor(order.status)}-100 text-${getStatusColor(order.status)}-800 dark:bg-${getStatusColor(order.status)}-900 dark:text-${getStatusColor(order.status)}-200`}>
              {getStatusText(order.status)}
            </span>
          </div>
        </div>

        {/* Shipment Tracking */}
        {shipment && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                <TruckIcon className="h-6 w-6 mr-2" />
                Estado del Envío
              </h2>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold bg-${getShipmentStatusColor(shipment.status)}-100 text-${getShipmentStatusColor(shipment.status)}-800`}>
                {getShipmentStatusText(shipment.status)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Número de Seguimiento</dt>
                <dd className="mt-1 text-lg font-mono text-gray-900 dark:text-white">{shipment.trackingNumber}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Transportista</dt>
                <dd className="mt-1 text-lg text-gray-900 dark:text-white">{shipment.carrier}</dd>
              </div>
              {shipment.estimatedDeliveryDate && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Fecha Estimada de Entrega</dt>
                  <dd className="mt-1 text-lg text-gray-900 dark:text-white">
                    {new Date(shipment.estimatedDeliveryDate).toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </dd>
                </div>
              )}
              {shipment.trackingUrl && (
                <div>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Seguimiento en Línea</dt>
                  <dd className="mt-1">
                    <a
                      href={shipment.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 font-medium"
                    >
                      Rastrear en {shipment.carrier} →
                    </a>
                  </dd>
                </div>
              )}
            </div>

            {/* Tracking Timeline */}
            {shipment.trackingHistory && shipment.trackingHistory.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Historial de Seguimiento</h3>
                <div className="flow-root">
                  <ul className="-mb-8">
                    {shipment.trackingHistory.map((event, eventIdx) => (
                      <li key={eventIdx}>
                        <div className="relative pb-8">
                          {eventIdx !== shipment.trackingHistory.length - 1 ? (
                            <span
                              className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-600"
                              aria-hidden="true"
                            />
                          ) : null}
                          <div className="relative flex space-x-3">
                            <div>
                              <span className={`h-8 w-8 rounded-full bg-${getShipmentStatusColor(event.status)}-500 flex items-center justify-center ring-8 ring-white dark:ring-gray-800`}>
                                {event.status === 'delivered' ? (
                                  <CheckCircleIcon className="h-5 w-5 text-white" />
                                ) : (
                                  <ClockIcon className="h-5 w-5 text-white" />
                                )}
                              </span>
                            </div>
                            <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{event.description}</p>
                                {event.location && (
                                  <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400 flex items-center">
                                    <MapPinIcon className="h-4 w-4 mr-1" />
                                    {event.location}
                                  </p>
                                )}
                              </div>
                              <div className="whitespace-nowrap text-right text-sm text-gray-500 dark:text-gray-400">
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
          </div>
        )}

        {/* Order Details */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Detalles del Pedido</h2>
          
          {/* Products */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Productos</h3>
            <div className="space-y-4">
              {order.items && order.items.map((item, index) => (
                <div key={index} className="flex items-center space-x-4">
                  {item.product?.images && item.product.images[0] && (
                    <img
                      src={item.product.images[0]}
                      alt={item.productName}
                      className="h-20 w-20 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">{item.productName}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Cantidad: {item.quantity}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Precio unitario: ${parseFloat(item.unitPrice || 0).toFixed(2)}</p>
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    ${parseFloat(item.totalPrice || 0).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
              <span className="text-gray-900 dark:text-white">${parseFloat(order.subtotal || 0).toFixed(2)}</span>
            </div>
            {parseFloat(order.shippingAmount || 0) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Envío</span>
                <span className="text-gray-900 dark:text-white">${parseFloat(order.shippingAmount || 0).toFixed(2)}</span>
              </div>
            )}
            {parseFloat(order.discountAmount || 0) > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Descuento</span>
                <span className="text-green-600 dark:text-green-400">-${parseFloat(order.discountAmount || 0).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t border-gray-200 dark:border-gray-700 pt-2">
              <span className="text-gray-900 dark:text-white">Total</span>
              <span className="text-gray-900 dark:text-white">${parseFloat(order.total || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        {order.paymentMethod && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <CreditCardIcon className="h-6 w-6 mr-2" />
              Información de Pago
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Método de Pago:</span>
                <span className="font-medium text-gray-900 dark:text-white">{order.paymentMethod}</span>
              </div>
              
              {order.paymentStatus && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Estado del Pago:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    order.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                    order.paymentStatus === 'pending_verification' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.paymentStatus === 'paid' ? 'Pagado' :
                     order.paymentStatus === 'pending_verification' ? 'En Verificación' :
                     'Pendiente'}
                  </span>
                </div>
              )}

              {/* Comprobante de Pago */}
              {order.paymentProofUrl && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <p className="text-gray-600 dark:text-gray-400 mb-3">Comprobante de Transferencia:</p>
                  <div className="flex items-center gap-3">
                    <a
                      href={order.paymentProofUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      <PhotoIcon className="h-5 w-5" />
                      Ver Comprobante
                    </a>
                    {order.paymentProofUploadedAt && (
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Subido el {new Date(order.paymentProofUploadedAt).toLocaleDateString('es-AR')}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Shipping Method */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <TruckIcon className="h-6 w-6 mr-2" />
            Método de Envío
          </h2>
          {order.shippingMethodName ? (
            <div className="space-y-2">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 dark:text-white">
                    {order.shippingMethodName}
                  </p>
                  {order.shippingMethodCode && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Código: {order.shippingMethodCode}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  {parseFloat(order.shippingAmount || 0) === 0 ? (
                    <span className="text-green-600 dark:text-green-400 font-medium">
                      A coordinar
                    </span>
                  ) : (
                    <span className="font-medium text-gray-900 dark:text-white">
                      ${parseFloat(order.shippingAmount).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              {/* Si es "Acordar con el Vendedor" */}
              {order.shippingMethodCode === 'ACORDAR_VENDEDOR' && (
                <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    📞 Por favor, ponte en contacto con el vendedor para coordinar la forma y costo de envío.
                  </p>
                </div>
              )}

              {/* Si es "Retiro en Local" */}
              {order.shippingMethodCode === 'RETIRO_LOCAL' && (
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
                    📍 Dirección de retiro:
                  </p>
                  <div className="text-sm text-blue-800 dark:text-blue-300">
                    <p>Av. Corrientes 1234</p>
                    <p>CABA, Buenos Aires (CP: 1043)</p>
                    <p className="mt-2">📞 Tel: 011-1234-5678</p>
                    <p className="mt-1">🕒 Horario: Lunes a Viernes de 9 a 18hs</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic">No se especificó método de envío</p>
          )}
        </div>

        {/* Shipping Address */}
        {order.shippingAddress && (order.shippingAddress.street || order.shippingAddress.city) ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <MapPinIcon className="h-6 w-6 mr-2" />
              Dirección de Envío
            </h2>
            <div className="text-gray-700 dark:text-gray-300">
              {order.shippingAddress.street && <p>{order.shippingAddress.street}</p>}
              {(order.shippingAddress.city || order.shippingAddress.state) && (
                <p>{order.shippingAddress.city}{order.shippingAddress.state && `, ${order.shippingAddress.state}`}</p>
              )}
              {order.shippingAddress.postalCode && <p>CP: {order.shippingAddress.postalCode}</p>}
              {order.shippingAddress.country && <p>{order.shippingAddress.country}</p>}
              {order.shippingAddress.phone && <p className="mt-2">Tel: {order.shippingAddress.phone}</p>}
            </div>
          </div>
        ) : order.shippingMethodCode !== 'RETIRO_LOCAL' && order.shippingMethodCode !== 'ACORDAR_VENDEDOR' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
              <MapPinIcon className="h-6 w-6 mr-2" />
              Dirección de Envío
            </h2>
            <div className="text-gray-500 dark:text-gray-400 italic">
              <p>No se proporcionó dirección de envío</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrderDetail
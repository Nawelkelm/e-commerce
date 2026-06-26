import React, { useState, useEffect } from 'react'
import {
  TruckIcon,
  MapPinIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../../store/authStore'

const ShippingManagement = () => {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
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
  const { token } = useAuthStore()

  useEffect(() => {
    fetchPendingOrders()
  }, [token])

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
        setOrders(data.orders || [])
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (order) => {
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

  const handleSave = async (orderId) => {
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

  const handleCancel = () => {
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

  const getMethodBadge = (code) => {
    const badges = {
      'ACORDAR_VENDEDOR': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      'RETIRO_LOCAL': 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200',
      'ENVIO_DOMICILIO': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    }
    return badges[code] || 'bg-surface-100 dark:bg-surface-800 text-surface-800 dark:bg-surface-900 dark:text-surface-200'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white flex items-center">
            <TruckIcon className="h-8 w-8 mr-3" />
            Gestión de Envíos
          </h1>
          <p className="mt-2 text-surface-600 dark:text-surface-400">
            Administra los datos de envío de los pedidos pendientes
          </p>
        </div>

        {orders.length === 0 ? (
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
          <div className="space-y-6">
            {orders.map((order) => (
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
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getMethodBadge(order.shippingMethodCode)}`}>
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
                        <UserIcon className="h-5 w-5 mr-2" />
                        Información del Cliente
                      </h4>
                      <div className="bg-surface-50 dark:bg-surface-900 dark:bg-surface-700 rounded-lg p-4 space-y-2">
                        <div className="flex items-center text-surface-700 dark:text-surface-300">
                          <UserIcon className="h-4 w-4 mr-2" />
                          <span>{order.user?.firstName} {order.user?.lastName}</span>
                        </div>
                        <div className="flex items-center text-surface-700 dark:text-surface-300">
                          <EnvelopeIcon className="h-4 w-4 mr-2" />
                          <span>{order.user?.email}</span>
                        </div>
                        {order.user?.phone && (
                          <div className="flex items-center text-surface-700 dark:text-surface-300">
                            <PhoneIcon className="h-4 w-4 mr-2" />
                            <span>{order.user.phone}</span>
                          </div>
                        )}
                      </div>

                      {/* Productos */}
                      <div>
                        <h5 className="font-medium text-surface-900 dark:text-white mb-2">
                          Productos ({order.items?.length || 0})
                        </h5>
                        <div className="space-y-2">
                          {order.items?.map((item, idx) => (
                            <div key={idx} className="flex items-center space-x-3 text-sm">
                              {item.product?.images?.[0] && (
                                <img
                                  src={item.product.images[0]}
                                  alt={item.productName}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              )}
                              <div>
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
                            onClick={() => handleEdit(order)}
                            className="flex items-center px-3 py-1 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
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
                              className="px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 text-surface-900 dark:text-white"
                            />
                            <input
                              type="text"
                              placeholder="Apellido"
                              value={shippingData.lastName}
                              onChange={(e) => setShippingData({ ...shippingData, lastName: e.target.value })}
                              className="px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 text-surface-900 dark:text-white"
                            />
                          </div>
                          <input
                            type="text"
                            placeholder="Calle y número"
                            value={shippingData.street}
                            onChange={(e) => setShippingData({ ...shippingData, street: e.target.value })}
                            className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 text-surface-900 dark:text-white"
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="Ciudad"
                              value={shippingData.city}
                              onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                              className="px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 text-surface-900 dark:text-white"
                            />
                            <input
                              type="text"
                              placeholder="Provincia"
                              value={shippingData.state}
                              onChange={(e) => setShippingData({ ...shippingData, state: e.target.value })}
                              className="px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 text-surface-900 dark:text-white"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="Código Postal"
                              value={shippingData.postalCode}
                              onChange={(e) => setShippingData({ ...shippingData, postalCode: e.target.value })}
                              className="px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 text-surface-900 dark:text-white"
                            />
                            <input
                              type="text"
                              placeholder="Teléfono"
                              value={shippingData.phone}
                              onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                              className="px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 text-surface-900 dark:text-white"
                            />
                          </div>
                          <div className="flex justify-end space-x-2 pt-2">
                            <button
                              onClick={handleCancel}
                              className="flex items-center px-4 py-2 bg-surface-200 dark:bg-surface-600 text-surface-700 dark:text-surface-300 dark:text-surface-200 rounded-lg hover:bg-surface-300 dark:hover:bg-surface-500 transition-colors"
                            >
                              <XMarkIcon className="h-4 w-4 mr-1" />
                              Cancelar
                            </button>
                            <button
                              onClick={() => handleSave(order.id)}
                              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                              <CheckIcon className="h-4 w-4 mr-1" />
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
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ShippingManagement

import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { ordersAPI, paymentsAPI } from '../services/api'
import { getImageUrl, PLACEHOLDER_IMAGE } from '../utils/imageHelpers'
import CouponInput from '../components/CouponInput.jsx'

const Checkout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { cart, getCartTotal, clearCart, user, token } = useAuthStore()
  
  const [loading, setLoading] = useState(false)
  const [appliedCoupon, setAppliedCoupon] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('mercadopago') // 'mercadopago' o 'transfer'
  const [bankData, setBankData] = useState(null)
  const [shippingMethod, setShippingMethod] = useState(null)

  // Obtener el shipping method del state del navigate
  useEffect(() => {
    if (location.state?.shippingMethod) {
      setShippingMethod(location.state.shippingMethod)
    }
  }, [location])
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Argentina',
    customerNotes: ''
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleCouponApplied = (coupon) => {
    setAppliedCoupon(coupon)
  }

  const handleCouponRemoved = () => {
    setAppliedCoupon(null)
  }

  const calculateDiscount = () => {
    if (!appliedCoupon) return 0
    
    const subtotal = getCartTotal()
    
    if (appliedCoupon.discountType === 'percentage') {
      const discount = (subtotal * appliedCoupon.discountValue) / 100
      return Math.min(discount, appliedCoupon.discountAmount || discount)
    } else if (appliedCoupon.discountType === 'fixed') {
      return Math.min(appliedCoupon.discountValue, subtotal)
    }
    
    return 0
  }

  const calculateShipping = () => {
    if (appliedCoupon?.discountType === 'freeShipping') {
      return 0
    }
    // Si es "acordar" o precio null, retornar 0 para el cálculo pero mostrar "A definir"
    if (shippingMethod?.type === 'agreement' || shippingMethod?.price === null) {
      return 0
    }
    return parseFloat(shippingMethod?.price) || 0
  }

  const calculateTotal = () => {
    const subtotal = getCartTotal()
    const discount = calculateDiscount()
    const shipping = calculateShipping()
    return Math.max(0, subtotal - discount + shipping)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. Crear la orden
      const orderData = await ordersAPI.createOrder({
        shippingAddress: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          street: formData.street,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
          phone: formData.phone
        },
        customerNotes: formData.customerNotes || undefined,
        couponId: appliedCoupon?.id || undefined,
        discountApplied: calculateDiscount() || undefined,
        paymentMethod: paymentMethod === 'transfer' ? 'Transferencia Bancaria' : 'MercadoPago',
        shippingMethod: shippingMethod || undefined,
        items: cart.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price,
          attributes: item.attributes || {}
        }))
      })

      // 2. Si es transferencia, redirigir a página de transferencia
      if (paymentMethod === 'transfer') {
        // Redirigir a página de transferencia con datos de la orden
        // IMPORTANTE: Redirigir ANTES de limpiar el carrito para evitar que se active la condición de carrito vacío
        navigate('/payment/transfer', { 
          state: { 
            orderId: orderData.data.order.id,
            orderNumber: orderData.data.order.orderNumber,
            total: calculateTotal()
          },
          replace: true // Reemplazar en el historial para que no pueda volver atrás
        })
        
        // Limpiar carrito DESPUÉS de la navegación
        setTimeout(() => clearCart(), 0)
        return
      }

      // 3. Si es MercadoPago, crear preferencia de pago
      const paymentData = await paymentsAPI.createPayment({
        orderId: orderData.data.order.id
      })

      // 4. Redirigir a MercadoPago o mostrar éxito
      if (paymentData.data?.init_point) {
        // Limpiar carrito antes de redirigir
        clearCart()
        // Redirigir a MercadoPago
        window.location.href = paymentData.data.init_point
      } else {
        // Fallback: redirigir a página de éxito
        clearCart()
        navigate('/payment/success')
      }

    } catch (error) {
      // Error logged via toast/alert below
      const message = error.response?.data?.message || error.message || 'Error desconocido'
      alert('Error al procesar la orden: ' + message)
    } finally {
      setLoading(false)
    }
  }

  if (cart.length === 0) {
    navigate('/carrito')
    return null
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white mb-8">Checkout</h1>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-surface-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-surface-900 dark:text-white mb-6">Información de envío</h2>
              
              <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Nombre</label>
                    <input
                      type="text"
                      name="firstName"
                      required
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-surface-300 dark:border-surface-600 rounded-md px-3 py-2 bg-white dark:bg-surface-800 dark:bg-surface-700 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Apellido</label>
                    <input
                      type="text"
                      name="lastName"
                      required
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-surface-300 dark:border-surface-600 rounded-md px-3 py-2 bg-white dark:bg-surface-800 dark:bg-surface-700 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Email</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-surface-300 dark:border-surface-600 rounded-md px-3 py-2 bg-white dark:bg-surface-800 dark:bg-surface-700 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Teléfono</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-surface-300 dark:border-surface-600 rounded-md px-3 py-2 bg-white dark:bg-surface-800 dark:bg-surface-700 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Dirección</label>
                  <input
                    type="text"
                    name="street"
                    required
                    value={formData.street}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-surface-300 dark:border-surface-600 rounded-md px-3 py-2 bg-white dark:bg-surface-800 dark:bg-surface-700 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Calle y número"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Ciudad</label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-surface-300 dark:border-surface-600 rounded-md px-3 py-2 bg-white dark:bg-surface-800 dark:bg-surface-700 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Provincia/Estado</label>
                    <input
                      type="text"
                      name="state"
                      required
                      value={formData.state}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-surface-300 dark:border-surface-600 rounded-md px-3 py-2 bg-white dark:bg-surface-800 dark:bg-surface-700 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Código Postal</label>
                    <input
                      type="text"
                      name="postalCode"
                      required
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-surface-300 dark:border-surface-600 rounded-md px-3 py-2 bg-white dark:bg-surface-800 dark:bg-surface-700 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">País</label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-surface-300 dark:border-surface-600 rounded-md px-3 py-2 bg-white dark:bg-surface-800 dark:bg-surface-700 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="Argentina">Argentina</option>
                      <option value="Chile">Chile</option>
                      <option value="Uruguay">Uruguay</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Comentarios adicionales (opcional)</label>
                  <textarea
                    name="customerNotes"
                    value={formData.customerNotes}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 block w-full border border-surface-300 dark:border-surface-600 rounded-md px-3 py-2 bg-white dark:bg-surface-800 dark:bg-surface-700 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Instrucciones de entrega, referencias, etc."
                  />
                </div>

                {/* Método de Pago */}
                <div className="mt-8 pt-8 border-t border-surface-200 dark:border-surface-700">
                  <h3 className="text-lg font-medium text-surface-900 dark:text-white mb-4">Método de Pago</h3>
                  
                  <div className="space-y-4">
                    {/* MercadoPago */}
                    <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === 'mercadopago'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-surface-300 dark:border-surface-600 hover:border-surface-400'
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="mercadopago"
                        checked={paymentMethod === 'mercadopago'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 text-primary-600"
                      />
                      <div className="ml-4 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-surface-900 dark:text-white">MercadoPago</span>
                          <img 
                            src="https://http2.mlstatic.com/storage/logos-api-admin/51b446b0-571c-11e8-9a2d-4b2bd7b1bf77-xl@2x.png" 
                            alt="MercadoPago"
                            className="h-6"
                          />
                        </div>
                        <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
                          Paga con tarjeta, débito o crédito en cuotas
                        </p>
                      </div>
                    </label>

                    {/* Transferencia Bancaria */}
                    <label className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === 'transfer'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-surface-300 dark:border-surface-600 hover:border-surface-400'
                    }`}>
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="transfer"
                        checked={paymentMethod === 'transfer'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-4 h-4 text-primary-600"
                      />
                      <div className="ml-4 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-surface-900 dark:text-white">Transferencia Bancaria</span>
                          <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                        </div>
                        <p className="text-xs text-surface-500 dark:text-surface-400 mt-1">
                          Recibirás los datos bancarios para realizar la transferencia
                        </p>
                      </div>
                    </label>
                  </div>

                  {paymentMethod === 'transfer' && (
                    <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-sm text-yellow-800 dark:text-yellow-200">
                          <p className="font-medium">Importante:</p>
                          <ul className="mt-2 space-y-1 list-disc list-inside">
                            <li>Deberás realizar la transferencia en las próximas 48 horas</li>
                            <li>Luego deberás cargar el comprobante en "Mis Pedidos"</li>
                            <li>Tu pedido será procesado una vez confirmemos el pago</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="bg-white dark:bg-surface-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-surface-900 dark:text-white mb-6">Resumen de la orden</h2>
              
              <div className="space-y-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center space-x-4">
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      className="h-12 w-12 rounded object-cover bg-surface-100 dark:bg-surface-800 dark:bg-surface-700"
                      onError={(e) => {
                        e.target.src = PLACEHOLDER_IMAGE
                      }}
                    />
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-surface-900 dark:text-white">{item.name}</h4>
                      <p className="text-sm text-surface-500 dark:text-surface-400">Cantidad: {item.quantity}</p>
                    </div>
                    <div className="text-sm font-medium text-surface-900 dark:text-white">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Coupon Input */}
              <div className="mt-6">
                <CouponInput 
                  cartTotal={getCartTotal()}
                  cartItems={cart}
                  onCouponApplied={handleCouponApplied}
                  onCouponRemoved={handleCouponRemoved}
                />
              </div>
              
              <div className="border-t border-surface-200 dark:border-surface-700 mt-6 pt-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-surface-600 dark:text-surface-400">Subtotal</span>
                  <span className="font-medium dark:text-surface-300">${getCartTotal().toFixed(2)}</span>
                </div>
                
                {appliedCoupon && calculateDiscount() > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      Descuento ({appliedCoupon.code})
                    </span>
                    <span className="font-medium">-${calculateDiscount().toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-surface-600 dark:text-surface-400">Envío</span>
                  <span className="font-medium dark:text-surface-300">
                    {appliedCoupon?.discountType === 'freeShipping' ? (
                      <span className="text-green-600 dark:text-green-400">Gratis</span>
                    ) : shippingMethod ? (
                      shippingMethod.type === 'agreement' || shippingMethod.price === null ? (
                        <span className="text-yellow-600 dark:text-yellow-400">A acordar</span>
                      ) : shippingMethod.price === 0 ? (
                        <span className="text-green-600 dark:text-green-400">Gratis</span>
                      ) : (
                        `$${parseFloat(shippingMethod.price).toFixed(2)}`
                      )
                    ) : (
                      <span className="text-surface-500 dark:text-surface-400">No seleccionado</span>
                    )}
                  </span>
                </div>
                
                {shippingMethod && (
                  <div className="bg-surface-50 dark:bg-surface-900 dark:bg-surface-700 rounded-lg p-3">
                    <div className="text-sm">
                      <div className="font-medium text-surface-900 dark:text-white">
                        {shippingMethod.name}
                      </div>
                      {shippingMethod.description && (
                        <div className="text-surface-600 dark:text-surface-400 mt-1">
                          {shippingMethod.description}
                        </div>
                      )}
                      {shippingMethod.estimatedDays && (
                        <div className="text-xs text-surface-500 dark:text-surface-400 dark:text-surface-500 dark:text-surface-400 mt-1">
                          Entrega estimada: {shippingMethod.estimatedDays} {shippingMethod.estimatedDays === 1 ? 'día' : 'días'}
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="border-t border-surface-200 dark:border-surface-700 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-medium text-surface-900 dark:text-white">Total</span>
                    <span className="text-lg font-medium text-surface-900 dark:text-white">${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <button
                type="submit"
                form="checkout-form"
                disabled={loading}
                className={`w-full mt-6 py-3 px-4 rounded-lg font-medium transition-colors ${
                  loading
                    ? 'bg-surface-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
                } text-white`}
              >
                {loading ? 'Procesando...' : 'Realizar pedido'}
              </button>
              
              <p className="mt-4 text-xs text-surface-500 dark:text-surface-400 text-center">
                Al hacer clic en "Realizar pedido", aceptas nuestros términos y condiciones.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import PageMeta from '../components/SEO/PageMeta'
import { getImageUrl, PLACEHOLDER_IMAGE } from '../utils/imageHelpers'
import ShippingQuote from '../components/Shipping/ShippingQuote'

const Cart = () => {
  const navigate = useNavigate()
  const { 
    cart, 
    removeFromCart, 
    updateCartQuantity, 
    clearCart, 
    getCartTotal, 
    getCartItemsCount,
    isAuthenticated 
  } = useAuthStore()
  
  const [selectedShipping, setSelectedShipping] = useState(null)

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId)
    } else {
      updateCartQuantity(productId, newQuantity)
    }
  }

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/checkout' } })
    } else {
      // Pasar el método de envío seleccionado al checkout
      navigate('/checkout', { 
        state: { 
          shippingMethod: selectedShipping 
        } 
      })
    }
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Carrito de Compras</h1>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
            <div className="py-12">
              <svg className="mx-auto h-24 w-24 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.1 5.4M7 13v8a2 2 0 002 2h6a2 2 0 002-2v-8m-10 0V9a2 2 0 012-2h6a2 2 0 012 2v4.01"></path>
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">Tu carrito está vacío</h3>
              <p className="mt-2 text-gray-600 dark:text-gray-300">¡Empieza a agregar algunos productos geniales!</p>
              <div className="mt-6">
                <Link 
                  to="/productos"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Explorar productos
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <PageMeta 
        title="Carrito de Compras" 
        description="Revisa los productos en tu carrito y procede al pago de manera segura."
        keywords="carrito, compras, checkout, pagar"
      />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Carrito de Compras ({getCartItemsCount()} {getCartItemsCount() === 1 ? 'artículo' : 'artículos'})
            </h1>
          <button
            onClick={clearCart}
            className="text-red-600 hover:text-red-700 font-medium"
          >
            Vaciar carrito
          </button>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">Productos</h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {cart.map((item) => {
                  const imageUrl = getImageUrl(item.image)
                  
                  return (
                    <div key={item.id} className="p-6 flex items-center">
                      <div className="flex-shrink-0">
                        <img
                          src={imageUrl}
                          alt={item.name}
                          className="h-20 w-20 rounded object-cover bg-gray-100 dark:bg-gray-700"
                          onError={(e) => {
                            e.target.src = PLACEHOLDER_IMAGE
                          }}
                        />
                      </div>
                    
                    <div className="ml-6 flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-base font-medium text-gray-900 dark:text-white">{item.name}</h3>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                            ${parseFloat(item.price || 0).toFixed(2)}
                          </p>
                        </div>
                        
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-500 hover:text-red-700 ml-4"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                      
                      <div className="mt-4 flex items-center">
                        <label className="sr-only">Cantidad</label>
                        <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="px-3 py-1 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                          >
                            -
                          </button>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                            className="w-16 text-center border-l border-r border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none"
                          />
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="px-3 py-1 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
                          >
                            +
                          </button>
                        </div>
                        
                        <div className="ml-6 text-base font-medium text-gray-900 dark:text-white">
                          Subtotal: ${(parseFloat(item.price || 0) * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            {/* Shipping Quote */}
            <ShippingQuote 
              cartItems={cart}
              subtotal={getCartTotal()}
              onShippingSelected={setSelectedShipping}
            />

            {/* Order Summary */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Resumen del pedido</h2>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="font-medium dark:text-white">${getCartTotal().toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Envío</span>
                  <span className="font-medium dark:text-white">
                    {selectedShipping ? (
                      selectedShipping.type === 'agreement' || selectedShipping.price === null ? (
                        <span className="text-yellow-600 dark:text-yellow-400">A acordar</span>
                      ) : selectedShipping.price === 0 ? (
                        <span className="text-green-600 dark:text-green-400">Gratis</span>
                      ) : (
                        `$${parseFloat(selectedShipping.price).toFixed(2)}`
                      )
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">Cotizar</span>
                    )}
                  </span>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex justify-between">
                    <span className="text-lg font-medium text-gray-900 dark:text-white">Total</span>
                    <span className="text-lg font-medium text-gray-900 dark:text-white">
                      {selectedShipping?.type === 'agreement' || selectedShipping?.price === null ? (
                        <span className="text-yellow-600 dark:text-yellow-400">A definir</span>
                      ) : (
                        `$${(getCartTotal() + (parseFloat(selectedShipping?.price) || 0)).toFixed(2)}`
                      )}
                    </span>
                  </div>
                </div>

                {selectedShipping && (
                  <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900 dark:text-white mb-1">
                        Método de envío seleccionado:
                      </div>
                      <div className="text-gray-600 dark:text-gray-400">
                        {selectedShipping.name}
                      </div>
                      {selectedShipping.estimatedDays && (
                        <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                          Entrega estimada: {selectedShipping.estimatedDays} {selectedShipping.estimatedDays === 1 ? 'día' : 'días'}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <button
                onClick={handleCheckout}
                disabled={!selectedShipping}
                className="w-full mt-6 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                title={!selectedShipping ? 'Por favor selecciona un método de envío' : ''}
              >
                {isAuthenticated ? 'Proceder al checkout' : 'Iniciar sesión para continuar'}
              </button>
              
              <div className="mt-4 text-center">
                <Link 
                  to="/productos"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Continuar comprando
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default Cart
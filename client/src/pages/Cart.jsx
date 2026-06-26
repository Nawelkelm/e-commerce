import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import PageMeta from '../components/SEO/PageMeta'
import { getImageUrl, PLACEHOLDER_IMAGE } from '../utils/imageHelpers'
import ShippingQuote from '../components/Shipping/ShippingQuote'
import { TrashIcon, MinusIcon, PlusIcon, ShoppingBagIcon } from '@heroicons/react/24/outline'

const Cart = () => {
  const navigate = useNavigate()
  const { cart, removeFromCart, updateCartQuantity, clearCart, getCartTotal, getCartItemsCount, isAuthenticated } = useAuthStore()
  const [selectedShipping, setSelectedShipping] = useState(null)

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) removeFromCart(productId)
    else updateCartQuantity(productId, newQuantity)
  }

  const handleCheckout = () => {
    if (!isAuthenticated) navigate('/login', { state: { from: '/checkout' } })
    else navigate('/checkout', { state: { shippingMethod: selectedShipping } })
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="section-heading mb-8">Carrito de Compras</h1>
        <div className="card p-12 text-center">
          <ShoppingBagIcon className="mx-auto h-16 w-16 text-surface-300 dark:text-surface-600 dark:text-surface-400" />
          <h3 className="mt-4 text-lg font-semibold text-surface-900 dark:text-white">Tu carrito está vacío</h3>
          <p className="mt-2 text-surface-500 dark:text-surface-400">¡Empezá a agregar productos!</p>
          <div className="mt-6">
            <Link to="/productos" className="btn-primary">Explorar productos</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <PageMeta title="Carrito de Compras" description="Revisá los productos en tu carrito." />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="section-heading">
            Carrito ({getCartItemsCount()} {getCartItemsCount() === 1 ? 'artículo' : 'artículos'})
          </h1>
          <button onClick={clearCart} className="text-sm font-medium text-error-500 hover:text-error-600 transition-colors">
            Vaciar carrito
          </button>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Items */}
          <div className="lg:col-span-8 space-y-4">
            {cart.map((item) => (
              <div key={item.id} className="card p-4 sm:p-6 flex items-start gap-4">
                <img
                  src={getImageUrl(item.image)}
                  alt={item.name}
                  className="h-20 w-20 sm:h-24 sm:w-24 rounded-xl object-cover bg-surface-100 dark:bg-surface-800 dark:bg-surface-700 flex-shrink-0"
                  onError={(e) => { e.target.src = PLACEHOLDER_IMAGE }}
                />

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm sm:text-base font-medium text-surface-900 dark:text-white line-clamp-2">{item.name}</h3>
                      <p className="text-lg font-bold text-surface-900 dark:text-white mt-1">
                        ${parseFloat(item.price || 0).toLocaleString('es-AR')}
                      </p>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="p-2 rounded-lg text-surface-400 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-500/10 transition-colors flex-shrink-0">
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center rounded-lg border border-surface-300 dark:border-surface-600 overflow-hidden">
                      <button onClick={() => handleQuantityChange(item.id, item.quantity - 1)} className="px-3 py-1.5 text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:bg-surface-800 dark:hover:bg-surface-700 transition-colors">
                        <MinusIcon className="h-3.5 w-3.5" />
                      </button>
                      <input
                        type="number" min="1" value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                        className="w-12 text-center text-sm font-medium bg-transparent border-x border-surface-300 dark:border-surface-600 text-surface-900 dark:text-white focus:outline-none"
                      />
                      <button onClick={() => handleQuantityChange(item.id, item.quantity + 1)} className="px-3 py-1.5 text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:bg-surface-800 dark:hover:bg-surface-700 transition-colors">
                        <PlusIcon className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <span className="text-sm font-semibold text-surface-900 dark:text-white">
                      ${(parseFloat(item.price || 0) * item.quantity).toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-4 mt-8 lg:mt-0 space-y-4">
            <ShippingQuote cartItems={cart} subtotal={getCartTotal()} onShippingSelected={setSelectedShipping} />

            <div className="card p-6">
              <h2 className="text-base font-semibold text-surface-900 dark:text-white mb-5">Resumen del pedido</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-surface-500 dark:text-surface-400">Subtotal</span>
                  <span className="font-medium text-surface-900 dark:text-white">${getCartTotal().toLocaleString('es-AR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-surface-500 dark:text-surface-400">Envío</span>
                  <span className="font-medium text-surface-900 dark:text-white">
                    {selectedShipping ? (
                      selectedShipping.type === 'agreement' || selectedShipping.price === null
                        ? <span className="text-accent-600 dark:text-accent-400">A acordar</span>
                        : selectedShipping.price === 0
                          ? <span className="text-success-600 dark:text-emerald-400">Gratis</span>
                          : `$${parseFloat(selectedShipping.price).toLocaleString('es-AR')}`
                    ) : <span className="text-surface-400">Cotizar</span>}
                  </span>
                </div>

                <div className="divider" />

                <div className="flex justify-between pt-1">
                  <span className="text-base font-semibold text-surface-900 dark:text-white">Total</span>
                  <span className="text-base font-bold text-surface-900 dark:text-white">
                    {selectedShipping?.type === 'agreement' || selectedShipping?.price === null
                      ? <span className="text-accent-600">A definir</span>
                      : `$${(getCartTotal() + (parseFloat(selectedShipping?.price) || 0)).toLocaleString('es-AR')}`}
                  </span>
                </div>
              </div>

              {selectedShipping && (
                <div className="mt-4 p-3 rounded-lg bg-surface-50 dark:bg-surface-900 dark:bg-surface-700/50 text-sm">
                  <p className="font-medium text-surface-900 dark:text-white">{selectedShipping.name}</p>
                  {selectedShipping.estimatedDays && (
                    <p className="text-caption text-surface-500 dark:text-surface-400 mt-0.5">
                      Entrega estimada: {selectedShipping.estimatedDays} {selectedShipping.estimatedDays === 1 ? 'día' : 'días'}
                    </p>
                  )}
                </div>
              )}

              <button onClick={handleCheckout} disabled={!selectedShipping} className="btn-primary w-full btn-lg mt-6">
                {isAuthenticated ? 'Proceder al checkout' : 'Iniciar sesión para continuar'}
              </button>

              <div className="mt-4 text-center">
                <Link to="/productos" className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 transition-colors">
                  Continuar comprando
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Cart

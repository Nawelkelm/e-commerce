import React, { useState, useEffect } from 'react'
import {
  TruckIcon,
  MapPinIcon,
  BuildingStorefrontIcon,
  HandRaisedIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

const ShippingQuote = ({ cartItems, subtotal, onShippingSelected }) => {
  const [loading, setLoading] = useState(false)
  const [quotes, setQuotes] = useState([])
  const [selectedMethod, setSelectedMethod] = useState(null)
  const [shippingAddress, setShippingAddress] = useState({
    postalCode: '',
    city: '',
    state: ''
  })
  const [showQuotes, setShowQuotes] = useState(false)
  const [error, setError] = useState('')

  const getQuotes = async () => {
    if (!shippingAddress.postalCode || !shippingAddress.city || !shippingAddress.state) {
      setError('Por favor completa todos los campos de dirección')
      return
    }

    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/shipping-methods/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          postalCode: shippingAddress.postalCode,
          city: shippingAddress.city,
          state: shippingAddress.state,
          items: cartItems.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            weight: item.weight || 500, // Default 500g si no tiene peso
            dimensions: item.dimensions || { length: 20, width: 20, height: 10 }
          })),
          subtotal: subtotal
        })
      })

      if (response.ok) {
        const data = await response.json()
        setQuotes(data.quotes || [])
        setShowQuotes(true)
        
        // Auto-seleccionar el primer método si hay alguno
        if (data.quotes && data.quotes.length > 0) {
          handleSelectMethod(data.quotes[0])
        }
      } else {
        setError('Error al obtener cotizaciones')
      }
    } catch (error) {
      console.error('Error getting quotes:', error)
      setError('Error al obtener cotizaciones')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectMethod = (method) => {
    setSelectedMethod(method)
    onShippingSelected(method)
  }

  const getMethodIcon = (type) => {
    switch (type) {
      case 'carrier':
        return <TruckIcon className="h-6 w-6" />
      case 'custom':
        return <TruckIcon className="h-6 w-6" />
      case 'pickup':
        return <BuildingStorefrontIcon className="h-6 w-6" />
      case 'agreement':
        return <HandRaisedIcon className="h-6 w-6" />
      default:
        return <TruckIcon className="h-6 w-6" />
    }
  }

  const getMethodColor = (type) => {
    switch (type) {
      case 'carrier':
        return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400'
      case 'custom':
        return 'text-purple-600 bg-purple-50 dark:bg-purple-900/20 dark:text-purple-400'
      case 'pickup':
        return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400'
      case 'agreement':
        return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400'
      default:
        return 'text-gray-600 bg-gray-50 dark:bg-gray-700 dark:text-gray-400'
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
        <MapPinIcon className="h-5 w-5 mr-2" />
        Cotizar Envío
      </h3>

      {!showQuotes ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Código Postal
            </label>
            <input
              type="text"
              value={shippingAddress.postalCode}
              onChange={(e) => setShippingAddress(prev => ({ ...prev, postalCode: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              placeholder="Ej: 1425"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Ciudad
            </label>
            <input
              type="text"
              value={shippingAddress.city}
              onChange={(e) => setShippingAddress(prev => ({ ...prev, city: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              placeholder="Ej: CABA"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Provincia
            </label>
            <input
              type="text"
              value={shippingAddress.state}
              onChange={(e) => setShippingAddress(prev => ({ ...prev, state: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
              placeholder="Ej: Buenos Aires"
            />
          </div>

          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            onClick={getQuotes}
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Cotizando...
              </>
            ) : (
              'Cotizar Envío'
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <button
            onClick={() => {
              setShowQuotes(false)
              setQuotes([])
              setSelectedMethod(null)
              onShippingSelected(null)
            }}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline mb-2"
          >
            ← Cambiar dirección
          </button>

          <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            <strong>Destino:</strong> {shippingAddress.city}, {shippingAddress.state} (CP: {shippingAddress.postalCode})
          </div>

          {quotes.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No hay métodos de envío disponibles para tu zona
            </div>
          ) : (
            <div className="space-y-3">
              {quotes.map((quote) => (
                <div
                  key={quote.id}
                  onClick={() => handleSelectMethod(quote)}
                  className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedMethod?.id === quote.id
                      ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-indigo-300'
                  }`}
                >
                  {selectedMethod?.id === quote.id && (
                    <div className="absolute top-2 right-2">
                      <CheckCircleIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                    </div>
                  )}

                  <div className="flex items-start">
                    <div className={`p-2 rounded-lg ${getMethodColor(quote.type)}`}>
                      {getMethodIcon(quote.type)}
                    </div>

                    <div className="ml-4 flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {quote.name}
                          </h4>
                          {quote.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {quote.description}
                            </p>
                          )}
                          {quote.estimatedDays && (
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                              Entrega estimada: {quote.estimatedDays} {quote.estimatedDays === 1 ? 'día' : 'días'}
                            </p>
                          )}
                        </div>

                        <div className="text-right ml-4">
                          <div className="font-bold text-lg text-gray-900 dark:text-white">
                            {quote.type === 'agreement' ? (
                              <span className="text-yellow-600 dark:text-yellow-400">A acordar</span>
                            ) : quote.price === 0 ? (
                              <span className="text-green-600 dark:text-green-400">Gratis</span>
                            ) : quote.price === null ? (
                              <span className="text-gray-600 dark:text-gray-400">Variable</span>
                            ) : (
                              `$${parseFloat(quote.price).toFixed(2)}`
                            )}
                          </div>
                          {quote.currency && quote.currency !== 'ARS' && (
                            <div className="text-xs text-gray-500">{quote.currency}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ShippingQuote

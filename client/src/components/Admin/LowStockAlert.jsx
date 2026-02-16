import React, { useState, useEffect } from 'react'
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useAuthStore } from '../../store/authStore'
import { Link } from 'react-router-dom'

const LowStockAlert = () => {
  const [lowStockProducts, setLowStockProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAlert, setShowAlert] = useState(true)
  const { token } = useAuthStore()

  useEffect(() => {
    fetchLowStockProducts()
  }, [])

  const fetchLowStockProducts = async () => {
    try {
      const response = await fetch('/api/products/stock/low', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setLowStockProducts(data.products || [])
      }
    } catch (error) {
      console.error('Error fetching low stock products:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || lowStockProducts.length === 0 || !showAlert) {
    return null
  }

  const outOfStock = lowStockProducts.filter(p => p.stock === 0)
  const lowStock = lowStockProducts.filter(p => p.stock > 0 && p.stock <= p.lowStockThreshold)

  return (
    <div className="mb-6 bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20 border-l-4 border-yellow-400 dark:border-yellow-600 p-4 rounded-r-lg">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Alertas de Stock
          </h3>
          <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
            <p className="mb-2">
              {outOfStock.length > 0 && (
                <span className="font-semibold">
                  {outOfStock.length} producto{outOfStock.length !== 1 ? 's' : ''} sin stock
                </span>
              )}
              {outOfStock.length > 0 && lowStock.length > 0 && ' y '}
              {lowStock.length > 0 && (
                <span className="font-semibold">
                  {lowStock.length} producto{lowStock.length !== 1 ? 's' : ''} con stock bajo
                </span>
              )}
            </p>
            
            <div className="max-h-40 overflow-y-auto space-y-1">
              {outOfStock.slice(0, 3).map(product => (
                <div key={product.id} className="flex items-center justify-between text-xs">
                  <span>
                    <strong>{product.name}</strong> - Sin stock
                  </span>
                  <span className="text-red-600 dark:text-red-400 font-semibold">0</span>
                </div>
              ))}
              {lowStock.slice(0, 3).map(product => (
                <div key={product.id} className="flex items-center justify-between text-xs">
                  <span>
                    <strong>{product.name}</strong> - Stock bajo
                  </span>
                  <span className="text-yellow-600 dark:text-yellow-400 font-semibold">
                    {product.stock} / {product.lowStockThreshold}
                  </span>
                </div>
              ))}
              {(outOfStock.length + lowStock.length) > 6 && (
                <p className="text-xs italic mt-2">
                  ... y {(outOfStock.length + lowStock.length) - 6} más
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="ml-auto pl-3">
          <button
            onClick={() => setShowAlert(false)}
            className="inline-flex text-yellow-400 hover:text-yellow-600 dark:hover:text-yellow-200"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default LowStockAlert

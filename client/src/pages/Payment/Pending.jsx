import React from 'react'
import { Link } from 'react-router-dom'
import { ClockIcon } from '@heroicons/react/24/outline'

const Pending = () => {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 flex items-center justify-center">
      <div className="max-w-md w-full bg-white dark:bg-surface-800 rounded-lg shadow p-6 text-center">
        <ClockIcon className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-4">Pago Pendiente</h1>
        <p className="text-surface-600 dark:text-surface-400 mb-6">
          Tu pago está siendo procesado. Te notificaremos cuando se complete.
        </p>
        <div className="space-y-3">
          <Link
            to="/user/orders"
            className="w-full bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 block"
          >
            Ver Estado del Pedido
          </Link>
          <Link
            to="/"
            className="w-full bg-surface-200 text-surface-900 dark:text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-surface-300 block"
          >
            Continuar Comprando
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Pending
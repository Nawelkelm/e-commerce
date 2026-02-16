import React from 'react'
import { Link } from 'react-router-dom'
import { CheckCircleIcon } from '@heroicons/react/24/outline'

const Success = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow p-6 text-center">
        <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-4">¡Pago Exitoso!</h1>
        <p className="text-gray-600 mb-6">
          Tu pago se ha procesado correctamente. Recibirás un email de confirmación pronto.
        </p>
        <div className="space-y-3">
          <Link
            to="/user/orders"
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 block"
          >
            Ver Mis Pedidos
          </Link>
          <Link
            to="/"
            className="w-full bg-gray-200 text-gray-900 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-300 block"
          >
            Continuar Comprando
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Success
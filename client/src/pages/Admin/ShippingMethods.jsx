import React, { useState, useEffect } from 'react'
import {
  TruckIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  HomeIcon,
  HandRaisedIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../../store/authStore'

const ShippingMethods = () => {
  const [methods, setMethods] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'custom',
    carrier: '',
    description: '',
    price: '',
    isFree: false,
    freeFromAmount: '',
    estimatedDays: '',
    zones: [],
    requiresAddress: true,
    pickupAddress: null,
    displayOrder: 0,
    isActive: true
  })
  const [zoneInput, setZoneInput] = useState('')
  const { token } = useAuthStore()

  const methodTypes = [
    { value: 'carrier', label: 'Carrier Logístico', icon: TruckIcon },
    { value: 'custom', label: 'Envío Propio', icon: TruckIcon },
    { value: 'pickup', label: 'Retiro en Local', icon: BuildingStorefrontIcon },
    { value: 'agreement', label: 'Acordar con Vendedor', icon: HandRaisedIcon }
  ]

  const carriers = ['Andreani', 'OCA', 'Correo Argentino']

  useEffect(() => {
    fetchMethods()
  }, [])

  const fetchMethods = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/shipping-methods', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setMethods(data.methods || [])
      }
    } catch (error) {
      console.error('Error fetching methods:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditing(null)
    setFormData({
      name: '',
      code: '',
      type: 'custom',
      carrier: '',
      description: '',
      price: '',
      isFree: false,
      freeFromAmount: '',
      estimatedDays: '',
      zones: [],
      requiresAddress: true,
      pickupAddress: null,
      displayOrder: 0,
      isActive: true
    })
    setShowModal(true)
  }

  const handleEdit = (method) => {
    setEditing(method.id)
    setFormData({
      name: method.name,
      code: method.code,
      type: method.type,
      carrier: method.carrier || '',
      description: method.description || '',
      price: method.price || '',
      isFree: method.isFree,
      freeFromAmount: method.freeFromAmount || '',
      estimatedDays: method.estimatedDays || '',
      zones: method.zones || [],
      requiresAddress: method.requiresAddress,
      pickupAddress: method.pickupAddress,
      displayOrder: method.displayOrder,
      isActive: method.isActive
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    try {
      const url = editing 
        ? `/api/shipping-methods/${editing}`
        : '/api/shipping-methods'
      
      const method = editing ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert(editing ? 'Método actualizado' : 'Método creado')
        setShowModal(false)
        fetchMethods()
      } else {
        const error = await response.json()
        alert(`Error: ${error.message}`)
      }
    } catch (error) {
      console.error('Error saving method:', error)
      alert('Error al guardar')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este método de envío?')) return

    try {
      const response = await fetch(`/api/shipping-methods/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        alert('Método eliminado')
        fetchMethods()
      }
    } catch (error) {
      console.error('Error deleting method:', error)
    }
  }

  const handleToggle = async (id) => {
    try {
      const response = await fetch(`/api/shipping-methods/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        fetchMethods()
      }
    } catch (error) {
      console.error('Error toggling method:', error)
    }
  }

  const addZone = () => {
    if (zoneInput.trim()) {
      setFormData(prev => ({
        ...prev,
        zones: [...prev.zones, zoneInput.trim()]
      }))
      setZoneInput('')
    }
  }

  const removeZone = (index) => {
    setFormData(prev => ({
      ...prev,
      zones: prev.zones.filter((_, i) => i !== index)
    }))
  }

  const getTypeIcon = (type) => {
    const typeConfig = methodTypes.find(t => t.value === type)
    const Icon = typeConfig?.icon || TruckIcon
    return <Icon className="h-5 w-5" />
  }

  const getTypeBadge = (type) => {
    const colors = {
      carrier: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      custom: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      pickup: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      agreement: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    }
    const labels = {
      carrier: 'Carrier',
      custom: 'Propio',
      pickup: 'Retiro',
      agreement: 'Acordar'
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[type]}`}>
        {labels[type]}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Métodos de Envío</h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Gestiona los métodos de envío disponibles para tus clientes
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Crear Método
        </button>
      </div>

      {/* Methods Table */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Método
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Precio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Días Est.
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {methods.map((method) => (
              <tr key={method.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {getTypeIcon(method.type)}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {method.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {method.code}
                      </div>
                      {method.carrier && (
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {method.carrier}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getTypeBadge(method.type)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {method.type === 'carrier' ? (
                    <span className="text-blue-600 dark:text-blue-400">Cotización</span>
                  ) : method.isFree ? (
                    <span className="text-green-600 dark:text-green-400">Gratis</span>
                  ) : method.freeFromAmount ? (
                    <span>
                      ${parseFloat(method.price || 0).toFixed(2)}
                      <br />
                      <span className="text-xs text-gray-500">
                        Gratis desde ${parseFloat(method.freeFromAmount).toFixed(2)}
                      </span>
                    </span>
                  ) : (
                    `$${parseFloat(method.price || 0).toFixed(2)}`
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {method.estimatedDays ? `${method.estimatedDays} días` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggle(method.id)}
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      method.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {method.isActive ? 'Activo' : 'Inactivo'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(method)}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(method.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editing ? 'Editar Método' : 'Crear Método'} de Envío
              </h2>
            </div>

            <div className="p-6 space-y-4">
              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  placeholder="Ej: Envío Express"
                />
              </div>

              {/* Código */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Código <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase().replace(/\s/g, '_') }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  placeholder="Ej: ENVIO_EXPRESS"
                  disabled={editing}
                />
                <p className="mt-1 text-xs text-gray-500">Identificador único (sin espacios)</p>
              </div>

              {/* Tipo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                >
                  {methodTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>

              {/* Carrier (si type es carrier) */}
              {formData.type === 'carrier' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Carrier <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.carrier}
                    onChange={(e) => setFormData(prev => ({ ...prev, carrier: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Seleccionar...</option>
                    {carriers.map(carrier => (
                      <option key={carrier} value={carrier}>{carrier}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Descripción */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descripción
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  placeholder="Descripción del método de envío"
                />
              </div>

              {/* Precio (si no es carrier) */}
              {formData.type !== 'carrier' && (
                <>
                  <div className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      id="isFree"
                      checked={formData.isFree}
                      onChange={(e) => setFormData(prev => ({ ...prev, isFree: e.target.checked }))}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isFree" className="ml-2 block text-sm text-gray-900 dark:text-white">
                      Envío Gratis
                    </label>
                  </div>

                  {!formData.isFree && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Precio
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Gratis desde (opcional)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.freeFromAmount}
                          onChange={(e) => setFormData(prev => ({ ...prev, freeFromAmount: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Días estimados */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Días Estimados de Entrega
                </label>
                <input
                  type="number"
                  value={formData.estimatedDays}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedDays: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  placeholder="Ej: 3"
                />
              </div>

              {/* Zonas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Zonas de Cobertura
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={zoneInput}
                    onChange={(e) => setZoneInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addZone()}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                    placeholder="Ej: CABA, 1000-1999, Buenos Aires"
                  />
                  <button
                    type="button"
                    onClick={addZone}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Agregar
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.zones.map((zone, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                    >
                      {zone}
                      <button
                        type="button"
                        onClick={() => removeZone(index)}
                        className="ml-2 text-red-600 hover:text-red-800"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <p className="mt-1 text-xs text-gray-500">Dejar vacío para aplicar a todas las zonas</p>
              </div>

              {/* Orden de visualización */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Orden de Visualización
                </label>
                <input
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                  placeholder="0"
                />
                <p className="mt-1 text-xs text-gray-500">Menor número aparece primero</p>
              </div>

              {/* Estado activo */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900 dark:text-white">
                  Activar método
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 px-6 py-4 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
              >
                {editing ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ShippingMethods

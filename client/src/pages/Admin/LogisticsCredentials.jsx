import React, { useState, useEffect } from 'react'
import {
  KeyIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  EyeSlashIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../../store/authStore'

const LogisticsCredentials = () => {
  const [credentials, setCredentials] = useState([])
  const [loading, setLoading] = useState(true)
  const [editingCarrier, setEditingCarrier] = useState(null)
  const [formData, setFormData] = useState({})
  const [showPassword, setShowPassword] = useState({})
  const [testing, setTesting] = useState(null)
  const { token } = useAuthStore()

  const carrierFields = {
    'Andreani': [
      { key: 'username', label: 'Usuario', type: 'text', required: true },
      { key: 'password', label: 'Contraseña', type: 'password', required: true },
      { key: 'contract', label: 'Número de Contrato', type: 'text', required: true },
      { key: 'apiUrl', label: 'URL API', type: 'text', required: false, default: 'https://api.andreani.com/v2' }
    ],
    'OCA': [
      { key: 'cuit', label: 'CUIT', type: 'text', required: true },
      { key: 'operativa', label: 'Código Operativa', type: 'text', required: true },
      { key: 'password', label: 'Contraseña', type: 'password', required: true },
      { key: 'apiUrl', label: 'URL API', type: 'text', required: false, default: 'https://webservice.oca.com.ar/epak_tracking/Oep_TrackEPak.asmx' }
    ],
    'Correo Argentino': [
      { key: 'apiKey', label: 'API Key', type: 'password', required: true },
      { key: 'clientId', label: 'Client ID', type: 'text', required: true },
      { key: 'apiUrl', label: 'URL API', type: 'text', required: false, default: 'https://api.correoargentino.com.ar' }
    ]
  }

  useEffect(() => {
    fetchCredentials()
  }, [])

  const fetchCredentials = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/logistics-credentials', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCredentials(data.credentials || [])
      }
    } catch (error) {
      console.error('Error fetching credentials:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (carrier) => {
    const existingCred = credentials.find(c => c.carrier === carrier)
    if (existingCred) {
      setFormData({
        carrier,
        isActive: existingCred.isActive,
        credentials: existingCred.credentials
      })
    } else {
      const defaultCredentials = {}
      carrierFields[carrier].forEach(field => {
        defaultCredentials[field.key] = field.default || ''
      })
      setFormData({
        carrier,
        isActive: false,
        credentials: defaultCredentials
      })
    }
    setEditingCarrier(carrier)
  }

  const handleInputChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      credentials: {
        ...prev.credentials,
        [key]: value
      }
    }))
  }

  const handleSave = async () => {
    try {
      // Validar campos requeridos
      const fields = carrierFields[editingCarrier]
      const missingFields = fields
        .filter(f => f.required && !formData.credentials[f.key])
        .map(f => f.label)

      if (missingFields.length > 0) {
        alert(`Campos requeridos faltantes: ${missingFields.join(', ')}`)
        return
      }

      const response = await fetch('/api/logistics-credentials', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert('Credenciales guardadas exitosamente')
        setEditingCarrier(null)
        fetchCredentials()
      } else {
        const error = await response.json()
        alert(`Error: ${error.message}`)
      }
    } catch (error) {
      console.error('Error saving credentials:', error)
      alert('Error al guardar las credenciales')
    }
  }

  const handleTest = async (carrier) => {
    try {
      setTesting(carrier)
      const response = await fetch(`/api/logistics-credentials/${carrier}/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        alert('✅ Conexión exitosa!')
        fetchCredentials()
      } else {
        const error = await response.json()
        alert(`❌ Error de conexión: ${error.message || error.error}`)
      }
    } catch (error) {
      console.error('Error testing credentials:', error)
      alert('Error al probar la conexión')
    } finally {
      setTesting(null)
    }
  }

  const handleToggle = async (carrier) => {
    try {
      const response = await fetch(`/api/logistics-credentials/${carrier}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        fetchCredentials()
      } else {
        alert('Error al cambiar el estado')
      }
    } catch (error) {
      console.error('Error toggling status:', error)
    }
  }

  const getStatusBadge = (cred) => {
    if (!cred) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-100 dark:bg-surface-800 text-surface-800 dark:bg-surface-700 dark:text-surface-300">
          No configurado
        </span>
      )
    }

    if (!cred.isActive) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-100 dark:bg-surface-800 text-surface-800 dark:bg-surface-700 dark:text-surface-300">
          Inactivo
        </span>
      )
    }

    switch (cred.syncStatus) {
      case 'success':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircleIcon className="h-4 w-4 mr-1" />
            Activo
          </span>
        )
      case 'error':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <XCircleIcon className="h-4 w-4 mr-1" />
            Error
          </span>
        )
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
            Pendiente
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-100 dark:bg-surface-800 text-surface-800 dark:bg-surface-700 dark:text-surface-300">
            Sin probar
          </span>
        )
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Credenciales de Logística</h1>
        <p className="mt-2 text-sm text-surface-700 dark:text-surface-300">
          Configura las credenciales de API para los servicios de logística
        </p>
      </div>

      {/* Carriers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {Object.keys(carrierFields).map(carrier => {
          const cred = credentials.find(c => c.carrier === carrier)
          
          return (
            <div key={carrier} className="bg-white dark:bg-surface-800 rounded-lg shadow-sm border border-surface-200 dark:border-surface-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-surface-900 dark:text-white">{carrier}</h3>
                  <div className="mt-2">
                    {getStatusBadge(cred)}
                  </div>
                </div>
                <KeyIcon className="h-8 w-8 text-surface-400" />
              </div>

              {cred && cred.lastError && (
                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded text-sm text-red-800 dark:text-red-200">
                  <p className="font-medium">Último error:</p>
                  <p className="mt-1">{cred.lastError}</p>
                </div>
              )}

              {cred && cred.lastSyncAt && (
                <p className="text-xs text-surface-500 dark:text-surface-400 mb-4">
                  Última sincronización: {new Date(cred.lastSyncAt).toLocaleString('es-ES')}
                </p>
              )}

              <div className="space-y-2">
                <button
                  onClick={() => handleEdit(carrier)}
                  className="w-full px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  {cred ? 'Editar Credenciales' : 'Configurar'}
                </button>

                {cred && (
                  <>
                    <button
                      onClick={() => handleTest(carrier)}
                      disabled={testing === carrier}
                      className="w-full px-4 py-2 text-sm font-medium text-surface-700 dark:text-surface-300 dark:text-surface-200 bg-white dark:bg-surface-800 dark:bg-surface-700 border border-surface-300 dark:border-surface-600 rounded-md hover:bg-surface-50 dark:bg-surface-900 dark:hover:bg-surface-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                    >
                      {testing === carrier ? (
                        <>
                          <ArrowPathIcon className="inline h-4 w-4 mr-2 animate-spin" />
                          Probando...
                        </>
                      ) : (
                        'Probar Conexión'
                      )}
                    </button>

                    <button
                      onClick={() => handleToggle(carrier)}
                      className={`w-full px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 ${
                        cred.isActive
                          ? 'text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/30'
                          : 'text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/30'
                      }`}
                    >
                      {cred.isActive ? 'Desactivar' : 'Activar'}
                    </button>
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Edit Modal */}
      {editingCarrier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-surface-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-surface-800 border-b border-surface-200 dark:border-surface-700 px-6 py-4">
              <h2 className="text-xl font-bold text-surface-900 dark:text-white">
                Configurar {editingCarrier}
              </h2>
            </div>

            <div className="p-6 space-y-4">
              {carrierFields[editingCarrier].map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                    {field.label} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  <div className="relative">
                    <input
                      type={field.type === 'password' && !showPassword[field.key] ? 'password' : 'text'}
                      value={formData.credentials?.[field.key] || ''}
                      onChange={(e) => handleInputChange(field.key, e.target.value)}
                      className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-surface-700 dark:text-white"
                      placeholder={field.default || ''}
                    />
                    {field.type === 'password' && (
                      <button
                        type="button"
                        onClick={() => setShowPassword(prev => ({ ...prev, [field.key]: !prev[field.key] }))}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-surface-400 hover:text-surface-600 dark:text-surface-400"
                      >
                        {showPassword[field.key] ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive || false}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-surface-300 dark:border-surface-600 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-surface-900 dark:text-white">
                  Activar automáticamente después de guardar
                </label>
              </div>
            </div>

            <div className="sticky bottom-0 bg-surface-50 dark:bg-surface-900 px-6 py-4 flex justify-end gap-3 border-t border-surface-200 dark:border-surface-700">
              <button
                onClick={() => setEditingCarrier(null)}
                className="px-4 py-2 text-sm font-medium text-surface-700 dark:text-surface-300 bg-white dark:bg-surface-800 dark:bg-surface-700 border border-surface-300 dark:border-surface-600 rounded-md hover:bg-surface-50 dark:bg-surface-900 dark:hover:bg-surface-600"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LogisticsCredentials

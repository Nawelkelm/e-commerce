import React, { useState, useEffect } from 'react'
import { 
  CogIcon, 
  PhotoIcon,
  CheckIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../../store/authStore'

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general')
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [logoPreview, setLogoPreview] = useState('')
  const { token } = useAuthStore()

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/settings', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setSettings(data)
          if (data.site_logo?.value) {
            setLogoPreview(data.site_logo.value)
          }
        }
      } catch (error) {
        console.error('Error loading settings:', error)
        setError('Error al cargar configuraciones')
      } finally {
        setLoading(false)
      }
    }
    
    if (token) {
      loadSettings()
    }
  }, [token])

  const tabs = [
    { id: 'general', name: 'General', icon: CogIcon },
    { id: 'appearance', name: 'Apariencia', icon: PhotoIcon },
  ]

  const handleSave = async (key, value) => {
    try {
      setSaving(true)
      setError('')
      const response = await fetch(`/api/admin/settings/${key}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ value })
      })
      
      if (response.ok) {
        setSuccess('Configuración guardada exitosamente')
        setTimeout(() => setSuccess(''), 3000)
        
        // Update local state
        setSettings(prev => ({
          ...prev,
          [key]: { ...prev[key], value }
        }))
      } else {
        setError('Error al guardar configuración')
      }
    } catch (error) {
      console.error('Error saving setting:', error)
      setError('Error al guardar configuración')
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setError('Tipo de archivo inválido. Solo se permiten imágenes JPG, PNG, GIF, SVG y WebP')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('El archivo es demasiado grande. Máximo 5MB')
      return
    }

    try {
      setUploading(true)
      setError('')
      
      const formData = new FormData()
      formData.append('logo', file)

      const response = await fetch('/api/admin/settings/upload-logo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })
      
      if (response.ok) {
        const data = await response.json()
        setSuccess('Logo subido exitosamente')
        setTimeout(() => setSuccess(''), 3000)
        
        // Update preview
        setLogoPreview(data.logoUrl)
        
        // Update settings
        setSettings(prev => ({
          ...prev,
          site_logo: { ...prev.site_logo, value: data.logoUrl }
        }))
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Error al subir el logo')
      }
    } catch (error) {
      console.error('Error uploading logo:', error)
      setError('Error al subir el logo')
    } finally {
      setUploading(false)
    }
  }

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Información de la Tienda</h3>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nombre de la tienda
            </label>
            <input
              type="text"
              value={settings.site_name?.value || ''}
              onChange={(e) => setSettings({...settings, site_name: {...settings.site_name, value: e.target.value}})}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              onClick={() => handleSave('site_name', settings.site_name?.value)}
              disabled={saving}
              className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar Nombre'}
            </button>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              value={settings.site_description?.value || ''}
              onChange={(e) => setSettings({...settings, site_description: {...settings.site_description, value: e.target.value}})}
              rows={3}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              onClick={() => handleSave('site_description', settings.site_description?.value)}
              disabled={saving}
              className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar Descripción'}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email de Contacto
            </label>
            <input
              type="email"
              value={settings.site_email?.value || ''}
              onChange={(e) => setSettings({...settings, site_email: {...settings.site_email, value: e.target.value}})}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              onClick={() => handleSave('site_email', settings.site_email?.value)}
              disabled={saving}
              className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar Email'}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Teléfono
            </label>
            <input
              type="text"
              value={settings.site_phone?.value || ''}
              onChange={(e) => setSettings({...settings, site_phone: {...settings.site_phone, value: e.target.value}})}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              onClick={() => handleSave('site_phone', settings.site_phone?.value)}
              disabled={saving}
              className="mt-2 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar Teléfono'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Logo de la Tienda</h3>
        
        {/* Logo Preview */}
        {logoPreview && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vista Previa
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
              <img 
                src={logoPreview} 
                alt="Logo preview" 
                className="h-16 w-auto object-contain"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle"%3EError%3C/text%3E%3C/svg%3E'
                }}
              />
            </div>
          </div>
        )}

        {/* Upload Logo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Subir Nuevo Logo
          </label>
          <div className="flex items-center space-x-4">
            <label className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm cursor-pointer hover:bg-gray-50">
              <CloudArrowUpIcon className="h-5 w-5 text-gray-400 mr-2" />
              <span className="text-sm text-gray-700">
                {uploading ? 'Subiendo...' : 'Seleccionar Archivo'}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
            <span className="text-sm text-gray-500">
              JPG, PNG, GIF, SVG o WebP (máx. 5MB)
            </span>
          </div>
        </div>

        {/* URL Logo Alternative */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700">
            O ingresa una URL
          </label>
          <div className="mt-1 flex space-x-2">
            <input
              type="url"
              value={settings.site_logo?.value || ''}
              onChange={(e) => {
                const newValue = e.target.value
                setSettings({...settings, site_logo: {...settings.site_logo, value: newValue}})
                setLogoPreview(newValue)
              }}
              placeholder="https://ejemplo.com/logo.png"
              className="flex-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              onClick={() => handleSave('site_logo', settings.site_logo?.value)}
              disabled={saving}
              className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
          <p className="mt-2 text-sm text-gray-700">
            Personaliza la configuración de tu tienda
          </p>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 rounded-md bg-green-50 p-4">
          <div className="flex">
            <CheckIcon className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">{success}</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="h-5 w-5 mr-2" />
                {tab.name}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow rounded-lg p-6">
        {activeTab === 'general' && renderGeneralSettings()}
        {activeTab === 'appearance' && renderAppearanceSettings()}
      </div>
    </div>
  )
}

export default Settings

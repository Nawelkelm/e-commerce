import React, { useState, useEffect } from 'react'
import { 
  CogIcon, 
  PhotoIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../../store/authStore'

const Settings = () => {
  const [settings, setSettings] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
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
        }
      } catch (error) {
        console.error('Error loading settings:', error)
      } finally {
        setLoading(false)
      }
    }
    
    if (token) {
      loadSettings()
    }
  }, [token])

  const handleSave = async (key) => {
    try {
      setSaving(true)
      const value = settings[key]?.value
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
      }
    } catch (error) {
      console.error('Error saving setting:', error)
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: { ...prev[key], value }
    }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="mt-2 text-sm text-gray-700">
          Gestiona la configuración de tu tienda
        </p>
      </div>

      {success && (
        <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center">
          <CheckIcon className="h-5 w-5 mr-2" />
          {success}
        </div>
      )}

      {/* General Settings */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-center mb-6">
          <CogIcon className="h-6 w-6 text-gray-400 mr-3" />
          <h2 className="text-lg font-medium text-gray-900">Configuración General</h2>
        </div>
        
        <div className="space-y-6">
          {/* Site Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {settings.site_name?.displayName || 'Nombre del Sitio'}
            </label>
            <input
              type="text"
              value={settings.site_name?.value || ''}
              onChange={(e) => updateSetting('site_name', e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="E-Commerce"
            />
            <p className="mt-1 text-sm text-gray-500">
              {settings.site_name?.description}
            </p>
          </div>

          {/* Site Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {settings.site_description?.displayName || 'Descripción'}
            </label>
            <textarea
              value={settings.site_description?.value || ''}
              onChange={(e) => updateSetting('site_description', e.target.value)}
              rows={3}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Descripción de tu tienda"
            />
            <p className="mt-1 text-sm text-gray-500">
              {settings.site_description?.description}
            </p>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {settings.site_email?.displayName || 'Email'}
              </label>
              <input
                type="email"
                value={settings.site_email?.value || ''}
                onChange={(e) => updateSetting('site_email', e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="info@ejemplo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {settings.site_phone?.displayName || 'Teléfono'}
              </label>
              <input
                type="tel"
                value={settings.site_phone?.value || ''}
                onChange={(e) => updateSetting('site_phone', e.target.value)}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="+54 9 11 1234-5678"
              />
            </div>
          </div>

          <button
            onClick={() => {
              handleSave('site_name')
              handleSave('site_description')
              handleSave('site_email')
              handleSave('site_phone')
            }}
            disabled={saving}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar Configuración General'}
          </button>
        </div>
      </div>

      {/* Appearance Settings */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center mb-6">
          <PhotoIcon className="h-6 w-6 text-gray-400 mr-3" />
          <h2 className="text-lg font-medium text-gray-900">Apariencia</h2>
        </div>
        
        <div className="space-y-6">
          {/* Site Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {settings.site_logo?.displayName || 'Logo del Sitio'}
            </label>
            <input
              type="url"
              value={settings.site_logo?.value || ''}
              onChange={(e) => updateSetting('site_logo', e.target.value)}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="https://ejemplo.com/logo.png"
            />
            <p className="mt-1 text-sm text-gray-500">
              {settings.site_logo?.description || 'URL de la imagen del logo. Deja vacío para mostrar el nombre de la tienda.'}
            </p>
            
            {/* Logo Preview */}
            {settings.site_logo?.value && (
              <div className="mt-4 p-4 border border-gray-200 rounded-md">
                <p className="text-sm text-gray-600 mb-2">Vista previa:</p>
                <img 
                  src={settings.site_logo.value} 
                  alt="Logo preview" 
                  className="h-12 w-auto"
                  onError={(e) => {
                    e.target.style.display = 'none'
                    e.target.nextSibling.style.display = 'block'
                  }}
                />
                <p className="text-sm text-red-600 hidden">Error al cargar la imagen</p>
              </div>
            )}
          </div>

          <button
            onClick={() => handleSave('site_logo')}
            disabled={saving}
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar Logo'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Settings

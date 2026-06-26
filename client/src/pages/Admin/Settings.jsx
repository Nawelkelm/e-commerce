import React, { useState, useEffect } from 'react'
import { 
  CogIcon, 
  PhotoIcon,
  HomeIcon,
  CheckIcon,
  CloudArrowUpIcon,
  PlusIcon,
  TrashIcon,
  ShoppingBagIcon,
  TruckIcon,
  ShieldCheckIcon,
  SparklesIcon,
  HeartIcon,
  StarIcon,
  BoltIcon,
  GiftIcon,
  CreditCardIcon,
  ClockIcon,
  TagIcon,
  ChatBubbleLeftIcon,
  PencilIcon,
  CubeIcon,
  FireIcon,
  LightBulbIcon,
  RocketLaunchIcon,
  HandThumbUpIcon,
  UserGroupIcon,
  BuildingStorefrontIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CheckBadgeIcon,
  AcademicCapIcon,
  BeakerIcon,
  BriefcaseIcon,
  CalendarIcon,
  CameraIcon,
  ChartBarIcon,
  DocumentTextIcon,
  FaceSmileIcon,
  FingerPrintIcon,
  MegaphoneIcon,
  MusicalNoteIcon,
  PaintBrushIcon,
  PuzzlePieceIcon,
  TrophyIcon,
  WrenchScrewdriverIcon
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
  const [sliders, setSliders] = useState([])
  const [newSlider, setNewSlider] = useState({ title: '', subtitle: '', image: '', link: '', order: 0 })
  const [sections, setSections] = useState([])
  const [newSection, setNewSection] = useState({ 
    title: '', 
    subtitle: '', 
    icon: 'ShoppingBagIcon',
    backgroundColor: '#f3f4f6',
    textColor: '#111827',
    buttonText: 'Ver más',
    buttonLink: '',
    order: 0,
    enabled: true
  })
  const { token } = useAuthStore()

  // Available icons
  const availableIcons = [
    'ShoppingBagIcon', 'TruckIcon', 'ShieldCheckIcon', 'SparklesIcon',
    'HeartIcon', 'StarIcon', 'BoltIcon', 'GiftIcon', 
    'CreditCardIcon', 'ClockIcon', 'TagIcon', 'ChatBubbleLeftIcon',
    'CubeIcon', 'FireIcon', 'LightBulbIcon', 'RocketLaunchIcon',
    'HandThumbUpIcon', 'UserGroupIcon', 'BuildingStorefrontIcon', 'CurrencyDollarIcon',
    'GlobeAltIcon', 'EnvelopeIcon', 'PhoneIcon', 'MapPinIcon',
    'HomeIcon', 'CheckBadgeIcon', 'AcademicCapIcon', 'BeakerIcon',
    'BriefcaseIcon', 'CalendarIcon', 'CameraIcon', 'ChartBarIcon',
    'DocumentTextIcon', 'FaceSmileIcon', 'FingerPrintIcon', 'MegaphoneIcon',
    'MusicalNoteIcon', 'PaintBrushIcon', 'PuzzlePieceIcon', 'TrophyIcon',
    'WrenchScrewdriverIcon'
  ]

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
          
          // Load sliders from home_sliders setting
          if (data.home_sliders?.value) {
            try {
              const slidersData = JSON.parse(data.home_sliders.value)
              setSliders(Array.isArray(slidersData) ? slidersData : [])
            } catch (e) {
              setSliders([])
            }
          }
          
          // Load sections from home_sections setting
          if (data.home_sections?.value) {
            try {
              const sectionsData = JSON.parse(data.home_sections.value)
              setSections(Array.isArray(sectionsData) ? sectionsData : [])
            } catch (e) {
              setSections([])
            }
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

  const handleAddSlider = async () => {
    if (!newSlider.title || !newSlider.image) {
      setError('El título y la imagen son obligatorios')
      return
    }

    const updatedSliders = [...sliders, { ...newSlider, id: Date.now() }]
    await handleSave('home_sliders', JSON.stringify(updatedSliders))
    setSliders(updatedSliders)
    setNewSlider({ title: '', subtitle: '', image: '', link: '', order: 0 })
  }

  const handleDeleteSlider = async (id) => {
    const updatedSliders = sliders.filter(s => s.id !== id)
    await handleSave('home_sliders', JSON.stringify(updatedSliders))
    setSliders(updatedSliders)
  }

  const handleUpdateSlider = async (id, field, value) => {
    const updatedSliders = sliders.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    )
    setSliders(updatedSliders)
  }

  const handleSaveSliders = async () => {
    await handleSave('home_sliders', JSON.stringify(sliders))
  }

  const handleAddSection = async () => {
    if (!newSection.title) {
      setError('El título es obligatorio')
      return
    }

    const updatedSections = [...sections, { ...newSection, id: Date.now() }]
    await handleSave('home_sections', JSON.stringify(updatedSections))
    setSections(updatedSections)
    setNewSection({ 
      title: '', 
      subtitle: '', 
      icon: 'ShoppingBagIcon',
      backgroundColor: '#f3f4f6',
      textColor: '#111827',
      buttonText: 'Ver más',
      buttonLink: '',
      order: 0,
      enabled: true
    })
  }

  const handleDeleteSection = async (id) => {
    const updatedSections = sections.filter(s => s.id !== id)
    await handleSave('home_sections', JSON.stringify(updatedSections))
    setSections(updatedSections)
  }

  const handleUpdateSection = async (id, field, value) => {
    const updatedSections = sections.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    )
    setSections(updatedSections)
  }

  const handleSaveSections = async () => {
    await handleSave('home_sections', JSON.stringify(sections))
  }

  const getIconComponent = (iconName) => {
    const icons = {
      ShoppingBagIcon, TruckIcon, ShieldCheckIcon, SparklesIcon,
      HeartIcon, StarIcon, BoltIcon, GiftIcon,
      CreditCardIcon, ClockIcon, TagIcon, ChatBubbleLeftIcon,
      CubeIcon, FireIcon, LightBulbIcon, RocketLaunchIcon,
      HandThumbUpIcon, UserGroupIcon, BuildingStorefrontIcon, CurrencyDollarIcon,
      GlobeAltIcon, EnvelopeIcon, PhoneIcon, MapPinIcon,
      HomeIcon, CheckBadgeIcon, AcademicCapIcon, BeakerIcon,
      BriefcaseIcon, CalendarIcon, CameraIcon, ChartBarIcon,
      DocumentTextIcon, FaceSmileIcon, FingerPrintIcon, MegaphoneIcon,
      MusicalNoteIcon, PaintBrushIcon, PuzzlePieceIcon, TrophyIcon,
      WrenchScrewdriverIcon
    }
    return icons[iconName] || ShoppingBagIcon
  }

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-surface-900 dark:text-white mb-4">Información de la Tienda</h3>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
              Nombre de la tienda
            </label>
            <input
              type="text"
              value={settings.site_name?.value || ''}
              onChange={(e) => setSettings({...settings, site_name: {...settings.site_name, value: e.target.value}})}
              className="mt-1 block w-full border-surface-300 dark:border-surface-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-surface-700 dark:text-white"
            />
            <button
              onClick={() => handleSave('site_name', settings.site_name?.value)}
              disabled={saving}
              className="mt-2 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar Nombre'}
            </button>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
              Descripción
            </label>
            <textarea
              value={settings.site_description?.value || ''}
              onChange={(e) => setSettings({...settings, site_description: {...settings.site_description, value: e.target.value}})}
              rows={3}
              className="mt-1 block w-full border-surface-300 dark:border-surface-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-surface-700 dark:text-white"
            />
            <button
              onClick={() => handleSave('site_description', settings.site_description?.value)}
              disabled={saving}
              className="mt-2 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar Descripción'}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
              Email de Contacto
            </label>
            <input
              type="email"
              value={settings.site_email?.value || ''}
              onChange={(e) => setSettings({...settings, site_email: {...settings.site_email, value: e.target.value}})}
              className="mt-1 block w-full border-surface-300 dark:border-surface-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-surface-700 dark:text-white"
            />
            <button
              onClick={() => handleSave('site_email', settings.site_email?.value)}
              disabled={saving}
              className="mt-2 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar Email'}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
              Teléfono
            </label>
            <input
              type="text"
              value={settings.site_phone?.value || ''}
              onChange={(e) => setSettings({...settings, site_phone: {...settings.site_phone, value: e.target.value}})}
              className="mt-1 block w-full border-surface-300 dark:border-surface-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-surface-700 dark:text-white"
            />
            <button
              onClick={() => handleSave('site_phone', settings.site_phone?.value)}
              disabled={saving}
              className="mt-2 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
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
        <h3 className="text-lg font-medium text-surface-900 dark:text-white mb-4">Logo de la Tienda</h3>
        
        {/* Logo Preview */}
        {logoPreview && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
              Vista Previa
            </label>
            <div className="border-2 border-dashed border-surface-300 dark:border-surface-600 rounded-lg p-4 bg-surface-50 dark:bg-surface-900 dark:bg-surface-800">
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
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
            Subir Nuevo Logo
          </label>
          <div className="flex items-center space-x-4">
            <label className="flex items-center px-4 py-2 bg-white dark:bg-surface-800 dark:bg-surface-700 border border-surface-300 dark:border-surface-600 rounded-md shadow-sm cursor-pointer hover:bg-surface-50 dark:bg-surface-900 dark:hover:bg-surface-600">
              <CloudArrowUpIcon className="h-5 w-5 text-surface-400 dark:text-surface-300 mr-2" />
              <span className="text-sm text-surface-700 dark:text-surface-300">
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
            <span className="text-sm text-surface-500 dark:text-surface-400">
              JPG, PNG, GIF, SVG o WebP (máx. 5MB)
            </span>
          </div>
        </div>

        {/* URL Logo Alternative */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
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
              className="flex-1 block w-full border-surface-300 dark:border-surface-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-surface-700 dark:text-white"
            />
            <button
              onClick={() => handleSave('site_logo', settings.site_logo?.value)}
              disabled={saving}
              className="bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderHomeSettings = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-surface-900 dark:text-white mb-4">Sliders del Home</h3>
        
        {/* Existing Sliders */}
        <div className="space-y-4 mb-6">
          {sliders.map((slider, index) => (
            <div key={slider.id} className="border border-surface-300 dark:border-surface-600 rounded-lg p-4 bg-surface-50 dark:bg-surface-900 dark:bg-surface-800">
              <div className="flex items-start justify-between mb-4">
                <h4 className="text-md font-medium text-surface-900 dark:text-white">Slider #{index + 1}</h4>
                <button
                  onClick={() => handleDeleteSlider(slider.id)}
                  className="text-red-600 hover:text-red-800 dark:text-red-400"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Título</label>
                  <input
                    type="text"
                    value={slider.title}
                    onChange={(e) => handleUpdateSlider(slider.id, 'title', e.target.value)}
                    className="mt-1 block w-full border-surface-300 dark:border-surface-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-surface-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Subtítulo</label>
                  <input
                    type="text"
                    value={slider.subtitle || ''}
                    onChange={(e) => handleUpdateSlider(slider.id, 'subtitle', e.target.value)}
                    className="mt-1 block w-full border-surface-300 dark:border-surface-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-surface-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">URL de Imagen</label>
                  <input
                    type="url"
                    value={slider.image}
                    onChange={(e) => handleUpdateSlider(slider.id, 'image', e.target.value)}
                    className="mt-1 block w-full border-surface-300 dark:border-surface-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-surface-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Enlace (opcional)</label>
                  <input
                    type="url"
                    value={slider.link || ''}
                    onChange={(e) => handleUpdateSlider(slider.id, 'link', e.target.value)}
                    className="mt-1 block w-full border-surface-300 dark:border-surface-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-surface-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Orden</label>
                  <input
                    type="number"
                    value={slider.order || 0}
                    onChange={(e) => handleUpdateSlider(slider.id, 'order', parseInt(e.target.value))}
                    className="mt-1 block w-full border-surface-300 dark:border-surface-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-surface-700 dark:text-white"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {sliders.length > 0 && (
          <button
            onClick={handleSaveSliders}
            disabled={saving}
            className="mb-6 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios en Sliders'}
          </button>
        )}

        {/* Add New Slider */}
        <div className="border-2 border-dashed border-surface-300 dark:border-surface-600 rounded-lg p-6">
          <h4 className="text-md font-medium text-surface-900 dark:text-white mb-4">Agregar Nuevo Slider</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Título *</label>
              <input
                type="text"
                value={newSlider.title}
                onChange={(e) => setNewSlider({...newSlider, title: e.target.value})}
                placeholder="Título del slider"
                className="mt-1 block w-full border-surface-300 dark:border-surface-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-surface-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Subtítulo</label>
              <input
                type="text"
                value={newSlider.subtitle}
                onChange={(e) => setNewSlider({...newSlider, subtitle: e.target.value})}
                placeholder="Subtítulo del slider"
                className="mt-1 block w-full border-surface-300 dark:border-surface-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-surface-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">URL de Imagen *</label>
              <input
                type="url"
                value={newSlider.image}
                onChange={(e) => setNewSlider({...newSlider, image: e.target.value})}
                placeholder="https://ejemplo.com/imagen.jpg"
                className="mt-1 block w-full border-surface-300 dark:border-surface-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-surface-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Enlace (opcional)</label>
              <input
                type="url"
                value={newSlider.link}
                onChange={(e) => setNewSlider({...newSlider, link: e.target.value})}
                placeholder="https://ejemplo.com/destino"
                className="mt-1 block w-full border-surface-300 dark:border-surface-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-surface-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Orden</label>
              <input
                type="number"
                value={newSlider.order}
                onChange={(e) => setNewSlider({...newSlider, order: parseInt(e.target.value)})}
                className="mt-1 block w-full border-surface-300 dark:border-surface-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-surface-700 dark:text-white"
              />
            </div>
          </div>
          
          <button
            onClick={handleAddSlider}
            disabled={saving}
            className="mt-4 flex items-center bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Agregar Slider
          </button>
        </div>

        {/* Featured Products Section Toggle */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-surface-900 dark:text-white mb-4">Productos Destacados</h3>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="show_featured"
              checked={settings.show_featured_products?.value === 'true' || settings.show_featured_products?.value === true}
              onChange={(e) => handleSave('show_featured_products', e.target.checked.toString())}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-surface-300 dark:border-surface-600 rounded"
            />
            <label htmlFor="show_featured" className="ml-2 block text-sm text-surface-700 dark:text-surface-300">
              Mostrar productos destacados en el home
            </label>
          </div>
        </div>

        {/* Additional Sections */}
        <div className="mt-8 border-t border-surface-200 dark:border-surface-700 pt-8">
          <h3 className="text-lg font-medium text-surface-900 dark:text-white mb-4">Secciones Adicionales</h3>
          
          {/* Existing Sections */}
          <div className="space-y-4 mb-6">
            {sections.map((section, index) => {
              const IconComponent = getIconComponent(section.icon)
              return (
                <div key={section.id} className="border border-surface-300 dark:border-surface-600 rounded-lg p-6 bg-surface-50 dark:bg-surface-900 dark:bg-surface-800">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="p-2 rounded-lg"
                        style={{ backgroundColor: section.backgroundColor }}
                      >
                        <IconComponent 
                          className="h-6 w-6" 
                          style={{ color: section.textColor }}
                        />
                      </div>
                      <div>
                        <h4 className="text-md font-medium text-surface-900 dark:text-white">Sección #{index + 1}</h4>
                        <p className="text-sm text-surface-500 dark:text-surface-400">{section.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <label className="flex items-center space-x-2 text-sm text-surface-700 dark:text-surface-300">
                        <input
                          type="checkbox"
                          checked={section.enabled !== false}
                          onChange={(e) => handleUpdateSection(section.id, 'enabled', e.target.checked)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-surface-300 dark:border-surface-600 rounded"
                        />
                        <span>Activa</span>
                      </label>
                      <button
                        onClick={() => handleDeleteSection(section.id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Título</label>
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => handleUpdateSection(section.id, 'title', e.target.value)}
                        className="mt-1 block w-full border-surface-300 dark:border-surface-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-surface-700 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Subtítulo</label>
                      <input
                        type="text"
                        value={section.subtitle || ''}
                        onChange={(e) => handleUpdateSection(section.id, 'subtitle', e.target.value)}
                        className="mt-1 block w-full border-surface-300 dark:border-surface-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-surface-700 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Icono</label>
                      <select
                        value={section.icon}
                        onChange={(e) => handleUpdateSection(section.id, 'icon', e.target.value)}
                        className="mt-1 block w-full border-surface-300 dark:border-surface-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-surface-700 dark:text-white"
                      >
                        {availableIcons.map(icon => (
                          <option key={icon} value={icon}>
                            {icon.replace('Icon', '').replace(/([A-Z])/g, ' $1').trim()}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Color de Fondo</label>
                      <div className="mt-1 flex items-center space-x-2">
                        <input
                          type="color"
                          value={section.backgroundColor}
                          onChange={(e) => handleUpdateSection(section.id, 'backgroundColor', e.target.value)}
                          className="h-10 w-20 border-surface-300 dark:border-surface-600 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={section.backgroundColor}
                          onChange={(e) => handleUpdateSection(section.id, 'backgroundColor', e.target.value)}
                          className="flex-1 block w-full border-surface-300 dark:border-surface-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-surface-700 dark:text-white text-sm"
                          placeholder="#f3f4f6"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Color de Texto/Icono</label>
                      <div className="mt-1 flex items-center space-x-2">
                        <input
                          type="color"
                          value={section.textColor}
                          onChange={(e) => handleUpdateSection(section.id, 'textColor', e.target.value)}
                          className="h-10 w-20 border-surface-300 dark:border-surface-600 rounded cursor-pointer"
                        />
                        <input
                          type="text"
                          value={section.textColor}
                          onChange={(e) => handleUpdateSection(section.id, 'textColor', e.target.value)}
                          className="flex-1 block w-full border-surface-300 dark:border-surface-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-surface-700 dark:text-white text-sm"
                          placeholder="#111827"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Texto del Botón</label>
                      <input
                        type="text"
                        value={section.buttonText || ''}
                        onChange={(e) => handleUpdateSection(section.id, 'buttonText', e.target.value)}
                        placeholder="Ver más"
                        className="mt-1 block w-full border-surface-300 dark:border-surface-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-surface-700 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Enlace del Botón</label>
                      <input
                        type="url"
                        value={section.buttonLink || ''}
                        onChange={(e) => handleUpdateSection(section.id, 'buttonLink', e.target.value)}
                        placeholder="/productos"
                        className="mt-1 block w-full border-surface-300 dark:border-surface-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-surface-700 dark:text-white"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Orden</label>
                      <input
                        type="number"
                        value={section.order || 0}
                        onChange={(e) => handleUpdateSection(section.id, 'order', parseInt(e.target.value))}
                        className="mt-1 block w-full border-surface-300 dark:border-surface-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-surface-700 dark:text-white"
                      />
                    </div>
                  </div>
                  
                  {/* Preview */}
                  <div className="mt-4 p-4 border-2 border-dashed border-surface-300 dark:border-surface-600 rounded-lg">
                    <p className="text-xs text-surface-500 dark:text-surface-400 mb-2">Vista Previa:</p>
                    <div 
                      className="p-4 rounded-lg text-center"
                      style={{ backgroundColor: section.backgroundColor }}
                    >
                      <IconComponent 
                        className="h-8 w-8 mx-auto mb-2" 
                        style={{ color: section.textColor }}
                      />
                      <h3 className="font-semibold" style={{ color: section.textColor }}>{section.title}</h3>
                      {section.subtitle && (
                        <p className="text-sm mt-1" style={{ color: section.textColor, opacity: 0.8 }}>{section.subtitle}</p>
                      )}
                      {section.buttonText && (
                        <button 
                          className="mt-2 px-4 py-2 rounded text-sm font-medium"
                          style={{ 
                            backgroundColor: section.textColor,
                            color: section.backgroundColor
                          }}
                        >
                          {section.buttonText}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {sections.length > 0 && (
            <button
              onClick={handleSaveSections}
              disabled={saving}
              className="mb-6 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar Cambios en Secciones'}
            </button>
          )}

          {/* Add New Section */}
          <div className="border-2 border-dashed border-surface-300 dark:border-surface-600 rounded-lg p-6">
            <h4 className="text-md font-medium text-surface-900 dark:text-white mb-4">Agregar Nueva Sección</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Título *</label>
                <input
                  type="text"
                  value={newSection.title}
                  onChange={(e) => setNewSection({...newSection, title: e.target.value})}
                  placeholder="Envío Gratis"
                  className="mt-1 block w-full border-surface-300 dark:border-surface-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-surface-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Subtítulo</label>
                <input
                  type="text"
                  value={newSection.subtitle}
                  onChange={(e) => setNewSection({...newSection, subtitle: e.target.value})}
                  placeholder="En compras mayores a $50"
                  className="mt-1 block w-full border-surface-300 dark:border-surface-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-surface-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Icono</label>
                <select
                  value={newSection.icon}
                  onChange={(e) => setNewSection({...newSection, icon: e.target.value})}
                  className="mt-1 block w-full border-surface-300 dark:border-surface-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-surface-700 dark:text-white"
                >
                  {availableIcons.map(icon => (
                    <option key={icon} value={icon}>
                      {icon.replace('Icon', '').replace(/([A-Z])/g, ' $1').trim()}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Color de Fondo</label>
                <div className="mt-1 flex items-center space-x-2">
                  <input
                    type="color"
                    value={newSection.backgroundColor}
                    onChange={(e) => setNewSection({...newSection, backgroundColor: e.target.value})}
                    className="h-10 w-20 border-surface-300 dark:border-surface-600 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newSection.backgroundColor}
                    onChange={(e) => setNewSection({...newSection, backgroundColor: e.target.value})}
                    className="flex-1 block w-full border-surface-300 dark:border-surface-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-surface-700 dark:text-white text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Color de Texto/Icono</label>
                <div className="mt-1 flex items-center space-x-2">
                  <input
                    type="color"
                    value={newSection.textColor}
                    onChange={(e) => setNewSection({...newSection, textColor: e.target.value})}
                    className="h-10 w-20 border-surface-300 dark:border-surface-600 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={newSection.textColor}
                    onChange={(e) => setNewSection({...newSection, textColor: e.target.value})}
                    className="flex-1 block w-full border-surface-300 dark:border-surface-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-surface-700 dark:text-white text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Texto del Botón</label>
                <input
                  type="text"
                  value={newSection.buttonText}
                  onChange={(e) => setNewSection({...newSection, buttonText: e.target.value})}
                  placeholder="Ver más"
                  className="mt-1 block w-full border-surface-300 dark:border-surface-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-surface-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Enlace del Botón</label>
                <input
                  type="url"
                  value={newSection.buttonLink}
                  onChange={(e) => setNewSection({...newSection, buttonLink: e.target.value})}
                  placeholder="/productos"
                  className="mt-1 block w-full border-surface-300 dark:border-surface-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-surface-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Orden</label>
                <input
                  type="number"
                  value={newSection.order}
                  onChange={(e) => setNewSection({...newSection, order: parseInt(e.target.value)})}
                  className="mt-1 block w-full border-surface-300 dark:border-surface-600 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 dark:bg-surface-700 dark:text-white"
                />
              </div>
            </div>
            
            <button
              onClick={handleAddSection}
              disabled={saving}
              className="mt-4 flex items-center bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Agregar Sección
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Configuración</h1>
          <p className="mt-2 text-sm text-surface-700 dark:text-surface-300">
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
      <div className="border-b border-surface-200 dark:border-surface-700 mb-6">
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
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:text-surface-300 hover:border-surface-300'
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
      <div className="bg-white dark:bg-surface-800 shadow rounded-lg p-6">
        {activeTab === 'general' && renderGeneralSettings()}
        {activeTab === 'appearance' && renderAppearanceSettings()}
      </div>
    </div>
  )
}

export default Settings

import React, { useState, useEffect } from 'react'
import { 
  PhotoIcon, 
  XMarkIcon, 
  EyeIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowUpTrayIcon,
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
  HomeIcon,
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
  WrenchScrewdriverIcon,
  BanknotesIcon,
  BookOpenIcon,
  BugAntIcon,
  CalculatorIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  ClipboardDocumentCheckIcon,
  CloudIcon,
  CodeBracketIcon,
  Cog6ToothIcon,
  ComputerDesktopIcon,
  CpuChipIcon,
  DevicePhoneMobileIcon,
  FolderIcon,
  GiftTopIcon,
  HashtagIcon,
  KeyIcon,
  LanguageIcon,
  LockClosedIcon,
  MagnifyingGlassIcon,
  NewspaperIcon,
  PaperAirplaneIcon,
  PlayIcon,
  PowerIcon,
  PresentationChartLineIcon,
  PrinterIcon,
  QrCodeIcon,
  ReceiptPercentIcon,
  RocketLaunchIcon as RocketIcon,
  ScaleIcon,
  ServerIcon,
  ShareIcon,
  ShieldExclamationIcon,
  SignalIcon,
  SunIcon,
  TicketIcon,
  VideoCameraIcon,
  WifiIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../../store/authStore'

const HomeSettings = () => {
  const { token } = useAuthStore()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState(null)
  const [activeTab, setActiveTab] = useState('carousel')
  const [uploading, setUploading] = useState(false)
  const [uploadingFavicon, setUploadingFavicon] = useState(false)
  const [logoPreview, setLogoPreview] = useState('')
  const [faviconPreview, setFaviconPreview] = useState('')
  const [siteSettings, setSiteSettings] = useState({
    site_logo: { value: '' },
    site_favicon: { value: '' },
    site_name: { value: '' }
  })
  
  // Custom sections state
  const [customSections, setCustomSections] = useState([])
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
    'WrenchScrewdriverIcon', 'BanknotesIcon', 'BookOpenIcon', 'BugAntIcon',
    'CalculatorIcon', 'ChatBubbleOvalLeftEllipsisIcon', 'ClipboardDocumentCheckIcon', 'CloudIcon',
    'CodeBracketIcon', 'Cog6ToothIcon', 'ComputerDesktopIcon', 'CpuChipIcon',
    'DevicePhoneMobileIcon', 'FolderIcon', 'GiftTopIcon', 'HashtagIcon',
    'KeyIcon', 'LanguageIcon', 'LockClosedIcon', 'MagnifyingGlassIcon',
    'NewspaperIcon', 'PaperAirplaneIcon', 'PlayIcon', 'PowerIcon',
    'PresentationChartLineIcon', 'PrinterIcon', 'QrCodeIcon', 'ReceiptPercentIcon',
    'ScaleIcon', 'ServerIcon', 'ShareIcon', 'ShieldExclamationIcon',
    'SignalIcon', 'SunIcon', 'TicketIcon', 'VideoCameraIcon',
    'WifiIcon'
  ]
  
  const [settings, setSettings] = useState({
    carousel: [],
    heroTitle: '',
    heroSubtitle: '',
    heroCta1Text: '',
    heroCta1Link: '',
    heroCta2Text: '',
    heroCta2Link: '',
    featuresEnabled: true,
    featuresTitle: '',
    features: [],
    categoriesEnabled: true,
    categoriesTitle: '',
    categoryIcons: {},
    newsletterEnabled: true,
    newsletterTitle: '',
    newsletterSubtitle: '',
    metaTitle: '',
    metaDescription: '',
    metaKeywords: '',
    // Coupon Banner settings
    couponBannerEnabled: true,
    couponBannerTitle: '¡Ofertas Especiales!',
    couponBannerSubtitle: 'Aprovecha estos cupones de descuento',
    couponBannerMaxCoupons: 3,
    // Footer settings
    footerEnabled: true,
    footerAboutTitle: 'Sobre Nosotros',
    footerAboutText: '',
    footerContactEnabled: true,
    footerContactTitle: 'Contacto',
    footerAddress: '',
    footerPhone: '',
    footerEmail: '',
    footerSchedule: '',
    footerSocialEnabled: true,
    footerSocialTitle: 'Síguenos',
    footerFacebook: '',
    footerInstagram: '',
    footerTwitter: '',
    footerYoutube: '',
    footerTiktok: '',
    footerWhatsapp: '',
    footerLinkedin: '',
    footerLinksEnabled: true,
    footerColumn1Title: 'Información',
    footerColumn1Links: [],
    footerColumn2Title: 'Ayuda',
    footerColumn2Links: [],
    footerColumn3Title: 'Legal',
    footerColumn3Links: [],
    footerCopyrightText: '',
    footerShowPaymentMethods: true,
    footerPaymentMethods: []
  })

  const [allCategories, setAllCategories] = useState([])

  useEffect(() => {
    loadSettings()
    loadSiteSettings()
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const data = await response.json()
        setAllCategories(data.categories || data || [])
      }
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/home-settings')
      if (response.ok) {
        const data = await response.json()
        // Merge with current settings to preserve defaults for new fields
        setSettings(prevSettings => ({
          ...prevSettings,
          ...data
        }))
      }
    } catch (error) {
      console.error('Error loading settings:', error)
      showMessage('Error al cargar la configuración', 'error')
    } finally {
      setLoading(false)
    }
  }

  const loadSiteSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setSiteSettings(data)
        if (data.site_logo?.value) {
          setLogoPreview(data.site_logo.value)
        }
        if (data.site_favicon?.value) {
          setFaviconPreview(data.site_favicon.value)
        }
        
        // Load custom sections
        if (data.home_sections?.value) {
          try {
            const sectionsData = JSON.parse(data.home_sections.value)
            setCustomSections(Array.isArray(sectionsData) ? sectionsData : [])
          } catch (e) {
            setCustomSections([])
          }
        }
      }
    } catch (error) {
      console.error('Error loading site settings:', error)
    }
  }

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/home-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        showMessage('Configuración guardada exitosamente', 'success')
      } else {
        throw new Error('Error al guardar')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      showMessage('Error al guardar la configuración', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (e, slideIndex) => {
    const file = e.target.files[0]
    if (!file) return

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showMessage('La imagen no debe superar 5MB', 'error')
      return
    }

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/home-settings/carousel/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        
        // Actualizar el carousel
        const newCarousel = [...settings.carousel]
        if (slideIndex !== undefined) {
          newCarousel[slideIndex] = {
            ...newCarousel[slideIndex],
            image: data.url
          }
        } else {
          newCarousel.push({
            image: data.url,
            title: 'Nuevo Slide',
            subtitle: '',
            buttonText: 'Ver más',
            buttonLink: '/productos',
            enabled: true
          })
        }
        
        setSettings({ ...settings, carousel: newCarousel })
        showMessage('Imagen subida exitosamente', 'success')
      } else {
        throw new Error('Error al subir imagen')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      showMessage('Error al subir la imagen', 'error')
    }
  }

  const handleRemoveSlide = async (index) => {
    if (!confirm('¿Estás seguro de eliminar este slide?')) return

    try {
      const slide = settings.carousel[index]
      if (slide.image) {
        await fetch('/api/home-settings/carousel/image', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ imageUrl: slide.image })
        })
      }

      const newCarousel = settings.carousel.filter((_, i) => i !== index)
      setSettings({ ...settings, carousel: newCarousel })
      showMessage('Slide eliminado exitosamente', 'success')
    } catch (error) {
      console.error('Error removing slide:', error)
      showMessage('Error al eliminar el slide', 'error')
    }
  }

  const updateSlide = (index, field, value) => {
    const newCarousel = [...settings.carousel]
    newCarousel[index] = { ...newCarousel[index], [field]: value }
    setSettings({ ...settings, carousel: newCarousel })
  }

  const updateFeature = (index, field, value) => {
    const newFeatures = [...settings.features]
    newFeatures[index] = { ...newFeatures[index], [field]: value }
    setSettings({ ...settings, features: newFeatures })
  }

  const updateCategoryIcon = (categoryId, icon) => {
    const categoryIcons = { ...(settings.categoryIcons || {}) }
    categoryIcons[categoryId] = icon
    setSettings({ ...settings, categoryIcons })
  }

  const handleLogoUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp']
    if (!validTypes.includes(file.type)) {
      showMessage('Tipo de archivo inválido. Solo se permiten imágenes JPG, PNG, GIF, SVG y WebP', 'error')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      showMessage('El archivo es demasiado grande. Máximo 5MB', 'error')
      return
    }

    try {
      setUploading(true)
      
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
        showMessage('Logo subido exitosamente', 'success')
        
        // Update preview
        setLogoPreview(data.logoUrl)
        
        // Update settings
        setSiteSettings(prev => ({
          ...prev,
          site_logo: { ...prev.site_logo, value: data.logoUrl }
        }))
      } else {
        const errorData = await response.json()
        showMessage(errorData.message || 'Error al subir el logo', 'error')
      }
    } catch (error) {
      console.error('Error uploading logo:', error)
      showMessage('Error al subir el logo', 'error')
    } finally {
      setUploading(false)
    }
  }

  const handleFaviconUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    // Validate file type (favicon should be ico, png, or svg)
    const validTypes = ['image/x-icon', 'image/vnd.microsoft.icon', 'image/png', 'image/svg+xml']
    if (!validTypes.includes(file.type)) {
      showMessage('Tipo de archivo inválido. Solo se permiten ICO, PNG y SVG', 'error')
      return
    }

    // Validate file size (1MB for favicon)
    if (file.size > 1 * 1024 * 1024) {
      showMessage('El archivo es demasiado grande. Máximo 1MB', 'error')
      return
    }

    try {
      setUploadingFavicon(true)
      
      const formData = new FormData()
      formData.append('favicon', file)

      const response = await fetch('/api/admin/settings/upload-favicon', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })
      
      if (response.ok) {
        const data = await response.json()
        showMessage('Favicon subido exitosamente', 'success')
        
        // Update preview
        setFaviconPreview(data.faviconUrl)
        
        // Update settings
        setSiteSettings(prev => ({
          ...prev,
          site_favicon: { ...prev.site_favicon, value: data.faviconUrl }
        }))
        
        // Update favicon in document immediately
        updateDocumentFavicon(data.faviconUrl)
      } else {
        const errorData = await response.json()
        showMessage(errorData.message || 'Error al subir el favicon', 'error')
      }
    } catch (error) {
      console.error('Error uploading favicon:', error)
      showMessage('Error al subir el favicon', 'error')
    } finally {
      setUploadingFavicon(false)
    }
  }

  const updateDocumentFavicon = (faviconUrl) => {
    // Remove existing favicon links
    const existingLinks = document.querySelectorAll("link[rel*='icon']")
    existingLinks.forEach(link => link.remove())
    
    // Add new favicon link
    const link = document.createElement('link')
    link.rel = 'icon'
    link.href = faviconUrl
    document.head.appendChild(link)
  }

  // Custom Sections handlers
  const handleSaveCustomSection = async (key, value) => {
    try {
      const response = await fetch(`/api/admin/settings/${key}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ value })
      })
      
      if (response.ok) {
        showMessage('Sección guardada exitosamente', 'success')
        return true
      }
    } catch (error) {
      console.error('Error saving section:', error)
      showMessage('Error al guardar la sección', 'error')
      return false
    }
  }

  const handleAddCustomSection = async () => {
    if (!newSection.title) {
      showMessage('El título es obligatorio', 'error')
      return
    }

    const updatedSections = [...customSections, { ...newSection, id: Date.now() }]
    const success = await handleSaveCustomSection('home_sections', JSON.stringify(updatedSections))
    
    if (success) {
      setCustomSections(updatedSections)
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
  }

  const handleDeleteCustomSection = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta sección?')) return
    
    const updatedSections = customSections.filter(s => s.id !== id)
    const success = await handleSaveCustomSection('home_sections', JSON.stringify(updatedSections))
    
    if (success) {
      setCustomSections(updatedSections)
    }
  }

  const handleUpdateCustomSection = (id, field, value) => {
    const updatedSections = customSections.map(s =>
      s.id === id ? { ...s, [field]: value } : s
    )
    setCustomSections(updatedSections)
  }

  const handleSaveAllCustomSections = async () => {
    await handleSaveCustomSection('home_sections', JSON.stringify(customSections))
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
      WrenchScrewdriverIcon, BanknotesIcon, BookOpenIcon, BugAntIcon,
      CalculatorIcon, ChatBubbleOvalLeftEllipsisIcon, ClipboardDocumentCheckIcon, CloudIcon,
      CodeBracketIcon, Cog6ToothIcon, ComputerDesktopIcon, CpuChipIcon,
      DevicePhoneMobileIcon, FolderIcon, GiftTopIcon, HashtagIcon,
      KeyIcon, LanguageIcon, LockClosedIcon, MagnifyingGlassIcon,
      NewspaperIcon, PaperAirplaneIcon, PlayIcon, PowerIcon,
      PresentationChartLineIcon, PrinterIcon, QrCodeIcon, ReceiptPercentIcon,
      ScaleIcon, ServerIcon, ShareIcon, ShieldExclamationIcon,
      SignalIcon, SunIcon, TicketIcon, VideoCameraIcon,
      WifiIcon
    }
    return icons[iconName] || ShoppingBagIcon
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Personalizar Home</h1>
          <p className="mt-2 text-gray-600">
            Configura el aspecto de la página principal de tu tienda
          </p>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircleIcon className="h-5 w-5 mr-2" />
            ) : (
              <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
            )}
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex -mb-px overflow-x-auto">
              {[
                { id: 'carousel', name: 'Carrousel' },
                { id: 'hero', name: 'Hero Section' },
                { id: 'features', name: 'Características' },
                { id: 'coupons', name: 'Cupones' },
                { id: 'sections', name: 'Secciones' },
                { id: 'appearance', name: 'Apariencia' },
                { id: 'footer', name: 'Footer' },
                { id: 'seo', name: 'SEO' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            
            {/* Carousel Tab */}
            {activeTab === 'carousel' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Carrousel Principal</h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Máximo 3 slides. Dimensiones recomendadas: 1920x600px
                    </p>
                  </div>
                  {settings.carousel.length < 3 && (
                    <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                      <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                      Agregar Slide
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e)}
                      />
                    </label>
                  )}
                </div>

                <div className="space-y-6">
                  {settings.carousel.map((slide, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-gray-50 dark:bg-gray-700">
                      <div className="flex items-start justify-between mb-4">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Slide {index + 1}</h3>
                        <button
                          onClick={() => handleRemoveSlide(index)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Image Preview */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Imagen
                          </label>
                          <div className="relative aspect-[16/5] bg-gray-200 rounded-lg overflow-hidden">
                            {slide.image ? (
                              <img
                                src={slide.image}
                                alt={`Slide ${index + 1}`}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="flex items-center justify-center h-full">
                                <PhotoIcon className="h-12 w-12 text-gray-400" />
                              </div>
                            )}
                            <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                              <span className="text-white font-medium">Cambiar imagen</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleImageUpload(e, index)}
                              />
                            </label>
                          </div>
                        </div>

                        {/* Slide Info */}
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Título
                            </label>
                            <input
                              type="text"
                              value={slide.title || ''}
                              onChange={(e) => updateSlide(index, 'title', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Título del slide"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Subtítulo
                            </label>
                            <textarea
                              value={slide.subtitle || ''}
                              onChange={(e) => updateSlide(index, 'subtitle', e.target.value)}
                              rows={2}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Subtítulo del slide"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Texto del Botón
                              </label>
                              <input
                                type="text"
                                value={slide.buttonText || ''}
                                onChange={(e) => updateSlide(index, 'buttonText', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Ver más"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Enlace del Botón
                              </label>
                              <input
                                type="text"
                                value={slide.buttonLink || ''}
                                onChange={(e) => updateSlide(index, 'buttonLink', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="/productos"
                              />
                            </div>
                          </div>

                          <div className="flex items-center">
                            <input
                              type="checkbox"
                              id={`enabled-${index}`}
                              checked={slide.enabled !== false}
                              onChange={(e) => updateSlide(index, 'enabled', e.target.checked)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label htmlFor={`enabled-${index}`} className="ml-2 text-sm text-gray-700">
                              Slide activo
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {settings.carousel.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm text-gray-600">
                        No hay slides en el carrousel. Agrega uno para comenzar.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Hero Section Tab */}
            {activeTab === 'hero' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Hero Section</h2>
                  <p className="text-sm text-gray-600 mb-6">
                    Se muestra cuando no hay slides activos en el carrousel
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título Principal
                    </label>
                    <input
                      type="text"
                      value={settings.heroTitle}
                      onChange={(e) => setSettings({ ...settings, heroTitle: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Bienvenido a Nuestra Tienda"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subtítulo
                    </label>
                    <textarea
                      value={settings.heroSubtitle}
                      onChange={(e) => setSettings({ ...settings, heroSubtitle: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Encuentra los mejores productos al mejor precio"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-900">Botón Principal</h3>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Texto
                        </label>
                        <input
                          type="text"
                          value={settings.heroCta1Text}
                          onChange={(e) => setSettings({ ...settings, heroCta1Text: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Ver Productos"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Enlace
                        </label>
                        <input
                          type="text"
                          value={settings.heroCta1Link}
                          onChange={(e) => setSettings({ ...settings, heroCta1Link: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="/productos"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h3 className="font-medium text-gray-900">Botón Secundario</h3>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Texto
                        </label>
                        <input
                          type="text"
                          value={settings.heroCta2Text}
                          onChange={(e) => setSettings({ ...settings, heroCta2Text: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Ofertas"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Enlace
                        </label>
                        <input
                          type="text"
                          value={settings.heroCta2Link}
                          onChange={(e) => setSettings({ ...settings, heroCta2Link: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="/productos?ofertas=true"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Features Tab */}
            {activeTab === 'features' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Características</h2>
                  <p className="text-sm text-gray-600">
                    Sección de beneficios que se muestra debajo del hero
                  </p>
                </div>

                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="features-enabled"
                    checked={settings.featuresEnabled}
                    onChange={(e) => setSettings({ ...settings, featuresEnabled: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="features-enabled" className="ml-2 text-sm font-medium text-gray-700">
                    Mostrar sección de características
                  </label>
                </div>

                {settings.featuresEnabled && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Título de la Sección
                      </label>
                      <input
                        type="text"
                        value={settings.featuresTitle}
                        onChange={(e) => setSettings({ ...settings, featuresTitle: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="¿Por qué elegirnos?"
                      />
                    </div>

                    <div className="space-y-4">
                      {settings.features.map((feature, index) => {
                        const IconComponent = getIconComponent(feature.icon)
                        return (
                          <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Icono
                                </label>
                                <div className="flex items-center gap-2">
                                  <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                                    <IconComponent className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                  </div>
                                  <select
                                    value={feature.icon}
                                    onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                  >
                                    {availableIcons.map(iconName => (
                                      <option key={iconName} value={iconName}>
                                        {iconName.replace('Icon', '')}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Título
                                </label>
                                <input
                                  type="text"
                                  value={feature.title}
                                  onChange={(e) => updateFeature(index, 'title', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Descripción
                                </label>
                                <input
                                  type="text"
                                  value={feature.description}
                                  onChange={(e) => updateFeature(index, 'description', e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                />
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Coupons Tab */}
            {activeTab === 'coupons' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Banner de Cupones</h2>
                  <p className="text-sm text-gray-600">
                    Configura el banner que muestra cupones activos en la página principal
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <TagIcon className="h-5 w-5 text-blue-600 mt-0.5 mr-2" />
                    <div>
                      <p className="text-sm text-blue-800 font-medium mb-1">
                        Cupones automáticos
                      </p>
                      <p className="text-sm text-blue-700">
                        Los cupones se obtienen automáticamente desde la sección de "Cupones" del admin. 
                        Solo se mostrarán los cupones activos y públicos que hayas creado.
                      </p>
                      <a 
                        href="/admin/cupones" 
                        className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Ir a administrar cupones →
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="coupon-banner-enabled"
                    checked={settings.couponBannerEnabled}
                    onChange={(e) => setSettings({ ...settings, couponBannerEnabled: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="coupon-banner-enabled" className="ml-2 text-sm font-medium text-gray-700">
                    Mostrar banner de cupones en la página principal
                  </label>
                </div>

                {settings.couponBannerEnabled && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Título del Banner
                      </label>
                      <input
                        type="text"
                        value={settings.couponBannerTitle}
                        onChange={(e) => setSettings({ ...settings, couponBannerTitle: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="¡Ofertas Especiales!"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subtítulo
                      </label>
                      <input
                        type="text"
                        value={settings.couponBannerSubtitle}
                        onChange={(e) => setSettings({ ...settings, couponBannerSubtitle: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Aprovecha estos cupones de descuento"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cantidad de cupones a mostrar
                      </label>
                      <select
                        value={settings.couponBannerMaxCoupons}
                        onChange={(e) => setSettings({ ...settings, couponBannerMaxCoupons: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="1">1 cupón</option>
                        <option value="2">2 cupones</option>
                        <option value="3">3 cupones</option>
                        <option value="4">4 cupones</option>
                        <option value="5">5 cupones</option>
                        <option value="6">6 cupones</option>
                      </select>
                      <p className="mt-1 text-sm text-gray-500">
                        Se mostrarán los cupones más recientes activos
                      </p>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
                        <div>
                          <p className="text-sm text-yellow-800">
                            <strong>Importante:</strong> Si no tienes cupones activos creados, 
                            el banner no se mostrará en la página principal.
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Sections Tab */}
            {activeTab === 'sections' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Secciones Adicionales</h2>
                </div>

                {/* Categories Section */}
                <div className="border-b border-gray-200 pb-6">
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="categories-enabled"
                      checked={settings.categoriesEnabled}
                      onChange={(e) => setSettings({ ...settings, categoriesEnabled: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="categories-enabled" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Mostrar categorías destacadas
                    </label>
                  </div>
                  {settings.categoriesEnabled && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Título de la Sección
                        </label>
                        <input
                          type="text"
                          value={settings.categoriesTitle}
                          onChange={(e) => setSettings({ ...settings, categoriesTitle: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                          placeholder="Categorías Destacadas"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Personalizar Iconos de Categorías
                        </label>

                        {allCategories.length === 0 ? (
                          <div className="text-sm text-gray-500 dark:text-gray-400 italic p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            No hay categorías creadas aún. Crea categorías primero.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {allCategories.map((category) => {
                              const currentIcon = settings.categoryIcons?.[category.id] || 'ShoppingBagIcon'
                              const IconComponent = getIconComponent(currentIcon)
                              
                              return (
                                <div key={category.id} className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800">
                                  {/* Icon Preview */}
                                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-lg flex items-center justify-center">
                                    <IconComponent className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                  </div>

                                  {/* Category Name */}
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900 dark:text-white">
                                      {category.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                      {category.icon || '📦'} Emoji original
                                    </p>
                                  </div>

                                  {/* Icon Selector */}
                                  <div className="flex-1">
                                    <select
                                      value={currentIcon}
                                      onChange={(e) => updateCategoryIcon(category.id, e.target.value)}
                                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                                    >
                                      {availableIcons.map(iconName => (
                                        <option key={iconName} value={iconName}>
                                          {iconName.replace('Icon', '')}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}

                        <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                          💡 Se mostrarán las primeras 8 categorías en el home con los iconos que selecciones aquí.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Newsletter Section */}
                <div>
                  <div className="flex items-center mb-4">
                    <input
                      type="checkbox"
                      id="newsletter-enabled"
                      checked={settings.newsletterEnabled}
                      onChange={(e) => setSettings({ ...settings, newsletterEnabled: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="newsletter-enabled" className="ml-2 text-sm font-medium text-gray-700">
                      Mostrar sección de newsletter
                    </label>
                  </div>
                  {settings.newsletterEnabled && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Título
                        </label>
                        <input
                          type="text"
                          value={settings.newsletterTitle}
                          onChange={(e) => setSettings({ ...settings, newsletterTitle: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Suscríbete a nuestro newsletter"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Subtítulo
                        </label>
                        <input
                          type="text"
                          value={settings.newsletterSubtitle}
                          onChange={(e) => setSettings({ ...settings, newsletterSubtitle: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Recibe ofertas exclusivas y novedades"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Custom Sections with Icons and Colors */}
                <div className="border-t border-gray-200 pt-8">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Secciones Personalizables</h3>
                  
                  {/* Existing Custom Sections */}
                  <div className="space-y-6 mb-8">
                    {customSections.map((section, index) => {
                      const IconComponent = getIconComponent(section.icon)
                      return (
                        <div key={section.id} className="border border-gray-300 dark:border-gray-600 rounded-lg p-6 bg-white dark:bg-gray-800 shadow-sm">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div
                                className="p-3 rounded-lg"
                                style={{ backgroundColor: section.backgroundColor }}
                              >
                                <IconComponent
                                  className="h-6 w-6"
                                  style={{ color: section.textColor }}
                                />
                              </div>
                              <div>
                                <h4 className="text-md font-semibold text-gray-900 dark:text-white">Sección #{index + 1}</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{section.title}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <label className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  checked={section.enabled !== false}
                                  onChange={(e) => handleUpdateCustomSection(section.id, 'enabled', e.target.checked)}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">Activa</span>
                              </label>
                              <button
                                onClick={() => handleDeleteCustomSection(section.id)}
                                className="text-red-600 hover:text-red-800 dark:text-red-400 p-2"
                              >
                                <TrashIcon className="h-5 w-5" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label>
                              <input
                                type="text"
                                value={section.title}
                                onChange={(e) => handleUpdateCustomSection(section.id, 'title', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtítulo</label>
                              <input
                                type="text"
                                value={section.subtitle || ''}
                                onChange={(e) => handleUpdateCustomSection(section.id, 'subtitle', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Icono</label>
                              <select
                                value={section.icon}
                                onChange={(e) => handleUpdateCustomSection(section.id, 'icon', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                              >
                                {availableIcons.map(icon => (
                                  <option key={icon} value={icon}>
                                    {icon.replace('Icon', '').replace(/([A-Z])/g, ' $1').trim()}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color de Fondo</label>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="color"
                                  value={section.backgroundColor}
                                  onChange={(e) => handleUpdateCustomSection(section.id, 'backgroundColor', e.target.value)}
                                  className="h-10 w-20 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                                />
                                <input
                                  type="text"
                                  value={section.backgroundColor}
                                  onChange={(e) => handleUpdateCustomSection(section.id, 'backgroundColor', e.target.value)}
                                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                                  placeholder="#f3f4f6"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color de Texto/Icono</label>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="color"
                                  value={section.textColor}
                                  onChange={(e) => handleUpdateCustomSection(section.id, 'textColor', e.target.value)}
                                  className="h-10 w-20 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                                />
                                <input
                                  type="text"
                                  value={section.textColor}
                                  onChange={(e) => handleUpdateCustomSection(section.id, 'textColor', e.target.value)}
                                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                                  placeholder="#111827"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Texto del Botón</label>
                              <input
                                type="text"
                                value={section.buttonText || ''}
                                onChange={(e) => handleUpdateCustomSection(section.id, 'buttonText', e.target.value)}
                                placeholder="Ver más"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Enlace del Botón</label>
                              <input
                                type="text"
                                value={section.buttonLink || ''}
                                onChange={(e) => handleUpdateCustomSection(section.id, 'buttonLink', e.target.value)}
                                placeholder="/productos"
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Orden</label>
                              <input
                                type="number"
                                value={section.order || 0}
                                onChange={(e) => handleUpdateCustomSection(section.id, 'order', parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                              />
                            </div>
                          </div>

                          {/* Preview */}
                          <div className="mt-6 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Vista Previa:</p>
                            <div
                              className="p-6 rounded-lg text-center"
                              style={{ backgroundColor: section.backgroundColor }}
                            >
                              <IconComponent
                                className="h-10 w-10 mx-auto mb-3"
                                style={{ color: section.textColor }}
                              />
                              <h3 className="text-lg font-bold mb-1" style={{ color: section.textColor }}>
                                {section.title}
                              </h3>
                              {section.subtitle && (
                                <p className="text-sm mb-3" style={{ color: section.textColor, opacity: 0.8 }}>
                                  {section.subtitle}
                                </p>
                              )}
                              {section.buttonText && (
                                <button
                                  className="mt-2 px-6 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
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

                  {customSections.length > 0 && (
                    <button
                      onClick={handleSaveAllCustomSections}
                      disabled={saving}
                      className="mb-6 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 font-medium"
                    >
                      {saving ? 'Guardando...' : 'Guardar Todas las Secciones Personalizadas'}
                    </button>
                  )}

                  {/* Add New Custom Section */}
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 bg-gray-50 dark:bg-gray-800">
                    <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Agregar Nueva Sección Personalizada
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Título *
                        </label>
                        <input
                          type="text"
                          value={newSection.title}
                          onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                          placeholder="Envío Gratis"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtítulo</label>
                        <input
                          type="text"
                          value={newSection.subtitle}
                          onChange={(e) => setNewSection({ ...newSection, subtitle: e.target.value })}
                          placeholder="En compras mayores a $50"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Icono</label>
                        <select
                          value={newSection.icon}
                          onChange={(e) => setNewSection({ ...newSection, icon: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        >
                          {availableIcons.map(icon => (
                            <option key={icon} value={icon}>
                              {icon.replace('Icon', '').replace(/([A-Z])/g, ' $1').trim()}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color de Fondo</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={newSection.backgroundColor}
                            onChange={(e) => setNewSection({ ...newSection, backgroundColor: e.target.value })}
                            className="h-10 w-20 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={newSection.backgroundColor}
                            onChange={(e) => setNewSection({ ...newSection, backgroundColor: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Color de Texto/Icono</label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="color"
                            value={newSection.textColor}
                            onChange={(e) => setNewSection({ ...newSection, textColor: e.target.value })}
                            className="h-10 w-20 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={newSection.textColor}
                            onChange={(e) => setNewSection({ ...newSection, textColor: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Texto del Botón</label>
                        <input
                          type="text"
                          value={newSection.buttonText}
                          onChange={(e) => setNewSection({ ...newSection, buttonText: e.target.value })}
                          placeholder="Ver más"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Enlace del Botón</label>
                        <input
                          type="text"
                          value={newSection.buttonLink}
                          onChange={(e) => setNewSection({ ...newSection, buttonLink: e.target.value })}
                          placeholder="/productos"
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Orden</label>
                        <input
                          type="number"
                          value={newSection.order}
                          onChange={(e) => setNewSection({ ...newSection, order: parseInt(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleAddCustomSection}
                      disabled={saving}
                      className="mt-6 flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Agregar Sección
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Logo de la Tienda</h2>
                  <p className="text-sm text-gray-600 mb-6">
                    El logo aparecerá en la cabecera de tu tienda
                  </p>
                </div>
                
                {/* Logo Preview */}
                {logoPreview && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vista Previa
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
                      <img 
                        src={logoPreview} 
                        alt="Logo preview" 
                        className="h-20 w-auto object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none'
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
                    <label className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm cursor-pointer hover:bg-gray-50 transition-colors">
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
                  <p className="mt-2 text-xs text-gray-500">
                    Recomendado: PNG con fondo transparente para mejor resultado
                  </p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Nota:</strong> El logo se redimensionará automáticamente a 80px de altura para mantener un aspecto consistente en toda la tienda.
                  </p>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 my-8"></div>

                {/* Favicon Section */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">Favicon</h2>
                  <p className="text-sm text-gray-600 mb-6">
                    El favicon es el pequeño icono que aparece en la pestaña del navegador
                  </p>
                </div>

                {/* Favicon Preview */}
                {faviconPreview && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Vista Previa
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 flex items-center">
                      <img 
                        src={faviconPreview} 
                        alt="Favicon preview" 
                        className="h-8 w-8 object-contain mr-4"
                        onError={(e) => {
                          e.target.style.display = 'none'
                        }}
                      />
                      <span className="text-sm text-gray-600">Favicon actual (32x32px)</span>
                    </div>
                  </div>
                )}

                {/* Upload Favicon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subir Nuevo Favicon
                  </label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm cursor-pointer hover:bg-gray-50 transition-colors">
                      <CloudArrowUpIcon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-700">
                        {uploadingFavicon ? 'Subiendo...' : 'Seleccionar Favicon'}
                      </span>
                      <input
                        type="file"
                        accept=".ico,.png,.svg,image/x-icon,image/png,image/svg+xml"
                        onChange={handleFaviconUpload}
                        disabled={uploadingFavicon}
                        className="hidden"
                      />
                    </label>
                    <span className="text-sm text-gray-500">
                      ICO, PNG o SVG (máx. 1MB)
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Recomendado: 32x32px o 16x16px en formato ICO o PNG
                  </p>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-800">
                    <strong>Tip:</strong> Para mejores resultados, usa un icono simple y reconocible en tamaños pequeños. Puedes crear favicons en <a href="https://favicon.io" target="_blank" rel="noopener noreferrer" className="underline">favicon.io</a>
                  </p>
                </div>
              </div>
            )}

            {/* Footer Tab */}
            {activeTab === 'footer' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Configuración del Footer</h2>
                  <p className="text-sm text-gray-600 mb-6">
                    Personaliza el pie de página con información de contacto, redes sociales y enlaces
                  </p>
                </div>

                {/* Footer Enable/Disable */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">Mostrar Footer</h3>
                    <p className="text-xs text-gray-500 mt-1">Activar o desactivar el pie de página</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.footerEnabled !== false}
                      onChange={(e) => setSettings({ ...settings, footerEnabled: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {/* About Section */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Sección "Sobre Nosotros"</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Título
                      </label>
                      <input
                        type="text"
                        value={settings.footerAboutTitle || 'Sobre Nosotros'}
                        onChange={(e) => setSettings({ ...settings, footerAboutTitle: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Sobre Nosotros"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descripción
                      </label>
                      <textarea
                        value={settings.footerAboutText || ''}
                        onChange={(e) => setSettings({ ...settings, footerAboutText: e.target.value })}
                        rows="3"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Breve descripción de tu negocio..."
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Section */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Información de Contacto</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.footerContactEnabled !== false}
                        onChange={(e) => setSettings({ ...settings, footerContactEnabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Título de Sección
                      </label>
                      <input
                        type="text"
                        value={settings.footerContactTitle || 'Contacto'}
                        onChange={(e) => setSettings({ ...settings, footerContactTitle: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Contacto"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dirección
                      </label>
                      <textarea
                        value={settings.footerAddress || ''}
                        onChange={(e) => setSettings({ ...settings, footerAddress: e.target.value })}
                        rows="2"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Calle 123, Ciudad, País"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Teléfono
                        </label>
                        <input
                          type="text"
                          value={settings.footerPhone || ''}
                          onChange={(e) => setSettings({ ...settings, footerPhone: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="+54 11 1234-5678"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={settings.footerEmail || ''}
                          onChange={(e) => setSettings({ ...settings, footerEmail: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="info@tutienda.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Horario de Atención
                      </label>
                      <input
                        type="text"
                        value={settings.footerSchedule || ''}
                        onChange={(e) => setSettings({ ...settings, footerSchedule: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Lun - Vie: 9:00 - 18:00"
                      />
                    </div>
                  </div>
                </div>

                {/* Social Media Section */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Redes Sociales</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.footerSocialEnabled !== false}
                        onChange={(e) => setSettings({ ...settings, footerSocialEnabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Título de Sección
                      </label>
                      <input
                        type="text"
                        value={settings.footerSocialTitle || 'Síguenos'}
                        onChange={(e) => setSettings({ ...settings, footerSocialTitle: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Síguenos"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Facebook
                        </label>
                        <input
                          type="url"
                          value={settings.footerFacebook || ''}
                          onChange={(e) => setSettings({ ...settings, footerFacebook: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://facebook.com/tu-pagina"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Instagram
                        </label>
                        <input
                          type="url"
                          value={settings.footerInstagram || ''}
                          onChange={(e) => setSettings({ ...settings, footerInstagram: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://instagram.com/tu-cuenta"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Twitter / X
                        </label>
                        <input
                          type="url"
                          value={settings.footerTwitter || ''}
                          onChange={(e) => setSettings({ ...settings, footerTwitter: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://twitter.com/tu-cuenta"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          YouTube
                        </label>
                        <input
                          type="url"
                          value={settings.footerYoutube || ''}
                          onChange={(e) => setSettings({ ...settings, footerYoutube: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://youtube.com/tu-canal"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          TikTok
                        </label>
                        <input
                          type="url"
                          value={settings.footerTiktok || ''}
                          onChange={(e) => setSettings({ ...settings, footerTiktok: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://tiktok.com/@tu-cuenta"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          LinkedIn
                        </label>
                        <input
                          type="url"
                          value={settings.footerLinkedin || ''}
                          onChange={(e) => setSettings({ ...settings, footerLinkedin: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="https://linkedin.com/company/tu-empresa"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          WhatsApp (número)
                        </label>
                        <input
                          type="text"
                          value={settings.footerWhatsapp || ''}
                          onChange={(e) => setSettings({ ...settings, footerWhatsapp: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="+5491123456789"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Incluye código de país sin espacios ni guiones
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Links Columns */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Columnas de Enlaces</h3>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.footerLinksEnabled !== false}
                        onChange={(e) => setSettings({ ...settings, footerLinksEnabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  {/* Column 1 */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Columna 1</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Título
                        </label>
                        <input
                          type="text"
                          value={settings.footerColumn1Title || 'Información'}
                          onChange={(e) => setSettings({ ...settings, footerColumn1Title: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Información"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Enlaces (JSON)
                        </label>
                        <textarea
                          value={JSON.stringify(settings.footerColumn1Links || [], null, 2)}
                          onChange={(e) => {
                            try {
                              const links = JSON.parse(e.target.value)
                              setSettings({ ...settings, footerColumn1Links: links })
                            } catch (err) {
                              // Invalid JSON, don't update
                            }
                          }}
                          rows="5"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-xs"
                          placeholder='[{"text":"Enlace 1","url":"/url"}]'
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          Formato: [&#123;"text":"Nombre","url":"/ruta"&#125;]
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Column 2 */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Columna 2</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Título
                        </label>
                        <input
                          type="text"
                          value={settings.footerColumn2Title || 'Ayuda'}
                          onChange={(e) => setSettings({ ...settings, footerColumn2Title: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Ayuda"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Enlaces (JSON)
                        </label>
                        <textarea
                          value={JSON.stringify(settings.footerColumn2Links || [], null, 2)}
                          onChange={(e) => {
                            try {
                              const links = JSON.parse(e.target.value)
                              setSettings({ ...settings, footerColumn2Links: links })
                            } catch (err) {
                              // Invalid JSON, don't update
                            }
                          }}
                          rows="5"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-xs"
                          placeholder='[{"text":"Enlace 1","url":"/url"}]'
                        />
                      </div>
                    </div>
                  </div>

                  {/* Column 3 */}
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Columna 3</h4>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Título
                        </label>
                        <input
                          type="text"
                          value={settings.footerColumn3Title || 'Legal'}
                          onChange={(e) => setSettings({ ...settings, footerColumn3Title: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Legal"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Enlaces (JSON)
                        </label>
                        <textarea
                          value={JSON.stringify(settings.footerColumn3Links || [], null, 2)}
                          onChange={(e) => {
                            try {
                              const links = JSON.parse(e.target.value)
                              setSettings({ ...settings, footerColumn3Links: links })
                            } catch (err) {
                              // Invalid JSON, don't update
                            }
                          }}
                          rows="5"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-xs"
                          placeholder='[{"text":"Enlace 1","url":"/url"}]'
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Bottom */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Pie de Página (Bottom)</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Texto de Copyright
                      </label>
                      <input
                        type="text"
                        value={settings.footerCopyrightText || ''}
                        onChange={(e) => setSettings({ ...settings, footerCopyrightText: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="© 2025 Tu Tienda. Todos los derechos reservados."
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Mostrar Métodos de Pago</h4>
                        <p className="text-xs text-gray-500 mt-1">Iconos de tarjetas y formas de pago</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.footerShowPaymentMethods !== false}
                          onChange={(e) => setSettings({ ...settings, footerShowPaymentMethods: e.target.checked })}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> Un footer completo genera confianza. Incluye información de contacto real, enlaces útiles y tus redes sociales activas.
                  </p>
                </div>
              </div>
            )}

            {/* SEO Tab */}
            {activeTab === 'seo' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Metadatos SEO</h2>
                  <p className="text-sm text-gray-600 mb-6">
                    Configura los metadatos que aparecerán en buscadores y redes sociales
                  </p>
                </div>

                {/* Meta Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título de la Página (Meta Title)
                  </label>
                  <input
                    type="text"
                    value={settings.metaTitle}
                    onChange={(e) => setSettings({ ...settings, metaTitle: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="E-Commerce - Tu tienda online de confianza"
                    maxLength="60"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {settings.metaTitle?.length || 0}/60 caracteres - Aparece en la pestaña del navegador y resultados de búsqueda
                  </p>
                </div>

                {/* Meta Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción (Meta Description)
                  </label>
                  <textarea
                    value={settings.metaDescription}
                    onChange={(e) => setSettings({ ...settings, metaDescription: e.target.value })}
                    rows="3"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Encuentra los mejores productos al mejor precio. Envío gratis, compra segura y soporte 24/7."
                    maxLength="160"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {settings.metaDescription?.length || 0}/160 caracteres - Resumen que aparece en resultados de búsqueda
                  </p>
                </div>

                {/* Meta Keywords */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Palabras Clave (Keywords)
                  </label>
                  <input
                    type="text"
                    value={settings.metaKeywords}
                    onChange={(e) => setSettings({ ...settings, metaKeywords: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="tienda online, ecommerce, productos, ofertas, envío gratis"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Separa las palabras clave con comas
                  </p>
                </div>

                {/* Preview */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Vista Previa en Google</h3>
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="text-sm text-blue-700 mb-1">{settings.metaTitle || 'Título de la página'}</div>
                    <div className="text-xs text-green-700 mb-2">https://tutienda.com</div>
                    <div className="text-sm text-gray-600">{settings.metaDescription || 'Descripción de la página'}</div>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Tip:</strong> Un buen título tiene entre 50-60 caracteres y una buena descripción entre 150-160 caracteres. 
                    Incluye palabras clave relevantes para mejorar tu posicionamiento en buscadores.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between bg-white rounded-lg shadow p-6">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <EyeIcon className="h-5 w-5 mr-2" />
            Vista Previa
          </a>
          
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Guardando...
              </>
            ) : (
              'Guardar Cambios'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default HomeSettings

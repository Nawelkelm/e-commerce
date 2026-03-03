import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import CouponBanner from '../components/CouponBanner.jsx'
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  ChatBubbleBottomCenterTextIcon,
  SparklesIcon,
  FireIcon,
  ShoppingBagIcon,
  HeartIcon,
  StarIcon,
  BoltIcon,
  GiftIcon,
  CreditCardIcon,
  ClockIcon,
  TagIcon,
  ChatBubbleLeftRightIcon,
  CubeIcon,
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
  HomeIcon as HomeIconHero,
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
import ProductGrid from '../components/Product/ProductGrid'

const Home = () => {
  const [homeSettings, setHomeSettings] = useState(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHomeData()
  }, [])

  const loadHomeData = async () => {
    try {
      const [settingsRes, productsRes, categoriesRes] = await Promise.all([
        fetch('/api/home-settings'),
        fetch('/api/products?limit=8&sort=createdAt&order=DESC'),
        fetch('/api/categories')
      ])

      if (settingsRes.ok) {
        const settingsData = await settingsRes.json()
        setHomeSettings(settingsData)
      }

      if (productsRes.ok) {
        const productsData = await productsRes.json()
        setProducts(productsData.products || [])
      }

      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json()
        setCategories(categoriesData.categories || categoriesData || [])
      }
    } catch (error) {
      console.error('Error loading home data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Auto-advance carrousel
  useEffect(() => {
    if (!homeSettings?.carousel || homeSettings.carousel.length === 0) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => 
        (prev + 1) % homeSettings.carousel.filter(s => s.enabled !== false).length
      )
    }, 5000)

    return () => clearInterval(interval)
  }, [homeSettings])

  const nextSlide = () => {
    if (!homeSettings?.carousel) return
    const enabledSlides = homeSettings.carousel.filter(s => s.enabled !== false)
    setCurrentSlide((prev) => (prev + 1) % enabledSlides.length)
  }

  const prevSlide = () => {
    if (!homeSettings?.carousel) return
    const enabledSlides = homeSettings.carousel.filter(s => s.enabled !== false)
    setCurrentSlide((prev) => (prev - 1 + enabledSlides.length) % enabledSlides.length)
  }

  const getIconComponent = (iconName) => {
    const icons = {
      truck: TruckIcon,
      shield: ShieldCheckIcon,
      refresh: ArrowPathIcon,
      support: ChatBubbleBottomCenterTextIcon,
      ShoppingBagIcon: ShoppingBagIcon,
      TruckIcon: TruckIcon,
      ShieldCheckIcon: ShieldCheckIcon,
      SparklesIcon: SparklesIcon,
      HeartIcon: HeartIcon,
      StarIcon: StarIcon,
      BoltIcon: BoltIcon,
      GiftIcon: GiftIcon,
      CreditCardIcon: CreditCardIcon,
      ClockIcon: ClockIcon,
      TagIcon: TagIcon,
      ChatBubbleLeftRightIcon: ChatBubbleLeftRightIcon,
      CubeIcon: CubeIcon,
      FireIcon: FireIcon,
      LightBulbIcon: LightBulbIcon,
      RocketLaunchIcon: RocketLaunchIcon,
      HandThumbUpIcon: HandThumbUpIcon,
      UserGroupIcon: UserGroupIcon,
      BuildingStorefrontIcon: BuildingStorefrontIcon,
      CurrencyDollarIcon: CurrencyDollarIcon,
      GlobeAltIcon: GlobeAltIcon,
      EnvelopeIcon: EnvelopeIcon,
      PhoneIcon: PhoneIcon,
      MapPinIcon: MapPinIcon,
      HomeIcon: HomeIconHero,
      CheckBadgeIcon: CheckBadgeIcon,
      AcademicCapIcon: AcademicCapIcon,
      BeakerIcon: BeakerIcon,
      BriefcaseIcon: BriefcaseIcon,
      CalendarIcon: CalendarIcon,
      CameraIcon: CameraIcon,
      ChartBarIcon: ChartBarIcon,
      DocumentTextIcon: DocumentTextIcon,
      FaceSmileIcon: FaceSmileIcon,
      FingerPrintIcon: FingerPrintIcon,
      MegaphoneIcon: MegaphoneIcon,
      MusicalNoteIcon: MusicalNoteIcon,
      PaintBrushIcon: PaintBrushIcon,
      PuzzlePieceIcon: PuzzlePieceIcon,
      TrophyIcon: TrophyIcon,
      WrenchScrewdriverIcon: WrenchScrewdriverIcon,
      BanknotesIcon: BanknotesIcon,
      BookOpenIcon: BookOpenIcon,
      BugAntIcon: BugAntIcon,
      CalculatorIcon: CalculatorIcon,
      ChatBubbleOvalLeftEllipsisIcon: ChatBubbleOvalLeftEllipsisIcon,
      ClipboardDocumentCheckIcon: ClipboardDocumentCheckIcon,
      CloudIcon: CloudIcon,
      CodeBracketIcon: CodeBracketIcon,
      Cog6ToothIcon: Cog6ToothIcon,
      ComputerDesktopIcon: ComputerDesktopIcon,
      CpuChipIcon: CpuChipIcon,
      DevicePhoneMobileIcon: DevicePhoneMobileIcon,
      FolderIcon: FolderIcon,
      GiftTopIcon: GiftTopIcon,
      HashtagIcon: HashtagIcon,
      KeyIcon: KeyIcon,
      LanguageIcon: LanguageIcon,
      LockClosedIcon: LockClosedIcon,
      MagnifyingGlassIcon: MagnifyingGlassIcon,
      NewspaperIcon: NewspaperIcon,
      PaperAirplaneIcon: PaperAirplaneIcon,
      PlayIcon: PlayIcon,
      PowerIcon: PowerIcon,
      PresentationChartLineIcon: PresentationChartLineIcon,
      PrinterIcon: PrinterIcon,
      QrCodeIcon: QrCodeIcon,
      ReceiptPercentIcon: ReceiptPercentIcon,
      ScaleIcon: ScaleIcon,
      ServerIcon: ServerIcon,
      ShareIcon: ShareIcon,
      ShieldExclamationIcon: ShieldExclamationIcon,
      SignalIcon: SignalIcon,
      SunIcon: SunIcon,
      TicketIcon: TicketIcon,
      VideoCameraIcon: VideoCameraIcon,
      WifiIcon: WifiIcon
    }
    return icons[iconName] || SparklesIcon
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const enabledSlides = homeSettings?.carousel?.filter(s => s.enabled !== false) || []
  
  // SEO metadata
  const metaTitle = homeSettings?.metaTitle || 'E-Commerce - Tu tienda online de confianza'
  const metaDescription = homeSettings?.metaDescription || 'Encuentra los mejores productos al mejor precio'
  const metaKeywords = homeSettings?.metaKeywords || 'tienda online, ecommerce, productos'

  return (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={metaKeywords} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
      
      {/* Hero Carousel */}
      {enabledSlides.length > 0 && (
        <div className="relative h-[500px] lg:h-[600px] overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-700">
          {enabledSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.title || `Slide ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => { e.target.style.display = 'none' }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
                  <div className="max-w-2xl text-white">
                    {slide.title && (
                      <h1 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in-up">
                        {slide.title}
                      </h1>
                    )}
                    {slide.subtitle && (
                      <p className="text-xl md:text-2xl mb-8 text-gray-200 animate-fade-in-up animation-delay-200">
                        {slide.subtitle}
                      </p>
                    )}
                    {slide.buttonText && slide.buttonLink && (
                      <Link
                        to={slide.buttonLink}
                        className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-full hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-lg animate-fade-in-up animation-delay-400"
                      >
                        {slide.buttonText}
                        <FireIcon className="ml-2 h-5 w-5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Navigation */}
          {enabledSlides.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
              >
                <ChevronLeftIcon className="h-6 w-6" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
              >
                <ChevronRightIcon className="h-6 w-6" />
              </button>
              
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
                {enabledSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentSlide 
                        ? 'bg-white w-8' 
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Hero Section (if no carousel) */}
      {enabledSlides.length === 0 && homeSettings && (
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 py-20 lg:py-32">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in-up">
              {homeSettings.heroTitle}
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 mb-10 max-w-3xl mx-auto animate-fade-in-up animation-delay-200">
              {homeSettings.heroSubtitle}
            </p>
            <div className="flex flex-wrap justify-center gap-4 animate-fade-in-up animation-delay-400">
              <Link
                to={homeSettings.heroCta1Link}
                className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-full hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 shadow-lg"
              >
                {homeSettings.heroCta1Text}
              </Link>
              <Link
                to={homeSettings.heroCta2Link}
                className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-full hover:bg-white hover:text-blue-600 transform hover:scale-105 transition-all duration-300"
              >
                {homeSettings.heroCta2Text}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Features */}
      {homeSettings?.featuresEnabled && homeSettings.features && homeSettings.features.length > 0 && (
        <div className="py-16 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
              {homeSettings.featuresTitle}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {homeSettings.features.map((feature, index) => {
                const IconComponent = getIconComponent(feature.icon)
                return (
                  <div 
                    key={index}
                    className="text-center p-6 rounded-xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-gradient-to-br from-gray-50 to-white dark:from-gray-700 dark:to-gray-800 border border-gray-100 dark:border-gray-600"
                  >
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-full mb-4">
                      <IconComponent className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {feature.description}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Coupon Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <CouponBanner />
      </div>

      {/* Custom Sections */}
      {homeSettings?.customSections && homeSettings.customSections.length > 0 && (
        <>
          {homeSettings.customSections
            .filter(section => section.enabled)
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((section) => {
              const IconComponent = getIconComponent(section.icon)
              
              return (
                <div 
                  key={section.id} 
                  style={{ backgroundColor: section.backgroundColor || '#f9fafb' }}
                  className="py-16"
                >
                  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    {/* Icon */}
                    <IconComponent
                      className="h-16 w-16 mx-auto mb-6"
                      style={{ color: section.textColor || '#111827' }}
                    />
                    
                    {/* Title */}
                    <h2 
                      style={{ color: section.textColor || '#111827' }}
                      className="text-3xl md:text-4xl font-bold mb-4"
                    >
                      {section.title}
                    </h2>
                    
                    {/* Subtitle/Description */}
                    {section.subtitle && (
                      <p 
                        style={{ color: section.textColor || '#6b7280', opacity: 0.8 }}
                        className="text-lg md:text-xl mb-8 max-w-2xl mx-auto"
                      >
                        {section.subtitle}
                      </p>
                    )}
                    
                    {/* Button */}
                    {section.buttonText && section.buttonLink && (
                      <Link
                        to={section.buttonLink}
                        style={{
                          backgroundColor: section.textColor || '#111827',
                          color: section.backgroundColor || '#ffffff'
                        }}
                        className="inline-block px-8 py-3 rounded-lg font-semibold transition-opacity hover:opacity-90 transform hover:scale-105 transition-all duration-300"
                      >
                        {section.buttonText}
                      </Link>
                    )}
                  </div>
                </div>
              )
            })}
        </>
      )}

      {/* Categories */}
      {homeSettings?.categoriesEnabled && categories.length > 0 && (
        <div className="py-16 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {homeSettings.categoriesTitle}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">Explora nuestras categorías más populares</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {categories.slice(0, 8).map((category) => {
                // Check if there's a custom icon for this category
                const customIconName = homeSettings.categoryIcons?.[category.id]
                const IconComponent = customIconName ? getIconComponent(customIconName) : null
                
                return (
                  <Link
                    key={category.id}
                    to={`/productos?categoria=${category.id}`}
                    className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-700 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                  >
                    <div className="aspect-square bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 p-8 flex items-center justify-center">
                      {IconComponent ? (
                        <IconComponent className="h-16 w-16 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300" />
                      ) : (
                        <span className="text-6xl group-hover:scale-110 transition-transform duration-300">
                          {category.icon || '📦'}
                        </span>
                      )}
                    </div>
                    <div className="p-4 bg-white dark:bg-gray-700">
                      <h3 className="font-semibold text-gray-900 dark:text-white text-center group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {category.name}
                      </h3>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Products */}
      {products.length > 0 && (
        <div className="py-16 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Productos Destacados
                </h2>
                <p className="text-gray-600 dark:text-gray-300">Descubre nuestras últimas novedades</p>
              </div>
              <Link
                to="/productos"
                className="hidden md:inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-colors"
              >
                Ver todos
                <ChevronRightIcon className="ml-2 h-5 w-5" />
              </Link>
            </div>
            <ProductGrid products={products} />
          </div>
        </div>
      )}

      {/* Newsletter */}
      {homeSettings?.newsletterEnabled && (
        <div className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">
              {homeSettings.newsletterTitle}
            </h2>
            <p className="text-xl text-gray-100 mb-8">
              {homeSettings.newsletterSubtitle}
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Tu email"
                className="flex-1 px-6 py-4 rounded-full text-gray-900 dark:text-white dark:bg-gray-700 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white"
              />
              <button
                type="submit"
                className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-full hover:bg-gray-100 transition-colors"
              >
                Suscribirse
              </button>
            </form>
          </div>
        </div>
      )}
      </div>
    </>
  )
}

export default Home

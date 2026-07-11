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
  WifiIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import ProductGrid from '../components/Product/ProductGrid'

const iconMap = {
  truck: TruckIcon, shield: ShieldCheckIcon, refresh: ArrowPathIcon, support: ChatBubbleBottomCenterTextIcon,
  ShoppingBagIcon, TruckIcon, ShieldCheckIcon, SparklesIcon, HeartIcon, StarIcon, BoltIcon, GiftIcon,
  CreditCardIcon, ClockIcon, TagIcon, ChatBubbleLeftRightIcon, CubeIcon, FireIcon, LightBulbIcon,
  RocketLaunchIcon, HandThumbUpIcon, UserGroupIcon, BuildingStorefrontIcon, CurrencyDollarIcon,
  GlobeAltIcon, EnvelopeIcon, PhoneIcon, MapPinIcon, HomeIcon: HomeIconHero, CheckBadgeIcon,
  AcademicCapIcon, BeakerIcon, BriefcaseIcon, CalendarIcon, CameraIcon, ChartBarIcon, DocumentTextIcon,
  FaceSmileIcon, FingerPrintIcon, MegaphoneIcon, MusicalNoteIcon, PaintBrushIcon, PuzzlePieceIcon,
  TrophyIcon, WrenchScrewdriverIcon, BanknotesIcon, BookOpenIcon, BugAntIcon, CalculatorIcon,
  ChatBubbleOvalLeftEllipsisIcon, ClipboardDocumentCheckIcon, CloudIcon, CodeBracketIcon, Cog6ToothIcon,
  ComputerDesktopIcon, CpuChipIcon, DevicePhoneMobileIcon, FolderIcon, GiftTopIcon, HashtagIcon,
  KeyIcon, LanguageIcon, LockClosedIcon, MagnifyingGlassIcon, NewspaperIcon, PaperAirplaneIcon,
  PlayIcon, PowerIcon, PresentationChartLineIcon, PrinterIcon, QrCodeIcon, ReceiptPercentIcon,
  ScaleIcon, ServerIcon, ShareIcon, ShieldExclamationIcon, SignalIcon, SunIcon, TicketIcon,
  VideoCameraIcon, WifiIcon
}

const getIcon = (name) => iconMap[name] || SparklesIcon

const Home = () => {
  const [homeSettings, setHomeSettings] = useState(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadHomeData() }, [])

  const loadHomeData = async () => {
    try {
      const [settingsRes, productsRes, categoriesRes] = await Promise.all([
        fetch('/api/home-settings'),
        fetch('/api/products?limit=8&sort=createdAt&order=DESC'),
        fetch('/api/categories')
      ])
      if (settingsRes.ok) setHomeSettings(await settingsRes.json())
      if (productsRes.ok) { const d = await productsRes.json(); setProducts(d.products || []) }
      if (categoriesRes.ok) { const d = await categoriesRes.json(); setCategories(d.categories || d || []) }
    } catch (error) {
      console.error('Error loading home data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!homeSettings?.carousel || homeSettings.carousel.length === 0) return
    const interval = setInterval(() => {
      setCurrentSlide((p) => (p + 1) % homeSettings.carousel.filter(s => s.enabled !== false).length)
    }, 5000)
    return () => clearInterval(interval)
  }, [homeSettings])

  const enabledSlides = homeSettings?.carousel?.filter(s => s.enabled !== false) || []
  const nextSlide = () => setCurrentSlide((p) => (p + 1) % enabledSlides.length)
  const prevSlide = () => setCurrentSlide((p) => (p - 1 + enabledSlides.length) % enabledSlides.length)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner h-10 w-10" />
      </div>
    )
  }

  const metaTitle = homeSettings?.metaTitle || 'TiendaKit — Tu tienda online'
  const metaDescription = homeSettings?.metaDescription || 'Encontrá los mejores productos al mejor precio'

  return (
    <>
      <Helmet>
        <title>{metaTitle}</title>
        <meta name="description" content={metaDescription} />
      </Helmet>

      <div className="min-h-screen">

        {/* ── Hero Carousel ── */}
        {enabledSlides.length > 0 && (
          <div className="relative h-[480px] lg:h-[560px] overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500">
            {enabledSlides.map((slide, i) => (
              <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <img src={slide.image} alt={slide.title || ''} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none' }} />
                <div className="absolute inset-0 bg-gradient-to-r from-surface-950/70 via-surface-950/40 to-transparent">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
                    <div className="max-w-xl animate-fade-in">
                      {slide.title && <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">{slide.title}</h1>}
                      {slide.subtitle && <p className="text-lg md:text-xl text-white/80 mb-8">{slide.subtitle}</p>}
                      {slide.buttonText && slide.buttonLink && (
                        <Link to={slide.buttonLink} className="inline-flex items-center gap-2 px-7 py-3.5 bg-white dark:bg-surface-800 text-primary-700 font-semibold rounded-xl hover:bg-primary-50 shadow-lg hover:shadow-xl transition-all duration-300">
                          {slide.buttonText}
                          <ArrowRightIcon className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {enabledSlides.length > 1 && (
              <>
                <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white transition-all"><ChevronLeftIcon className="h-5 w-5" /></button>
                <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white transition-all"><ChevronRightIcon className="h-5 w-5" /></button>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                  {enabledSlides.map((_, i) => (
                    <button key={i} onClick={() => setCurrentSlide(i)} className={`h-2 rounded-full transition-all duration-300 ${i === currentSlide ? 'bg-white dark:bg-surface-800 w-8' : 'bg-white/40 w-2 hover:bg-white/60'}`} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Hero fallback — bloque sólido, tipografía izquierda, sin gradiente ── */}
        {enabledSlides.length === 0 && homeSettings && (
          <div className="bg-primary-900 py-20 lg:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-2xl">
                <p className="text-primary-400 text-xs font-bold uppercase tracking-[0.2em] mb-5">
                  Tienda online
                </p>
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-6">
                  {homeSettings.heroTitle}
                </h1>
                <p className="text-lg text-primary-200 mb-10 leading-relaxed max-w-lg">
                  {homeSettings.heroSubtitle}
                </p>
                <div className="flex flex-wrap gap-4">
                  {homeSettings.heroCta1Text && homeSettings.heroCta1Link && (
                    <Link
                      to={homeSettings.heroCta1Link}
                      className="inline-flex items-center gap-2 px-8 py-4 bg-accent-500 hover:bg-accent-600 text-white font-semibold rounded-lg transition-colors"
                    >
                      {homeSettings.heroCta1Text}
                      <ArrowRightIcon className="h-4 w-4" />
                    </Link>
                  )}
                  {homeSettings.heroCta2Text && homeSettings.heroCta2Link && (
                    <Link
                      to={homeSettings.heroCta2Link}
                      className="inline-flex items-center gap-2 px-8 py-4 border border-primary-600 text-primary-100 font-semibold rounded-lg hover:border-primary-400 hover:text-white transition-colors"
                    >
                      {homeSettings.heroCta2Text}
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Features — estilo editorial, sin íconos, borde superior primario ── */}
        {homeSettings?.featuresEnabled && homeSettings.features?.length > 0 && (
          <section className="py-14 border-y border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
                {homeSettings.features.map((feat, i) => (
                  <div key={i} className="border-t-2 border-primary-500 pt-5">
                    <h3 className="text-sm font-bold text-surface-900 dark:text-white uppercase tracking-wider mb-2">
                      {feat.title}
                    </h3>
                    <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Coupon Banner ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <CouponBanner />
        </div>

        {/* ── Custom Sections ── */}
        {homeSettings?.customSections?.filter(s => s.enabled).sort((a, b) => (a.order || 0) - (b.order || 0)).map((section) => {
          const Icon = getIcon(section.icon)
          return (
            <section key={section.id} style={{ backgroundColor: section.backgroundColor || '#fafafa' }} className="py-20">
              <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <Icon className="h-12 w-12 mx-auto mb-5" style={{ color: section.textColor || '#171717' }} />
                <h2 style={{ color: section.textColor || '#171717' }} className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">{section.title}</h2>
                {section.subtitle && (
                  <p style={{ color: section.textColor || '#737373' }} className="text-lg mb-8 max-w-2xl mx-auto">{section.subtitle}</p>
                )}
                {section.buttonText && section.buttonLink && (
                  <Link to={section.buttonLink} style={{ backgroundColor: section.textColor || '#171717', color: section.backgroundColor || '#fff' }}
                    className="inline-flex items-center gap-2 px-7 py-3 rounded-xl font-semibold hover:opacity-90 transition-all duration-300">
                    {section.buttonText}
                    <ArrowRightIcon className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </section>
          )
        })}

        {/* ── Categories — grid compacto, foco en el nombre ── */}
        {homeSettings?.categoriesEnabled && categories.length > 0 && (
          <section className="py-16 bg-surface-50 dark:bg-surface-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-baseline justify-between mb-8">
                <h2 className="text-heading-2 text-surface-900 dark:text-white">{homeSettings.categoriesTitle}</h2>
                <Link to="/productos" className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
                  Ver todo →
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-3">
                {categories.slice(0, 8).map((cat) => {
                  const customIcon = homeSettings.categoryIcons?.[cat.id]
                  const Icon = customIcon ? getIcon(customIcon) : null
                  return (
                    <Link
                      key={cat.id}
                      to={`/productos?categoria=${cat.id}`}
                      className="group flex flex-col items-center gap-2.5 py-5 px-3 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-xl hover:border-primary-400 dark:hover:border-primary-700 hover:bg-primary-50 dark:hover:bg-primary-950/30 transition-all duration-200"
                    >
                      <span className="text-2xl leading-none">
                        {Icon ? (
                          <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400 group-hover:scale-110 transition-transform" />
                        ) : (
                          cat.icon || '📦'
                        )}
                      </span>
                      <h3 className="text-xs font-semibold text-surface-700 dark:text-surface-300 group-hover:text-primary-700 dark:group-hover:text-primary-300 text-center leading-tight transition-colors">
                        {cat.name}
                      </h3>
                    </Link>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── Products ── */}
        {products.length > 0 && (
          <section className="py-16 bg-white dark:bg-surface-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-baseline justify-between mb-8">
                <h2 className="text-heading-2 text-surface-900 dark:text-white">Productos Destacados</h2>
                <Link to="/productos" className="hidden md:inline-flex items-center gap-1 text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
                  Ver todos →
                </Link>
              </div>
              <ProductGrid products={products} />
              <div className="md:hidden text-center mt-8">
                <Link to="/productos" className="btn-primary">Ver todos los productos</Link>
              </div>
            </div>
          </section>
        )}

        {/* ── Newsletter — sólido, sin gradiente ── */}
        {homeSettings?.newsletterEnabled && (
          <section className="py-16 bg-primary-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-xl">
                <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">{homeSettings.newsletterTitle}</h2>
                <p className="text-primary-200 mb-7 text-base">{homeSettings.newsletterSubtitle}</p>
                <form className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder="Tu email"
                    className="flex-1 px-4 py-3 bg-primary-800/60 border border-primary-700 text-white placeholder:text-primary-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all"
                  />
                  <button
                    type="submit"
                    className="px-7 py-3 bg-accent-500 hover:bg-accent-600 text-white font-semibold rounded-lg transition-colors whitespace-nowrap"
                  >
                    Suscribirse
                  </button>
                </form>
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  )
}

export default Home

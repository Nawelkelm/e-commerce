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

        {/* ── Hero fallback (no carousel) ── */}
        {enabledSlides.length === 0 && homeSettings && (
          <div className="relative bg-gradient-to-br from-primary-700 via-primary-600 to-accent-500 py-24 lg:py-32 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)]" />
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">{homeSettings.heroTitle}</h1>
              <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto">{homeSettings.heroSubtitle}</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to={homeSettings.heroCta1Link} className="px-7 py-3.5 bg-white dark:bg-surface-800 text-primary-700 font-semibold rounded-xl hover:bg-primary-50 shadow-lg transition-all duration-300">
                  {homeSettings.heroCta1Text}
                </Link>
                <Link to={homeSettings.heroCta2Link} className="px-7 py-3.5 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300">
                  {homeSettings.heroCta2Text}
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* ── Features ── */}
        {homeSettings?.featuresEnabled && homeSettings.features?.length > 0 && (
          <section className="py-20 bg-white dark:bg-surface-800 dark:bg-surface-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="section-heading text-center mb-12">{homeSettings.featuresTitle}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {homeSettings.features.map((feat, i) => {
                  const Icon = getIcon(feat.icon)
                  return (
                    <div key={i} className="card-hover p-6 text-center group">
                      <div className="inline-flex items-center justify-center w-14 h-14 bg-primary-100 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Icon className="h-7 w-7" />
                      </div>
                      <h3 className="text-base font-semibold text-surface-900 dark:text-white mb-2">{feat.title}</h3>
                      <p className="text-sm text-surface-500 dark:text-surface-400">{feat.description}</p>
                    </div>
                  )
                })}
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

        {/* ── Categories ── */}
        {homeSettings?.categoriesEnabled && categories.length > 0 && (
          <section className="py-20 bg-surface-50 dark:bg-surface-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-12">
                <h2 className="section-heading mb-3">{homeSettings.categoriesTitle}</h2>
                <p className="section-subheading">Explorá nuestras categorías más populares</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
                {categories.slice(0, 8).map((cat) => {
                  const customIcon = homeSettings.categoryIcons?.[cat.id]
                  const Icon = customIcon ? getIcon(customIcon) : null
                  return (
                    <Link key={cat.id} to={`/productos?categoria=${cat.id}`}
                      className="card-hover group p-6 flex flex-col items-center text-center">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 dark:from-primary-950 dark:to-primary-900 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        {Icon ? (
                          <Icon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                        ) : (
                          <span className="text-3xl">{cat.icon || '📦'}</span>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-surface-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
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
          <section className="py-20 bg-white dark:bg-surface-800/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <h2 className="section-heading mb-2">Productos Destacados</h2>
                  <p className="section-subheading mt-0">Descubrí nuestras últimas novedades</p>
                </div>
                <Link to="/productos" className="hidden md:inline-flex items-center gap-2 btn-primary">
                  Ver todos
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
              <ProductGrid products={products} />
              <div className="md:hidden text-center mt-8">
                <Link to="/productos" className="btn-primary">Ver todos los productos</Link>
              </div>
            </div>
          </section>
        )}

        {/* ── Newsletter ── */}
        {homeSettings?.newsletterEnabled && (
          <section className="py-20 bg-gradient-to-br from-primary-700 via-primary-600 to-accent-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.08),transparent_50%)]" />
            <div className="relative max-w-xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl font-bold text-white mb-3 tracking-tight">{homeSettings.newsletterTitle}</h2>
              <p className="text-lg text-white/80 mb-8">{homeSettings.newsletterSubtitle}</p>
              <form className="flex flex-col sm:flex-row gap-3">
                <input type="email" placeholder="Tu email" className="flex-1 px-5 py-3.5 rounded-xl bg-white/10 backdrop-blur-sm text-white placeholder:text-white/50 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-transparent" />
                <button type="submit" className="px-7 py-3.5 bg-white dark:bg-surface-800 text-primary-700 font-semibold rounded-xl hover:bg-primary-50 shadow-lg transition-all duration-300">
                  Suscribirse
                </button>
              </form>
            </div>
          </section>
        )}
      </div>
    </>
  )
}

export default Home

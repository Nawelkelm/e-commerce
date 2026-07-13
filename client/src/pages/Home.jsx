import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import CouponBanner from '../components/CouponBanner.jsx'
import {
  ChevronLeftIcon, ChevronRightIcon,
  TruckIcon, ShieldCheckIcon, ArrowPathIcon, ChatBubbleBottomCenterTextIcon,
  SparklesIcon, FireIcon, ShoppingBagIcon, HeartIcon, StarIcon, BoltIcon,
  GiftIcon, CreditCardIcon, ClockIcon, TagIcon, ChatBubbleLeftRightIcon,
  CubeIcon, LightBulbIcon, RocketLaunchIcon, HandThumbUpIcon, UserGroupIcon,
  BuildingStorefrontIcon, CurrencyDollarIcon, GlobeAltIcon, EnvelopeIcon,
  PhoneIcon, MapPinIcon, HomeIcon as HomeIconHero, CheckBadgeIcon,
  AcademicCapIcon, BeakerIcon, BriefcaseIcon, CalendarIcon, CameraIcon,
  ChartBarIcon, DocumentTextIcon, FaceSmileIcon, FingerPrintIcon,
  MegaphoneIcon, MusicalNoteIcon, PaintBrushIcon, PuzzlePieceIcon,
  TrophyIcon, WrenchScrewdriverIcon, BanknotesIcon, BookOpenIcon,
  BugAntIcon, CalculatorIcon, ChatBubbleOvalLeftEllipsisIcon,
  ClipboardDocumentCheckIcon, CloudIcon, CodeBracketIcon, Cog6ToothIcon,
  ComputerDesktopIcon, CpuChipIcon, DevicePhoneMobileIcon, FolderIcon,
  GiftTopIcon, HashtagIcon, KeyIcon, LanguageIcon, LockClosedIcon,
  MagnifyingGlassIcon, NewspaperIcon, PaperAirplaneIcon, PlayIcon,
  PowerIcon, PresentationChartLineIcon, PrinterIcon, QrCodeIcon,
  ReceiptPercentIcon, ScaleIcon, ServerIcon, ShareIcon,
  ShieldExclamationIcon, SignalIcon, SunIcon, TicketIcon, VideoCameraIcon,
  WifiIcon, ArrowRightIcon, ShoppingCartIcon
} from '@heroicons/react/24/outline'
import ProductGrid from '../components/Product/ProductGrid'
import { getProductImageUrl, PLACEHOLDER_IMAGE } from '../utils/imageHelpers'
import { useAuthStore } from '../store/authStore'
import { toast } from 'react-hot-toast'

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
  const { addToCart } = useAuthStore()
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
    } catch {
      // silent — loading se detiene en finally
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

  const handleAddToCartHome = (e, product) => {
    e.preventDefault()
    addToCart(product)
    toast.success(`${product.name} agregado al carrito`, { duration: 2000, position: 'bottom-right' })
  }

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

        {/* ── Hero Carousel — fondo sólido malbec ── */}
        {enabledSlides.length > 0 && (
          <div className="relative h-[480px] lg:h-[560px] overflow-hidden bg-primary-900">
            {enabledSlides.map((slide, i) => (
              <div key={i} className={`absolute inset-0 transition-opacity duration-1000 ${i === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <img src={slide.image} alt={slide.title || ''} className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none' }} />
                <div className="absolute inset-0 bg-gradient-to-r from-surface-950/80 via-surface-950/40 to-transparent">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
                    <div className="max-w-lg animate-fade-in">
                      {slide.title && <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight leading-tight">{slide.title}</h1>}
                      {slide.subtitle && <p className="text-base text-white/75 mb-8 leading-relaxed">{slide.subtitle}</p>}
                      {slide.buttonText && slide.buttonLink && (
                        <Link to={slide.buttonLink} className="inline-flex items-center gap-2 text-white font-semibold border-b-2 border-accent-500 pb-0.5 hover:border-accent-400 transition-colors">
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
                    <button key={i} onClick={() => setCurrentSlide(i)} className={`h-2 rounded-full transition-all duration-300 ${i === currentSlide ? 'bg-white w-8' : 'bg-white/40 w-2 hover:bg-white/60'}`} />
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Hero fallback — layout editorial dos columnas ── */}
        {enabledSlides.length === 0 && homeSettings && (
          <div className="bg-primary-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[440px] lg:min-h-[480px]">

                {/* Izquierda: tipografía editorial grande */}
                <div className="flex flex-col justify-center py-14 lg:py-20 pr-0 lg:pr-14">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-[10px] text-primary-500 font-bold uppercase tracking-[0.25em]">
                      Tienda online
                    </span>
                    <div className="flex-1 h-px bg-primary-800" />
                  </div>
                  <h1 className="text-[52px] sm:text-[64px] lg:text-[72px] font-bold text-white leading-[0.94] tracking-tight mb-7">
                    {homeSettings.heroTitle}
                  </h1>
                  <p className="text-sm text-primary-300 mb-10 leading-relaxed max-w-sm">
                    {homeSettings.heroSubtitle}
                  </p>
                  <div className="flex flex-wrap items-center gap-6">
                    {homeSettings.heroCta1Text && homeSettings.heroCta1Link && (
                      <Link to={homeSettings.heroCta1Link}
                        className="inline-flex items-center gap-2 text-white font-semibold border-b-2 border-accent-500 pb-0.5 hover:border-accent-400 transition-colors">
                        {homeSettings.heroCta1Text}
                        <ArrowRightIcon className="h-4 w-4" />
                      </Link>
                    )}
                    {homeSettings.heroCta2Text && homeSettings.heroCta2Link && (
                      <Link to={homeSettings.heroCta2Link}
                        className="text-sm text-primary-400 font-medium hover:text-primary-200 transition-colors">
                        {homeSettings.heroCta2Text}
                      </Link>
                    )}
                  </div>
                </div>

                {/* Derecha: lista de novedades (solo desktop) */}
                {products.length > 0 && (
                  <div className="hidden lg:flex flex-col justify-center border-l border-primary-800/50 py-20 pl-12">
                    <p className="text-[10px] text-primary-600 font-bold uppercase tracking-[0.2em] mb-5">
                      Novedades
                    </p>
                    <div>
                      {products.slice(0, 4).map((product, i) => (
                        <Link
                          key={product.id}
                          to={`/productos/${product.slug}`}
                          className="group flex items-center gap-4 py-3 border-b border-primary-800/40 last:border-0 hover:bg-primary-950/40 -mx-3 px-3 transition-colors"
                        >
                          <span className="text-[11px] font-mono text-primary-700 flex-shrink-0 w-5">
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <span className="flex-1 text-sm text-primary-300 group-hover:text-white transition-colors line-clamp-1">
                            {product.name}
                          </span>
                          <span className="text-sm font-semibold text-accent-400 flex-shrink-0">
                            ${parseFloat(product.price).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </span>
                        </Link>
                      ))}
                    </div>
                    <Link to="/productos" className="mt-5 text-[10px] text-primary-600 hover:text-primary-400 uppercase tracking-wider transition-colors">
                      Ver todo el catálogo →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Features — estilo editorial, borde superior primario ── */}
        {homeSettings?.featuresEnabled && homeSettings.features?.length > 0 && (
          <section className="py-12 border-y border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900">
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

        {/* ── Categories — lista tipográfica numerada, no icon-cards ── */}
        {homeSettings?.categoriesEnabled && categories.length > 0 && (
          <section className="py-14 bg-surface-50 dark:bg-surface-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

              {/* Header editorial: label + regla + link */}
              <div className="flex items-center gap-3 mb-8">
                <span className="text-[10px] font-bold text-primary-600 dark:text-primary-500 uppercase tracking-[0.2em] flex-shrink-0">
                  {homeSettings.categoriesTitle || 'Categorías'}
                </span>
                <div className="flex-1 h-px bg-surface-200 dark:bg-surface-800" />
                <Link to="/productos" className="text-[10px] text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 uppercase tracking-wider transition-colors flex-shrink-0">
                  Explorar todo →
                </Link>
              </div>

              {/* Lista tipográfica — no icon cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-0">
                {categories.slice(0, 8).map((cat, i) => (
                  <Link
                    key={cat.id}
                    to={`/productos?categoria=${cat.id}`}
                    className="group flex items-center gap-4 py-4 border-b border-surface-200 dark:border-surface-800 hover:bg-white dark:hover:bg-surface-900 transition-colors -mx-3 px-3"
                  >
                    <span className="text-[11px] font-mono text-surface-300 dark:text-surface-600 flex-shrink-0 w-5 text-right">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="flex-1 text-sm font-semibold text-surface-800 dark:text-surface-200 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors">
                      {cat.name}
                    </span>
                    <ArrowRightIcon className="h-3.5 w-3.5 text-surface-300 dark:text-surface-600 group-hover:text-primary-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── Products — grid editorial asimétrico ── */}
        {products.length > 0 && (
          <section className="py-16 bg-white dark:bg-surface-950">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

              {/* Header editorial: label + regla + link */}
              <div className="flex items-center gap-3 mb-8">
                <span className="text-[10px] font-bold text-primary-600 dark:text-primary-500 uppercase tracking-[0.2em] flex-shrink-0">
                  Productos destacados
                </span>
                <div className="flex-1 h-px bg-surface-200 dark:bg-surface-800" />
                <Link to="/productos" className="hidden md:block text-[10px] text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 uppercase tracking-wider transition-colors flex-shrink-0">
                  Ver todos →
                </Link>
              </div>

              {/* Layout asimétrico: 1 destacado (1/3) + 2×2 grid (2/3) */}
              {products.length >= 2 ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                  {/* Card destacada — imagen crece para llenar alto del grid */}
                  <Link
                    to={`/productos/${products[0].slug}`}
                    className="group lg:col-span-1 relative bg-white dark:bg-surface-900 flex flex-col overflow-hidden rounded-xl border border-surface-200 dark:border-surface-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-card-hover transition-all duration-200"
                  >
                    {products[0].discount > 0 && (
                      <span className="absolute top-3 left-3 z-10 bg-error-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide">
                        -{products[0].discount}%
                      </span>
                    )}
                    {products[0].stock > 0 && !products[0].discount && products[0].isNew && (
                      <span className="absolute top-3 right-3 z-10 bg-primary-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide">
                        Nuevo
                      </span>
                    )}
                    <div className="relative flex-1 overflow-hidden bg-surface-100 dark:bg-surface-800" style={{ minHeight: '220px' }}>
                      <img
                        src={getProductImageUrl(products[0])}
                        alt={products[0].name}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-smooth"
                        onError={(e) => { e.target.src = PLACEHOLDER_IMAGE }}
                      />
                    </div>
                    <div className="p-5 flex flex-col gap-2">
                      {products[0].Category && (
                        <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-[0.12em]">
                          {products[0].Category.name}
                        </span>
                      )}
                      <h3 className="text-base font-semibold text-surface-900 dark:text-white leading-snug line-clamp-2 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors">
                        {products[0].name}
                      </h3>
                      <div className="flex items-center justify-between mt-1 gap-2">
                        <span className="text-2xl font-bold text-accent-600 dark:text-accent-400">
                          ${(products[0].discount
                            ? parseFloat(products[0].price) * (1 - products[0].discount / 100)
                            : parseFloat(products[0].price)
                          ).toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                        </span>
                        {products[0].stock > 0 && (
                          <button
                            onClick={(e) => handleAddToCartHome(e, products[0])}
                            className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 bg-accent-500 hover:bg-accent-600 text-white text-xs font-semibold rounded-lg transition-colors"
                            aria-label="Agregar al carrito"
                          >
                            <ShoppingCartIcon className="h-3.5 w-3.5" />
                            Agregar
                          </button>
                        )}
                      </div>
                    </div>
                  </Link>

                  {/* Grid 2×2 de cards secundarias */}
                  <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                    {products.slice(1, 5).map((product) => {
                      const displayPrice = product.discount
                        ? parseFloat(product.price) * (1 - product.discount / 100)
                        : parseFloat(product.price)
                      const outOfStock = product.stock === 0

                      return (
                        <Link
                          key={product.id}
                          to={`/productos/${product.slug}`}
                          className="group relative bg-white dark:bg-surface-900 flex flex-col overflow-hidden rounded-xl border border-surface-200 dark:border-surface-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-card-hover transition-all duration-200"
                        >
                          {product.discount > 0 && (
                            <span className="absolute top-2 left-2 z-10 bg-error-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide">
                              -{product.discount}%
                            </span>
                          )}
                          <div className="relative aspect-square overflow-hidden bg-surface-100 dark:bg-surface-800">
                            <img
                              src={getProductImageUrl(product)}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-smooth"
                              onError={(e) => { e.target.src = PLACEHOLDER_IMAGE }}
                            />
                          </div>
                          <div className="p-3 flex flex-col flex-1 gap-1">
                            <h3 className="text-xs font-medium text-surface-900 dark:text-white leading-snug line-clamp-2 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors flex-1">
                              {product.name}
                            </h3>
                            <div className="flex items-center justify-between gap-1 mt-auto pt-2">
                              <span className="text-sm font-bold text-accent-600 dark:text-accent-400">
                                ${displayPrice.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                              </span>
                              <button
                                onClick={(e) => handleAddToCartHome(e, product)}
                                disabled={outOfStock}
                                className="flex-shrink-0 inline-flex items-center justify-center w-8 h-8 bg-accent-500 hover:bg-accent-600 text-white rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                                aria-label="Agregar al carrito"
                              >
                                <ShoppingCartIcon className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <ProductGrid products={products} />
              )}

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

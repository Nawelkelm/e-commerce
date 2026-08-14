import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { getProductImageUrl, PLACEHOLDER_IMAGE } from '../utils/imageHelpers'
import PageMeta from '../components/SEO/PageMeta'
import StarRating from '../components/StarRating'
import ReviewList from '../components/ReviewList'
import ReviewForm from '../components/ReviewForm'
import {
  ShoppingCartIcon,
  HeartIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilSquareIcon,
  MapPinIcon,
  BuildingStorefrontIcon,
  MinusIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { toast } from 'react-hot-toast'

/* Encabezado de sección editorial: label + regla fina. Mismo lenguaje que Home/Products. */
const SectionHeader = ({ children, right }) => (
  <div className="flex items-center gap-3 mb-6">
    <span className="text-[10px] font-bold text-primary-600 dark:text-primary-500 uppercase tracking-[0.2em] flex-shrink-0">
      {children}
    </span>
    <div className="flex-1 h-px bg-surface-200 dark:bg-surface-800" />
    {right}
  </div>
)

const ProductDetail = () => {
  const { slug } = useParams()
  const { addToCart, isAuthenticated } = useAuthStore()

  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [quantity, setQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [addingToCart, setAddingToCart] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewStats, setReviewStats] = useState(null)

  // Cotizador de envío
  const [shippingPostalCode, setShippingPostalCode] = useState('')
  const [shippingCity, setShippingCity] = useState('')
  const [shippingState, setShippingState] = useState('')
  const [shippingQuotes, setShippingQuotes] = useState([])
  const [shippingLoading, setShippingLoading] = useState(false)
  const [shippingError, setShippingError] = useState('')
  const [shippingQuoted, setShippingQuoted] = useState(false)

  useEffect(() => {
    fetchProduct()
  }, [slug])

  useEffect(() => {
    if (product) {
      fetchReviewStats()
    }
  }, [product])

  const fetchProduct = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/products/${slug}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Producto no encontrado')
        }
        throw new Error('Error al cargar el producto')
      }

      const data = await response.json()
      setProduct(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchReviewStats = async () => {
    try {
      const response = await fetch(`/api/products/${product.id}/reviews/stats`)
      if (response.ok) {
        const data = await response.json()
        setReviewStats(data)
      }
    } catch {
      // silencioso: la sección de reseñas degrada sola
    }
  }

  const handleAddToCart = async () => {
    if (!product) return

    if (product.stock === 0) {
      toast.error('Producto sin stock')
      return
    }

    if (quantity > product.stock) {
      toast.error(`Solo hay ${product.stock} unidades disponibles`)
      return
    }

    setAddingToCart(true)
    try {
      const imageUrl = getProductImageUrl(product)

      addToCart({
        id: product.id,
        name: product.name,
        price: parseFloat(getCurrentPrice()),
        image: imageUrl,
        quantity: quantity,
        weight: product.weight ? parseFloat(product.weight) * 1000 : 500,
        dimensions: product.dimensions || { length: 20, width: 20, height: 10 }
      })

      toast.success('Producto agregado al carrito')
    } catch {
      toast.error('Error al agregar al carrito')
    } finally {
      setAddingToCart(false)
    }
  }

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change
    if (newQuantity >= 1 && newQuantity <= (product?.stock || 1)) {
      setQuantity(newQuantity)
    }
  }

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite)
    toast.success(isFavorite ? 'Removido de favoritos' : 'Agregado a favoritos')
  }

  const nextImage = () => {
    if (product?.images?.length > 0) {
      setSelectedImage((prev) => (prev + 1) % product.images.length)
    }
  }

  const prevImage = () => {
    if (product?.images?.length > 0) {
      setSelectedImage((prev) => (prev - 1 + product.images.length) % product.images.length)
    }
  }

  const getImageUrl = (image) => {
    if (!image) return PLACEHOLDER_IMAGE
    if (typeof image === 'object' && image.url) return image.url
    if (typeof image === 'string') {
      if (image.startsWith('/uploads')) return image
      if (!image.startsWith('http')) return `/uploads/${image}`
      return image
    }
    return PLACEHOLDER_IMAGE
  }

  const getCurrentPrice = () => {
    if (!product) return 0
    const salePrice = parseFloat(product.salePrice)
    const regularPrice = parseFloat(product.price)
    return (salePrice && salePrice > 0) ? salePrice : regularPrice
  }

  const hasDiscount = () => {
    if (!product?.salePrice || !product?.price) return false
    const salePrice = parseFloat(product.salePrice)
    const regularPrice = parseFloat(product.price)
    return salePrice > 0 && salePrice < regularPrice
  }

  const getDiscountPercentage = () => {
    if (!hasDiscount()) return 0
    const salePrice = parseFloat(product.salePrice)
    const regularPrice = parseFloat(product.price)
    return Math.round(((regularPrice - salePrice) / regularPrice) * 100)
  }

  const fmt = (n) => parseFloat(n || 0).toLocaleString('es-AR', { minimumFractionDigits: 0 })

  const handleShippingQuote = async () => {
    if (!shippingPostalCode || !shippingCity || !shippingState) {
      setShippingError('Completá código postal, ciudad y provincia')
      return
    }
    setShippingError('')
    setShippingLoading(true)
    try {
      const dims = product.dimensions || {}
      const response = await fetch('/api/shipping-methods/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postalCode: shippingPostalCode,
          city: shippingCity,
          state: shippingState,
          items: [{
            productId: product.id,
            quantity: 1,
            weight: product.weight ? parseFloat(product.weight) * 1000 : 500,
            dimensions: dims
          }],
          subtotal: parseFloat(product.salePrice || product.price || 0)
        })
      })
      if (response.ok) {
        const data = await response.json()
        setShippingQuotes(data.quotes || [])
        setShippingQuoted(true)
      } else {
        setShippingError('No se pudo obtener la cotización')
      }
    } catch {
      setShippingError('Error al conectar con el servicio de envío')
    } finally {
      setShippingLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner h-10 w-10 mx-auto" />
          <p className="mt-4 text-sm text-surface-500 dark:text-surface-400">Cargando producto…</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <XCircleIcon className="h-14 w-14 text-error-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-2">
            No pudimos cargar el producto
          </h2>
          <p className="text-sm text-surface-500 dark:text-surface-400 mb-6">{error}</p>
          <Link to="/productos" className="btn-primary btn-sm">
            <ArrowLeftIcon className="h-4 w-4" />
            Volver al catálogo
          </Link>
        </div>
      </div>
    )
  }

  if (!product) {
    return null
  }

  const mainImage = product.images?.[selectedImage]
    ? getImageUrl(product.images[selectedImage])
    : getProductImageUrl(product)

  const hasRealReviews = reviewStats && reviewStats.totalReviews > 0

  return (
    <>
      <PageMeta
        title={product.seoTitle || product.name}
        description={product.seoDescription || product.shortDescription || product.description}
        keywords={Array.isArray(product.tags) ? product.tags.join(', ') : product.tags || ''}
      />

      <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28 lg:pb-16">

          {/* Breadcrumb editorial */}
          <nav className="flex items-center gap-2 text-xs text-surface-400 dark:text-surface-500 mb-8">
            <Link to="/" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Inicio</Link>
            <span>/</span>
            <Link to="/productos" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Catálogo</Link>
            {product.category && (
              <>
                <span>/</span>
                <Link to={`/productos?categoria=${product.category.id}`} className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  {product.category.name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-surface-700 dark:text-surface-300 font-medium truncate max-w-[12rem]">{product.name}</span>
          </nav>

          {/* Bloque principal: imágenes + buy box */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">

            {/* Columna izquierda — galería */}
            <div className="space-y-3">
              <div className="relative aspect-square bg-white dark:bg-surface-900 rounded-2xl overflow-hidden border border-surface-200 dark:border-surface-800">
                <img
                  src={mainImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = PLACEHOLDER_IMAGE }}
                />

                {hasDiscount() && (
                  <div className="absolute top-4 left-4 bg-error-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    −{getDiscountPercentage()}%
                  </div>
                )}

                {product.stock === 0 ? (
                  <div className="absolute top-4 right-4 bg-surface-900/90 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                    Sin stock
                  </div>
                ) : product.stock <= 5 ? (
                  <div className="absolute top-4 right-4 bg-warning-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                    Últimas {product.stock}
                  </div>
                ) : null}

                {product.images?.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      aria-label="Imagen anterior"
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-surface-800/90 p-2 rounded-full shadow-card hover:bg-white dark:hover:bg-surface-700 transition-colors"
                    >
                      <ChevronLeftIcon className="h-5 w-5 text-surface-800 dark:text-white" />
                    </button>
                    <button
                      onClick={nextImage}
                      aria-label="Imagen siguiente"
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-surface-800/90 p-2 rounded-full shadow-card hover:bg-white dark:hover:bg-surface-700 transition-colors"
                    >
                      <ChevronRightIcon className="h-5 w-5 text-surface-800 dark:text-white" />
                    </button>
                  </>
                )}
              </div>

              {product.images?.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      aria-label={`Ver imagen ${index + 1}`}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index
                          ? 'border-primary-600 dark:border-primary-400'
                          : 'border-surface-200 dark:border-surface-800 hover:border-surface-300 dark:hover:border-surface-600'
                      }`}
                    >
                      <img
                        src={getImageUrl(image)}
                        alt={`${product.name} — ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = PLACEHOLDER_IMAGE }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Columna derecha — buy box */}
            <div>
              {product.category && (
                <Link
                  to={`/productos?categoria=${product.category.id}`}
                  className="text-[11px] font-bold text-primary-600 dark:text-primary-500 uppercase tracking-[0.18em] hover:text-primary-700 dark:hover:text-primary-400 transition-colors"
                >
                  {product.category.name}
                </Link>
              )}

              <h1 className="mt-3 text-3xl lg:text-[40px] font-bold text-surface-900 dark:text-white leading-[1.05] tracking-tight">
                {product.name}
              </h1>

              {/* Rating — solo con datos reales; si no hay, invitación honesta */}
              <div className="mt-4">
                {hasRealReviews ? (
                  <a href="#resenas" className="inline-flex items-center gap-2 group">
                    <StarRating rating={reviewStats.averageRating} />
                    <span className="text-sm text-surface-600 dark:text-surface-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {reviewStats.averageRating.toFixed(1)} · {reviewStats.totalReviews} {reviewStats.totalReviews === 1 ? 'reseña' : 'reseñas'}
                    </span>
                  </a>
                ) : (
                  <a href="#resenas" className="text-sm text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    Sin reseñas todavía · sé el primero en opinar
                  </a>
                )}
              </div>

              {product.shortDescription && (
                <p className="mt-5 text-base text-surface-600 dark:text-surface-400 leading-relaxed">
                  {product.shortDescription}
                </p>
              )}

              {/* Precio */}
              <div className="mt-6 flex items-baseline gap-3 flex-wrap">
                <span className="text-4xl font-bold text-accent-600 dark:text-accent-400 tracking-tight">
                  ${fmt(getCurrentPrice())}
                </span>
                {hasDiscount() && (
                  <>
                    <span className="text-lg text-surface-400 line-through">${fmt(product.price)}</span>
                    <span className="text-sm font-semibold text-success-600 dark:text-success-500">
                      Ahorrás ${fmt(parseFloat(product.price) - parseFloat(product.salePrice))}
                    </span>
                  </>
                )}
              </div>

              {/* Stock */}
              <div className="mt-4 flex items-center gap-2">
                {product.stock > 0 ? (
                  <>
                    <CheckCircleIcon className="h-5 w-5 text-success-500" />
                    <span className="text-sm font-medium text-success-700 dark:text-success-500">
                      En stock · {product.stock} {product.stock === 1 ? 'disponible' : 'disponibles'}
                    </span>
                  </>
                ) : (
                  <>
                    <XCircleIcon className="h-5 w-5 text-error-500" />
                    <span className="text-sm font-medium text-error-700 dark:text-error-400">Sin stock por ahora</span>
                  </>
                )}
              </div>

              {/* Cantidad + CTA */}
              {product.stock > 0 && (
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <div className="flex items-center rounded-lg border border-surface-300 dark:border-surface-700 overflow-hidden self-start">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      aria-label="Restar uno"
                      className="px-3.5 py-3 text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <MinusIcon className="h-4 w-4" />
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1
                        if (val >= 1 && val <= product.stock) setQuantity(val)
                      }}
                      className="w-14 text-center text-sm font-semibold bg-transparent border-x border-surface-300 dark:border-surface-700 text-surface-900 dark:text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      min="1"
                      max={product.stock}
                    />
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.stock}
                      aria-label="Sumar uno"
                      className="px-3.5 py-3 text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    >
                      <PlusIcon className="h-4 w-4" />
                    </button>
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="flex-1 btn-cta btn-lg"
                  >
                    <ShoppingCartIcon className="h-5 w-5" />
                    <span>{addingToCart ? 'Agregando…' : 'Agregar al carrito'}</span>
                  </button>

                  <button
                    onClick={toggleFavorite}
                    aria-label={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                    className="p-3.5 rounded-lg border border-surface-300 dark:border-surface-700 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors self-start sm:self-auto"
                  >
                    {isFavorite
                      ? <HeartIconSolid className="h-5 w-5 text-error-500" />
                      : <HeartIcon className="h-5 w-5 text-surface-500 dark:text-surface-400" />}
                  </button>
                </div>
              )}

              {/* Señales de confianza — lista con regla, no icon-cards */}
              <div className="mt-8 border-t border-surface-200 dark:border-surface-800 divide-y divide-surface-200 dark:divide-surface-800">
                <div className="flex items-start gap-3 py-4">
                  <TruckIcon className="h-5 w-5 text-primary-600 dark:text-primary-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-surface-900 dark:text-white">Envío a todo el país</p>
                    <p className="text-xs text-surface-500 dark:text-surface-400">Cotizá el costo con tu código postal más abajo</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 py-4">
                  <ShieldCheckIcon className="h-5 w-5 text-primary-600 dark:text-primary-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-surface-900 dark:text-white">Compra protegida</p>
                    <p className="text-xs text-surface-500 dark:text-surface-400">Pagás de forma segura con MercadoPago o transferencia</p>
                  </div>
                </div>
              </div>

              {/* Meta: SKU + tags */}
              {(product.sku || (Array.isArray(product.tags) && product.tags.length > 0)) && (
                <div className="mt-4 text-xs text-surface-400 dark:text-surface-500 space-y-2">
                  {product.sku && <p>SKU · {product.sku}</p>}
                  {Array.isArray(product.tags) && product.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {product.tags.map((tag, index) => (
                        <span key={index} className="bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 px-2.5 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Secciones inferiores — columna continua con divisores editoriales */}
          <div className="mt-16 max-w-4xl space-y-14">

            {product.description && (
              <section>
                <SectionHeader>Descripción</SectionHeader>
                <div className="prose prose-sm dark:prose-invert max-w-none text-surface-700 dark:text-surface-300">
                  <p className="whitespace-pre-line leading-relaxed">{product.description}</p>
                </div>
              </section>
            )}

            {(product.dimensions || product.weight) && (
              <section>
                <SectionHeader>Especificaciones</SectionHeader>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-10">
                  {product.weight && (
                    <div className="flex justify-between py-3 border-b border-surface-200 dark:border-surface-800">
                      <dt className="text-sm text-surface-500 dark:text-surface-400">Peso</dt>
                      <dd className="text-sm font-medium text-surface-900 dark:text-white">{product.weight} kg</dd>
                    </div>
                  )}
                  {product.dimensions && (
                    <div className="flex justify-between py-3 border-b border-surface-200 dark:border-surface-800">
                      <dt className="text-sm text-surface-500 dark:text-surface-400">Dimensiones</dt>
                      <dd className="text-sm font-medium text-surface-900 dark:text-white">
                        {typeof product.dimensions === 'object'
                          ? `${product.dimensions.length ?? '-'} × ${product.dimensions.width ?? '-'} × ${product.dimensions.height ?? '-'} cm`
                          : product.dimensions}
                      </dd>
                    </div>
                  )}
                </dl>
              </section>
            )}

            {/* Cotizador de envío */}
            <section>
              <SectionHeader
                right={shippingQuoted && (
                  <button
                    onClick={() => { setShippingQuoted(false); setShippingQuotes([]) }}
                    className="text-[11px] text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 uppercase tracking-wider transition-colors flex-shrink-0"
                  >
                    Cambiar destino
                  </button>
                )}
              >
                Envío
              </SectionHeader>

              {!shippingQuoted ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="input-label" htmlFor="ship-cp">Código postal</label>
                      <input id="ship-cp" type="text" value={shippingPostalCode} onChange={(e) => setShippingPostalCode(e.target.value)} className="input" placeholder="1425" maxLength={8} />
                    </div>
                    <div>
                      <label className="input-label" htmlFor="ship-city">Ciudad</label>
                      <input id="ship-city" type="text" value={shippingCity} onChange={(e) => setShippingCity(e.target.value)} className="input" placeholder="Buenos Aires" />
                    </div>
                    <div>
                      <label className="input-label" htmlFor="ship-state">Provincia</label>
                      <input id="ship-state" type="text" value={shippingState} onChange={(e) => setShippingState(e.target.value)} className="input" placeholder="Buenos Aires" />
                    </div>
                  </div>

                  {shippingError && <p className="text-sm text-error-600 dark:text-error-400">{shippingError}</p>}

                  <button onClick={handleShippingQuote} disabled={shippingLoading} className="btn-primary">
                    {shippingLoading ? (
                      <><div className="loading-spinner h-4 w-4" /> Cotizando…</>
                    ) : (
                      <><MapPinIcon className="h-5 w-5" /> Ver opciones de envío</>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-surface-500 dark:text-surface-400">
                    Destino · {shippingCity}, {shippingState} (CP {shippingPostalCode})
                  </p>

                  {shippingQuotes.length === 0 ? (
                    <p className="text-sm text-surface-500 dark:text-surface-400 py-4 text-center border border-dashed border-surface-200 dark:border-surface-800 rounded-lg">
                      No hay opciones de envío disponibles para tu zona
                    </p>
                  ) : (
                    <div className="divide-y divide-surface-200 dark:divide-surface-800 border-t border-b border-surface-200 dark:border-surface-800">
                      {shippingQuotes.map((quote) => (
                        <div key={quote.id} className="flex items-center justify-between gap-4 py-4">
                          <div className="flex items-center gap-3">
                            {quote.type === 'pickup'
                              ? <BuildingStorefrontIcon className="h-5 w-5 text-success-600 dark:text-success-500 flex-shrink-0" />
                              : <TruckIcon className="h-5 w-5 text-primary-600 dark:text-primary-500 flex-shrink-0" />}
                            <div>
                              <p className="text-sm font-semibold text-surface-900 dark:text-white">{quote.name}</p>
                              {quote.estimatedDays && (
                                <p className="text-xs text-surface-500 dark:text-surface-400">
                                  Entrega estimada · {quote.estimatedDays} {quote.estimatedDays === 1 ? 'día hábil' : 'días hábiles'}
                                </p>
                              )}
                              {quote.description && <p className="text-xs text-surface-500 dark:text-surface-400">{quote.description}</p>}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            {quote.type === 'agreement' || quote.price === null ? (
                              <span className="text-sm text-accent-600 dark:text-accent-400 font-medium">A acordar</span>
                            ) : quote.price === 0 ? (
                              <span className="text-sm text-success-600 dark:text-success-500 font-semibold">Gratis</span>
                            ) : (
                              <span className="text-base font-bold text-surface-900 dark:text-white">${fmt(quote.price)}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Reseñas */}
            <section id="resenas" className="scroll-mt-24">
              <SectionHeader
                right={isAuthenticated && !showReviewForm && (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="inline-flex items-center gap-1.5 text-[11px] text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 uppercase tracking-wider transition-colors flex-shrink-0"
                  >
                    <PencilSquareIcon className="w-3.5 h-3.5" />
                    Escribir reseña
                  </button>
                )}
              >
                Reseñas
              </SectionHeader>

              {hasRealReviews && (
                <div className="mb-8 flex flex-col md:flex-row items-center gap-8">
                  <div className="text-center flex-shrink-0">
                    <div className="text-5xl font-bold text-surface-900 dark:text-white leading-none mb-2">
                      {reviewStats.averageRating.toFixed(1)}
                    </div>
                    <StarRating rating={reviewStats.averageRating} size="large" />
                    <p className="text-xs text-surface-500 dark:text-surface-400 mt-2">
                      {reviewStats.totalReviews} {reviewStats.totalReviews === 1 ? 'reseña' : 'reseñas'}
                    </p>
                  </div>

                  <div className="flex-1 w-full">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = reviewStats.distribution[stars] || 0
                      const percentage = reviewStats.totalReviews > 0 ? (count / reviewStats.totalReviews) * 100 : 0
                      return (
                        <div key={stars} className="flex items-center gap-3 mb-1.5">
                          <span className="text-xs text-surface-500 dark:text-surface-400 w-4 text-right tabular-nums">{stars}</span>
                          <div className="flex-1 h-2 bg-surface-200 dark:bg-surface-800 rounded-full overflow-hidden">
                            <div className="h-full bg-accent-400 dark:bg-accent-500 rounded-full" style={{ width: `${percentage}%` }} />
                          </div>
                          <span className="text-xs text-surface-400 w-8 text-right tabular-nums">{count}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {showReviewForm && (
                <div className="mb-8">
                  <ReviewForm
                    productId={product.id}
                    onSuccess={() => {
                      setShowReviewForm(false)
                      fetchReviewStats()
                      toast.success('Reseña enviada para aprobación')
                    }}
                    onCancel={() => setShowReviewForm(false)}
                  />
                </div>
              )}

              <ReviewList productId={product.id} />
            </section>
          </div>
        </div>
      </div>

      {/* Barra de compra fija en móvil */}
      {product.stock > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-surface-900/95 backdrop-blur-md border-t border-surface-200 dark:border-surface-800 px-4 py-3">
          <div className="flex items-center gap-3 max-w-lg mx-auto">
            <div className="flex-1 min-w-0">
              <p className="text-lg font-bold text-accent-600 dark:text-accent-400 leading-none">${fmt(getCurrentPrice())}</p>
              {hasDiscount() && (
                <p className="text-xs text-surface-400 line-through leading-none mt-0.5">${fmt(product.price)}</p>
              )}
            </div>
            <button onClick={handleAddToCart} disabled={addingToCart} className="btn-cta btn-lg flex-shrink-0">
              <ShoppingCartIcon className="h-5 w-5" />
              {addingToCart ? 'Agregando…' : 'Agregar'}
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default ProductDetail

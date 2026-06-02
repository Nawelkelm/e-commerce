import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { getProductImageUrl, PLACEHOLDER_IMAGE } from '../utils/imageHelpers'
import PageMeta from '../components/SEO/PageMeta'
import StarRating from '../components/StarRating'
import ReviewList from '../components/ReviewList'
import ReviewForm from '../components/ReviewForm'
import {
  ShoppingCartIcon,
  HeartIcon,
  StarIcon,
  TruckIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilSquareIcon,
  MapPinIcon,
  BuildingStorefrontIcon
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid, StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { toast } from 'react-hot-toast'

const ProductDetail = () => {
  const { slug } = useParams()
  const navigate = useNavigate()
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
      console.error('Error fetching product:', err)
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
    } catch (error) {
      console.error('Error fetching review stats:', error)
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
    } catch (error) {
      console.error('Error adding to cart:', error)
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

  const renderRating = (rating = 4.5) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        stars.push(<StarIconSolid key={i} className="h-5 w-5 text-yellow-400" />)
      } else if (i === Math.ceil(rating) && rating % 1 !== 0) {
        stars.push(<StarIcon key={i} className="h-5 w-5 text-yellow-400" />)
      } else {
        stars.push(<StarIcon key={i} className="h-5 w-5 text-gray-300" />)
      }
    }
    return stars
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Cargando producto...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Error al cargar el producto
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Link
            to="/productos"
            className="inline-flex items-center text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" />
            Volver a productos
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

  return (
    <>
      <PageMeta
        title={product.seoTitle || product.name}
        description={product.seoDescription || product.shortDescription || product.description}
        keywords={Array.isArray(product.tags) ? product.tags.join(', ') : product.tags || ''}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Breadcrumb */}
        <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <nav className="flex items-center space-x-2 text-sm">
              <Link to="/" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                Inicio
              </Link>
              <span className="text-gray-400">/</span>
              <Link to="/productos" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                Productos
              </Link>
              {product.Category && (
                <>
                  <span className="text-gray-400">/</span>
                  <Link 
                    to={`/productos?category=${product.Category.id}`}
                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    {product.Category.name}
                  </Link>
                </>
              )}
              <span className="text-gray-400">/</span>
              <span className="text-gray-900 dark:text-white font-medium truncate max-w-xs">
                {product.name}
              </span>
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Left Column - Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                <img
                  src={mainImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = PLACEHOLDER_IMAGE
                  }}
                />
                
                {/* Discount Badge */}
                {hasDiscount() && (
                  <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg">
                    -{getDiscountPercentage()}%
                  </div>
                )}

                {/* Stock Badge */}
                {product.stock === 0 ? (
                  <div className="absolute top-4 right-4 bg-gray-800 text-white text-sm font-semibold px-3 py-1 rounded-full shadow-lg">
                    Sin Stock
                  </div>
                ) : product.stock <= 5 ? (
                  <div className="absolute top-4 right-4 bg-orange-500 text-white text-sm font-semibold px-3 py-1 rounded-full shadow-lg">
                    ¡Últimas {product.stock} unidades!
                  </div>
                ) : null}

                {/* Image Navigation */}
                {product.images?.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 p-2 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-colors"
                    >
                      <ChevronLeftIcon className="h-6 w-6 text-gray-800 dark:text-white" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 p-2 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-700 transition-colors"
                    >
                      <ChevronRightIcon className="h-6 w-6 text-gray-800 dark:text-white" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {product.images?.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                        selectedImage === index
                          ? 'border-indigo-600 dark:border-indigo-400 ring-2 ring-indigo-200 dark:ring-indigo-800'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <img
                        src={getImageUrl(image)}
                        alt={`${product.name} - ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = PLACEHOLDER_IMAGE
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column - Product Info */}
            <div className="space-y-6">
              {/* Category */}
              {product.Category && (
                <Link
                  to={`/productos?category=${product.Category.id}`}
                  className="inline-block text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium"
                >
                  {product.Category.name}
                </Link>
              )}

              {/* Title */}
              <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center space-x-2">
                <div className="flex">{renderRating()}</div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  4.5 (124 reseñas)
                </span>
              </div>

              {/* Short Description */}
              {product.shortDescription && (
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  {product.shortDescription}
                </p>
              )}

              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-baseline space-x-3">
                  <span className="text-4xl font-bold text-gray-900 dark:text-white">
                    ${getCurrentPrice().toFixed(2)}
                  </span>
                  {hasDiscount() && (
                    <span className="text-2xl text-gray-500 dark:text-gray-400 line-through">
                      ${parseFloat(product.price).toFixed(2)}
                    </span>
                  )}
                </div>
                {hasDiscount() && (
                  <p className="text-green-600 dark:text-green-400 font-medium">
                    ¡Ahorrás ${(parseFloat(product.price) - parseFloat(product.salePrice)).toFixed(2)}!
                  </p>
                )}
              </div>

              {/* Stock Status */}
              <div className="flex items-center space-x-2">
                {product.stock > 0 ? (
                  <>
                    <CheckCircleIcon className="h-6 w-6 text-green-500" />
                    <span className="text-green-700 dark:text-green-400 font-medium">
                      En Stock ({product.stock} disponibles)
                    </span>
                  </>
                ) : (
                  <>
                    <XCircleIcon className="h-6 w-6 text-red-500" />
                    <span className="text-red-700 dark:text-red-400 font-medium">
                      Sin Stock
                    </span>
                  </>
                )}
              </div>

              {/* Quantity Selector & Add to Cart */}
              {product.stock > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <label className="text-gray-700 dark:text-gray-300 font-medium">
                      Cantidad:
                    </label>
                    <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg">
                      <button
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={quantity}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1
                          if (val >= 1 && val <= product.stock) {
                            setQuantity(val)
                          }
                        }}
                        className="w-16 text-center py-2 border-x border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none"
                        min="1"
                        max={product.stock}
                      />
                      <button
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= product.stock}
                        className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={handleAddToCart}
                      disabled={addingToCart}
                      className="flex-1 bg-indigo-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                    >
                      <ShoppingCartIcon className="h-6 w-6" />
                      <span>{addingToCart ? 'Agregando...' : 'Agregar al Carrito'}</span>
                    </button>
                    <button
                      onClick={toggleFavorite}
                      className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      {isFavorite ? (
                        <HeartIconSolid className="h-6 w-6 text-red-500" />
                      ) : (
                        <HeartIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Features */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
                <div className="flex items-start space-x-3">
                  <TruckIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Envío gratis</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">En compras superiores a $5000</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <ShieldCheckIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Garantía de calidad</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">30 días de garantía en todos los productos</p>
                  </div>
                </div>
              </div>

              {/* SKU and Category */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 text-sm text-gray-600 dark:text-gray-400 space-y-2">
                {product.sku && (
                  <p>
                    <span className="font-medium">SKU:</span> {product.sku}
                  </p>
                )}
                {Array.isArray(product.tags) && product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-3 py-1 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Description Section */}
          {product.description && (
            <div className="mt-12 bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Descripción del Producto
              </h2>
              <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300">
                <p className="whitespace-pre-line">{product.description}</p>
              </div>
            </div>
          )}

          {/* Specifications */}
          {(product.dimensions || product.weight || product.attributes) && (
            <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Especificaciones
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.weight && (
                  <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Peso:</span>
                    <span className="text-gray-900 dark:text-white">{product.weight} kg</span>
                  </div>
                )}
                {product.dimensions && (
                  <div className="flex justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                    <span className="font-medium text-gray-700 dark:text-gray-300">Dimensiones:</span>
                    <span className="text-gray-900 dark:text-white">
                      {typeof product.dimensions === 'object'
                        ? `${product.dimensions.length ?? '-'} × ${product.dimensions.width ?? '-'} × ${product.dimensions.height ?? '-'} cm`
                        : product.dimensions}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Cotizador de Envío */}
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <TruckIcon className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
              Cotizar Envío
            </h2>

            {!shippingQuoted ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Código Postal <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={shippingPostalCode}
                      onChange={(e) => setShippingPostalCode(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      placeholder="Ej: 1425"
                      maxLength={8}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Ciudad <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={shippingCity}
                      onChange={(e) => setShippingCity(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      placeholder="Ej: Buenos Aires"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Provincia <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={shippingState}
                      onChange={(e) => setShippingState(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      placeholder="Ej: Buenos Aires"
                    />
                  </div>
                </div>

                {shippingError && (
                  <p className="text-red-600 dark:text-red-400 text-sm">{shippingError}</p>
                )}

                <button
                  onClick={handleShippingQuote}
                  disabled={shippingLoading}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {shippingLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Cotizando...
                    </>
                  ) : (
                    <>
                      <MapPinIcon className="h-5 w-5" />
                      Ver opciones de envío
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Destino:</span> {shippingCity}, {shippingState} (CP: {shippingPostalCode})
                  </p>
                  <button
                    onClick={() => { setShippingQuoted(false); setShippingQuotes([]) }}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Cambiar
                  </button>
                </div>

                {shippingQuotes.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400 py-4 text-center">
                    No hay opciones de envío disponibles para tu zona
                  </p>
                ) : (
                  <div className="space-y-3">
                    {shippingQuotes.map((quote) => (
                      <div key={quote.id} className="flex items-center justify-between border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                          {quote.type === 'pickup' ? (
                            <BuildingStorefrontIcon className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                          ) : (
                            <TruckIcon className="h-6 w-6 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                          )}
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{quote.name}</p>
                            {quote.estimatedDays && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Entrega estimada: {quote.estimatedDays} {quote.estimatedDays === 1 ? 'día hábil' : 'días hábiles'}
                              </p>
                            )}
                            {quote.description && (
                              <p className="text-xs text-gray-500 dark:text-gray-400">{quote.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="font-bold text-lg text-gray-900 dark:text-white text-right ml-4">
                          {quote.type === 'agreement' || quote.price === null ? (
                            <span className="text-yellow-600 dark:text-yellow-400 text-sm">A acordar</span>
                          ) : quote.price === 0 ? (
                            <span className="text-green-600 dark:text-green-400">Gratis</span>
                          ) : (
                            `$${parseFloat(quote.price).toFixed(2)}`
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Reviews Section */}
          <div className="mt-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Reseñas de Clientes
                </h2>
                {isAuthenticated && !showReviewForm && (
                  <button
                    onClick={() => setShowReviewForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <PencilSquareIcon className="w-5 h-5" />
                    Escribir Reseña
                  </button>
                )}
              </div>

              {/* Review Stats Summary */}
              {reviewStats && reviewStats.totalReviews > 0 && (
                <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="flex flex-col md:flex-row items-center gap-6">
                    <div className="text-center">
                      <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">
                        {reviewStats.averageRating.toFixed(1)}
                      </div>
                      <StarRating rating={reviewStats.averageRating} size="large" />
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                        Basado en {reviewStats.totalReviews} {reviewStats.totalReviews === 1 ? 'reseña' : 'reseñas'}
                      </p>
                    </div>

                    <div className="flex-1 w-full">
                      {[5, 4, 3, 2, 1].map((stars) => {
                        const count = reviewStats.distribution[stars] || 0
                        const percentage = reviewStats.totalReviews > 0 
                          ? (count / reviewStats.totalReviews) * 100 
                          : 0

                        return (
                          <div key={stars} className="flex items-center gap-3 mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 w-16">
                              {stars} estrellas
                            </span>
                            <div className="flex-1 h-3 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-yellow-400"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-600 dark:text-gray-400 w-12 text-right">
                              {count}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Review Form */}
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

              {/* Reviews List */}
              <ReviewList productId={product.id} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ProductDetail
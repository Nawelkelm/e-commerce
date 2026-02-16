import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { HeartIcon, ShoppingCartIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useWishlistStore } from '../store/wishlistStore'
import { useAuthStore } from '../store/authStore'
import { cartAPI } from '../services/api'
import toast from 'react-hot-toast'
import { Helmet } from 'react-helmet-async'

const Wishlist = () => {
  const { wishlist, loadWishlist, removeFromWishlist, clearWishlist, isLoading } = useWishlistStore()
  const { addToCart } = useAuthStore()
  const navigate = useNavigate()
  const [addingToCart, setAddingToCart] = useState({})

  useEffect(() => {
    loadWishlist()
  }, [loadWishlist])

  const handleAddToCart = async (product) => {
    try {
      setAddingToCart(prev => ({ ...prev, [product.id]: true }))
      
      await cartAPI.addToCart({
        productId: product.id,
        quantity: 1
      })

      addToCart(product)
      toast.success('Producto agregado al carrito')
      
      // Optionally remove from wishlist after adding to cart
      // await removeFromWishlist(product.id)
    } catch (error) {
      const message = error.response?.data?.message || 'Error al agregar al carrito'
      toast.error(message)
    } finally {
      setAddingToCart(prev => ({ ...prev, [product.id]: false }))
    }
  }

  const handleRemove = async (productId) => {
    await removeFromWishlist(productId)
  }

  const handleClearAll = async () => {
    if (window.confirm('¿Estás seguro de que quieres vaciar tu lista de deseos?')) {
      await clearWishlist()
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!wishlist || wishlist.length === 0) {
    return (
      <>
        <Helmet>
          <title>Mi Lista de Deseos - E-Commerce</title>
        </Helmet>
        
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-12">
              <HeartIcon className="mx-auto h-24 w-24 text-gray-400 dark:text-gray-600" />
              <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                Tu lista de deseos está vacía
              </h2>
              <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
                Guarda tus productos favoritos aquí para comprarlos después
              </p>
              <div className="mt-8">
                <Link
                  to="/products"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Explorar productos
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Helmet>
        <title>Mi Lista de Deseos ({wishlist.length}) - E-Commerce</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
                <HeartIcon className="h-8 w-8 text-red-500 mr-3" />
                Mi Lista de Deseos
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-300">
                {wishlist.length} {wishlist.length === 1 ? 'producto' : 'productos'}
              </p>
            </div>
            
            {wishlist.length > 0 && (
              <button
                onClick={handleClearAll}
                className="flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors"
              >
                <TrashIcon className="h-5 w-5 mr-2" />
                Vaciar lista
              </button>
            )}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlist.map((item) => {
              const product = item.product
              if (!product) return null

              const primaryImage = product.images?.find(img => img.isPrimary) || product.images?.[0]
              const currentPrice = product.salePrice || product.price
              const hasDiscount = product.salePrice && product.salePrice < product.price

              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden relative group"
                >
                  {/* Remove Button */}
                  <button
                    onClick={() => handleRemove(product.id)}
                    className="absolute top-2 right-2 z-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-2 rounded-full text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-500 hover:bg-white dark:hover:bg-gray-700 transition-all opacity-0 group-hover:opacity-100"
                    title="Quitar de la lista"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>

                  {/* Product Image */}
                  <Link to={`/products/${product.slug}`} className="block">
                    <div className="aspect-square bg-gray-100 dark:bg-gray-700 overflow-hidden">
                      {primaryImage ? (
                        <img
                          src={primaryImage.url}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          Sin imagen
                        </div>
                      )}
                    </div>
                  </Link>

                  {/* Product Info */}
                  <div className="p-4">
                    <Link to={`/products/${product.slug}`}>
                      <h3 className="font-semibold text-gray-900 hover:text-indigo-600 line-clamp-2 mb-2">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Category */}
                    {product.category && (
                      <p className="text-xs text-gray-500 mb-2">
                        {product.category.name}
                      </p>
                    )}

                    {/* Price */}
                    <div className="mb-3">
                      <div className="flex items-baseline space-x-2">
                        <span className="text-xl font-bold text-gray-900">
                          {formatPrice(currentPrice)}
                        </span>
                        {hasDiscount && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>
                      {hasDiscount && (
                        <span className="inline-block mt-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                          {Math.round((1 - product.salePrice / product.price) * 100)}% OFF
                        </span>
                      )}
                    </div>

                    {/* Stock Status */}
                    {product.stock === 0 ? (
                      <p className="text-sm text-red-600 font-medium mb-3">
                        Sin stock
                      </p>
                    ) : product.stock < 5 ? (
                      <p className="text-sm text-orange-600 font-medium mb-3">
                        ¡Últimas {product.stock} unidades!
                      </p>
                    ) : (
                      <p className="text-sm text-green-600 font-medium mb-3">
                        En stock
                      </p>
                    )}

                    {/* Add to Cart Button */}
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0 || addingToCart[product.id]}
                      className={`
                        w-full flex items-center justify-center px-4 py-2 rounded-md font-medium
                        transition-colors
                        ${product.stock === 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }
                      `}
                    >
                      <ShoppingCartIcon className="h-5 w-5 mr-2" />
                      {addingToCart[product.id] 
                        ? 'Agregando...'
                        : product.stock === 0 
                        ? 'Sin stock' 
                        : 'Agregar al carrito'
                      }
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Continue Shopping */}
          <div className="mt-12 text-center">
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

export default Wishlist

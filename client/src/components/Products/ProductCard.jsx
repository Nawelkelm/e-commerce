import { Link } from 'react-router-dom'
import { ShoppingCartIcon, HeartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { useAuthStore } from '../../store/authStore'
import { getProductImageUrl, PLACEHOLDER_IMAGE } from '../../utils/imageHelpers'

const ProductCard = ({ product }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const { addToCart } = useAuthStore()

  const handleAddToCart = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (product.stock === 0) {
      toast.error('Producto sin stock')
      return
    }

    const primaryImage = getProductImageUrl(product)
    addToCart({
      id: product.id,
      name: product.name,
      price: product.salePrice || product.price,
      image: primaryImage,
      stock: product.stock,
      slug: product.slug
    })
    toast.success('Producto agregado al carrito')
  }

  const toggleFavorite = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFavorite(!isFavorite)
    toast.success(isFavorite ? 'Removido de favoritos' : 'Agregado a favoritos')
  }

  const price = parseFloat(product.price)
  const salePrice = product.salePrice ? parseFloat(product.salePrice) : null
  const hasDiscount = salePrice && salePrice < price
  const discountPercentage = hasDiscount
    ? Math.round(((price - salePrice) / price) * 100)
    : 0

  const primaryImage = getProductImageUrl(product)

  return (
    <div className="card-hover group relative overflow-hidden">
      <Link to={`/productos/${product.slug}`} className="block">
        {/* Image */}
        <div className="aspect-square overflow-hidden bg-surface-100 dark:bg-surface-800 dark:bg-surface-700 relative">
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-smooth"
            onError={(e) => { e.target.src = PLACEHOLDER_IMAGE }}
          />

          {/* Discount badge */}
          {hasDiscount && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">
              -{discountPercentage}%
            </div>
          )}

          {/* Out of stock overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-surface-900/60 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-white/90 dark:bg-surface-800/90 text-surface-900 dark:text-white text-sm font-semibold px-4 py-2 rounded-full">
                Sin Stock
              </span>
            </div>
          )}

          {/* Favorite button */}
          <button
            onClick={toggleFavorite}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/80 dark:bg-surface-800/80 backdrop-blur-sm text-surface-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-sm hover:shadow-md"
          >
            {isFavorite ? (
              <HeartIconSolid className="h-4 w-4 text-rose-500" />
            ) : (
              <HeartIcon className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Info */}
        <div className="p-4">
          {/* Category */}
          {product.Category && (
            <p className="text-caption font-medium uppercase tracking-wide text-primary-600 dark:text-primary-400 mb-1">
              {product.Category.name}
            </p>
          )}

          {/* Name */}
          <h3 className="text-sm font-medium text-surface-900 dark:text-white mb-1 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-lg font-bold text-surface-900 dark:text-white">
              ${hasDiscount ? salePrice.toLocaleString('es-AR') : price.toLocaleString('es-AR')}
            </span>
            {hasDiscount && (
              <span className="text-sm text-surface-400 line-through">
                ${price.toLocaleString('es-AR')}
              </span>
            )}
          </div>

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            disabled={isLoading || product.stock === 0}
            className="w-full btn-primary btn-sm opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300"
          >
            {isLoading ? (
              <div className="loading-spinner h-4 w-4 mx-auto" />
            ) : (
              <>
                <ShoppingCartIcon className="h-4 w-4" />
                Agregar al carrito
              </>
            )}
          </button>

          {/* Stock info - visible when button is hidden */}
          <p className="text-caption text-surface-400 text-center group-hover:opacity-0 transition-opacity duration-200 absolute bottom-4 left-0 right-0">
            {product.stock > 0 ? `${product.stock} disponibles` : 'Sin stock'}
          </p>
        </div>
      </Link>
    </div>
  )
}

export default ProductCard

import { Link } from 'react-router-dom'
import { ShoppingCartIcon, HeartIcon } from '@heroicons/react/24/outline'
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid'
import { useState } from 'react'
import { toast } from 'react-hot-toast'
import { cartAPI } from '../../services/api'
import { useCartStore } from '../../store'
import { getProductImageUrl, PLACEHOLDER_IMAGE } from '../../utils/imageHelpers'

const ProductCard = ({ product }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const { setCart } = useCartStore()

  const handleAddToCart = async (e) => {
    e.preventDefault() // Prevenir navegación del Link
    e.stopPropagation()
    
    if (product.stock === 0) {
      toast.error('Producto sin stock')
      return
    }

    setIsLoading(true)
    try {
      const response = await cartAPI.addToCart({
        productId: product.id,
        quantity: 1
      })
      
      setCart(response.data.cart)
      toast.success('Producto agregado al carrito')
    } catch (error) {
      console.error('Error adding to cart:', error)
      toast.error(error.response?.data?.message || 'Error al agregar al carrito')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleFavorite = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsFavorite(!isFavorite)
    // Aquí se podría implementar la lógica para guardar en favoritos
    toast.success(isFavorite ? 'Removido de favoritos' : 'Agregado a favoritos')
  }

  // Obtener precio y descuento
  const price = parseFloat(product.price)
  const salePrice = product.salePrice ? parseFloat(product.salePrice) : null
  const hasDiscount = salePrice && salePrice < price
  const discountPercentage = hasDiscount 
    ? Math.round(((price - salePrice) / price) * 100) 
    : 0

  const primaryImage = getProductImageUrl(product)

  return (
    <div className="group relative bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-300">
      <Link to={`/productos/${product.slug}`} className="block">
        {/* Imagen del producto */}
        <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = PLACEHOLDER_IMAGE
            }}
          />
          
          {/* Badge de descuento */}
          {hasDiscount && (
            <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              -{discountPercentage}%
            </div>
          )}
          
          {/* Badge sin stock */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <span className="text-white font-semibold">Sin Stock</span>
            </div>
          )}
        </div>

        {/* Información del producto */}
        <div className="p-4">
          {/* Categoría */}
          {product.Category && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              {product.Category.name}
            </p>
          )}

          {/* Nombre del producto */}
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {product.name}
          </h3>

          {/* Descripción corta */}
          {product.shortDescription && (
            <p className="text-xs text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
              {product.shortDescription}
            </p>
          )}

          {/* Precio */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                ${hasDiscount ? salePrice.toLocaleString() : price.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                  ${price.toLocaleString()}
                </span>
              )}
            </div>
            
            {/* Stock disponible */}
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Stock: {product.stock}
            </span>
          </div>
        </div>
      </Link>

      {/* Botones de acción */}
      <div className="absolute inset-x-0 bottom-0 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
        <div className="flex space-x-2">
          <button
            onClick={handleAddToCart}
            disabled={isLoading || product.stock === 0}
            className="flex-1 btn-primary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="loading-spinner mx-auto" />
            ) : (
              <>
                <ShoppingCartIcon className="h-4 w-4 mr-1" />
                Agregar
              </>
            )}
          </button>
          
          <button
            onClick={toggleFavorite}
            className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors"
          >
            {isFavorite ? (
              <HeartIconSolid className="h-5 w-5 text-red-500" />
            ) : (
              <HeartIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProductCard
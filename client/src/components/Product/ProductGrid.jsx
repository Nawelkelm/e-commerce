import React from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCartIcon, StarIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { useAuthStore } from '../../store/authStore'
import { getProductImageUrl, PLACEHOLDER_IMAGE } from '../../utils/imageHelpers'

const ProductGrid = ({ products }) => {
  const { addToCart } = useAuthStore()

  const handleAddToCart = (e, product) => {
    e.preventDefault()
    addToCart(product)
  }

  const renderRating = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[...Array(5)].map((_, index) => (
          index < Math.floor(rating) ? (
            <StarIconSolid key={index} className="h-4 w-4 text-yellow-400" />
          ) : (
            <StarIcon key={index} className="h-4 w-4 text-surface-300 dark:text-surface-600 dark:text-surface-400" />
          )
        ))}
        <span className="text-sm text-surface-600 dark:text-surface-400 ml-1">({rating})</span>
      </div>
    )
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-surface-600 dark:text-surface-400">No hay productos disponibles</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <Link
          key={product.id}
          to={`/productos/${product.slug}`}
          className="group relative bg-white dark:bg-surface-800 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden transform hover:-translate-y-2"
        >
          {/* Badge de oferta/nuevo */}
          {product.discount && (
            <div className="absolute top-4 left-4 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
              -{product.discount}%
            </div>
          )}
          {product.isNew && (
            <div className="absolute top-4 right-4 z-10 bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
              Nuevo
            </div>
          )}

          {/* Imagen del producto */}
          <div className="relative aspect-square overflow-hidden bg-surface-100 dark:bg-surface-800 dark:bg-surface-700">
            <img
              src={getProductImageUrl(product)}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                e.target.src = PLACEHOLDER_IMAGE
              }}
            />
            
            {/* Overlay con botón de agregar al carrito */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <button
                onClick={(e) => handleAddToCart(e, product)}
                className="bg-white dark:bg-surface-800 text-primary-600 px-6 py-3 rounded-full font-semibold flex items-center space-x-2 transform scale-90 group-hover:scale-100 transition-transform duration-300 shadow-lg hover:bg-surface-100 dark:bg-surface-800"
              >
                <ShoppingCartIcon className="h-5 w-5" />
                <span>Agregar</span>
              </button>
            </div>

            {/* Stock badge */}
            {product.stock && product.stock < 5 && product.stock > 0 && (
              <div className="absolute bottom-4 left-4 bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold">
                ¡Solo {product.stock} disponibles!
              </div>
            )}
            {product.stock === 0 && (
              <div className="absolute bottom-4 left-4 bg-surface-800 text-white px-2 py-1 rounded text-xs font-semibold">
                Agotado
              </div>
            )}
          </div>

          {/* Información del producto */}
          <div className="p-4">
            {/* Categoría */}
            {product.Category && (
              <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wide">
                {product.Category.name}
              </span>
            )}

            {/* Nombre */}
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white mt-1 mb-2 line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
              {product.name}
            </h3>

            {/* Rating */}
            {product.rating && renderRating(product.rating)}

            {/* Descripción corta */}
            {product.description && (
              <p className="text-sm text-surface-600 dark:text-surface-400 dark:text-surface-300 mt-2 line-clamp-2">
                {product.description}
              </p>
            )}

            {/* Precio */}
            <div className="mt-4 flex items-center justify-between">
              <div>
                {product.discount ? (
                  <div className="flex flex-col">
                    <span className="text-sm text-surface-500 dark:text-surface-400 line-through">
                      ${parseFloat(product.price).toFixed(2)}
                    </span>
                    <span className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                      ${(parseFloat(product.price) * (1 - product.discount / 100)).toFixed(2)}
                    </span>
                  </div>
                ) : (
                  <span className="text-2xl font-bold text-surface-900 dark:text-white">
                    ${parseFloat(product.price).toFixed(2)}
                  </span>
                )}
              </div>

              {/* Icono de carrito para mobile */}
              <button
                onClick={(e) => handleAddToCart(e, product)}
                className="lg:hidden bg-primary-600 text-white p-2 rounded-full hover:bg-primary-700 transition-colors"
                aria-label="Agregar al carrito"
              >
                <ShoppingCartIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

export default ProductGrid

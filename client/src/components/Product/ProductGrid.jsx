import React from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCartIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarSolid } from '@heroicons/react/24/solid'
import { useAuthStore } from '../../store/authStore'
import { getProductImageUrl, PLACEHOLDER_IMAGE } from '../../utils/imageHelpers'

const ProductGrid = ({ products }) => {
  const { addToCart } = useAuthStore()

  const handleAddToCart = (e, product) => {
    e.preventDefault()
    addToCart(product)
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-surface-500 dark:text-surface-400">No hay productos disponibles</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {products.map((product) => {
        const discountedPrice = product.discount
          ? parseFloat(product.price) * (1 - product.discount / 100)
          : null
        const displayPrice = discountedPrice ?? parseFloat(product.price)
        const outOfStock = product.stock === 0
        const lowStock = product.stock > 0 && product.stock < 5

        return (
          <Link
            key={product.id}
            to={`/productos/${product.slug}`}
            className="group relative card overflow-hidden flex flex-col transition-all duration-300 ease-smooth hover:shadow-card-hover hover:-translate-y-0.5"
          >
            {/* Badges */}
            {product.discount > 0 && (
              <span className="absolute top-3 left-3 z-10 bg-error-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                -{product.discount}%
              </span>
            )}
            {outOfStock && (
              <span className="absolute top-3 right-3 z-10 bg-surface-800/75 text-white text-[11px] font-medium px-2 py-0.5 rounded-full backdrop-blur-sm">
                Agotado
              </span>
            )}
            {!outOfStock && product.isNew && (
              <span className="absolute top-3 right-3 z-10 bg-primary-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                Nuevo
              </span>
            )}

            {/* Image container */}
            <div className="relative aspect-square overflow-hidden bg-surface-100 dark:bg-surface-700">
              <img
                src={getProductImageUrl(product)}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-smooth"
                onError={(e) => { e.target.src = PLACEHOLDER_IMAGE }}
              />

              {lowStock && (
                <div className="absolute bottom-2 left-2 bg-warning-500/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
                  ¡Solo {product.stock}!
                </div>
              )}

              {/* Slide-up add-to-cart panel */}
              <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-smooth">
                <button
                  onClick={(e) => handleAddToCart(e, product)}
                  disabled={outOfStock}
                  className="w-full py-3 bg-primary-600 hover:bg-primary-700 active:bg-primary-800 text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150"
                >
                  <ShoppingCartIcon className="h-4 w-4" />
                  {outOfStock ? 'Sin stock' : 'Agregar al carrito'}
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="p-4 flex flex-col flex-1 gap-1.5">
              {product.Category && (
                <span className="text-[11px] font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider border-l-2 border-primary-400 dark:border-primary-600 pl-1.5">
                  {product.Category.name}
                </span>
              )}

              <h3 className="text-sm font-semibold text-surface-900 dark:text-white leading-snug line-clamp-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200">
                {product.name}
              </h3>

              {product.rating > 0 && (
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <StarSolid
                      key={i}
                      className={`h-3 w-3 ${i < Math.floor(product.rating) ? 'text-accent-400' : 'text-surface-300 dark:text-surface-600'}`}
                    />
                  ))}
                  <span className="text-[11px] text-surface-400 ml-1">({product.rating})</span>
                </div>
              )}

              {/* Price row */}
              <div className="mt-auto pt-2.5 flex items-end justify-between">
                <div>
                  {product.discount > 0 ? (
                    <>
                      <span className="block text-xs text-surface-400 line-through leading-none mb-0.5">
                        ${parseFloat(product.price).toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                      </span>
                      <span className="text-lg font-bold text-accent-600 dark:text-accent-400 leading-none">
                        ${displayPrice.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                      </span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-accent-600 dark:text-accent-400 leading-none">
                      ${displayPrice.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                    </span>
                  )}
                </div>

                {/* Mobile fallback button (slide panel only shows on desktop hover) */}
                <button
                  onClick={(e) => handleAddToCart(e, product)}
                  disabled={outOfStock}
                  className="lg:hidden p-2 rounded-lg bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors disabled:opacity-40"
                  aria-label="Agregar al carrito"
                >
                  <ShoppingCartIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

export default ProductGrid

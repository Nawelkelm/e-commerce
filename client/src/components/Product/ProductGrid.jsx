import React from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCartIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarSolid } from '@heroicons/react/24/solid'
import { useAuthStore } from '../../store/authStore'
import { getProductImageUrl, PLACEHOLDER_IMAGE } from '../../utils/imageHelpers'
import { toast } from 'react-hot-toast'

const ProductGrid = ({ products }) => {
  const { addToCart } = useAuthStore()

  const handleAddToCart = (e, product) => {
    e.preventDefault()
    addToCart(product)
    toast.success(`${product.name} agregado al carrito`, {
      duration: 2000,
      position: 'bottom-right',
    })
  }

  if (!products || products.length === 0) {
    return (
      <div className="text-center py-16 text-surface-400">
        No hay productos disponibles
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product) => {
        const discountedPrice = product.discount
          ? parseFloat(product.price) * (1 - product.discount / 100)
          : null
        const displayPrice = discountedPrice ?? parseFloat(product.price)
        const savings = discountedPrice
          ? Math.round(parseFloat(product.price) - discountedPrice)
          : 0
        const outOfStock = product.stock === 0
        const lowStock = product.stock > 0 && product.stock < 5

        return (
          <Link
            key={product.id}
            to={`/productos/${product.slug}`}
            className="group relative bg-white dark:bg-surface-900 flex flex-col overflow-hidden rounded-xl border border-surface-200 dark:border-surface-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all duration-200"
          >
            {/* Badges */}
            {product.discount > 0 && (
              <span className="absolute top-3 left-3 z-10 bg-error-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide">
                -{product.discount}%
              </span>
            )}
            {outOfStock && (
              <span className="absolute top-3 right-3 z-10 bg-surface-900/70 text-white text-[10px] font-medium px-1.5 py-0.5 rounded backdrop-blur-sm">
                Agotado
              </span>
            )}
            {!outOfStock && !product.discount && product.isNew && (
              <span className="absolute top-3 right-3 z-10 bg-primary-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide">
                Nuevo
              </span>
            )}

            {/* Image */}
            <div className="relative aspect-square overflow-hidden bg-surface-100 dark:bg-surface-800">
              <img
                src={getProductImageUrl(product)}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500 ease-smooth"
                onError={(e) => { e.target.src = PLACEHOLDER_IMAGE }}
              />
              {lowStock && (
                <div className="absolute bottom-2 left-2 bg-warning-500/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
                  ¡Solo {product.stock}!
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4 flex flex-col flex-1 gap-1">
              {product.Category && (
                <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-[0.12em]">
                  {product.Category.name}
                </span>
              )}

              <h3 className="text-sm font-medium text-surface-900 dark:text-white leading-snug line-clamp-2 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors duration-200">
                {product.name}
              </h3>

              {product.rating > 0 && (
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <StarSolid key={i} className={`h-3 w-3 ${i < Math.floor(product.rating) ? 'text-accent-400' : 'text-surface-300 dark:text-surface-600'}`} />
                  ))}
                  <span className="text-[11px] text-surface-400 ml-1">({product.rating})</span>
                </div>
              )}

              {/* Price + CTA siempre visible */}
              <div className="mt-auto pt-3">
                <div className="flex items-end justify-between gap-2">
                  <div>
                    {product.discount > 0 ? (
                      <>
                        <span className="block text-[11px] text-surface-400 line-through leading-none mb-0.5">
                          ${parseFloat(product.price).toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                        </span>
                        <span className="text-xl font-bold text-accent-600 dark:text-accent-400 leading-none">
                          ${displayPrice.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                        </span>
                      </>
                    ) : (
                      <span className="text-xl font-bold text-accent-600 dark:text-accent-400 leading-none">
                        ${displayPrice.toLocaleString('es-AR', { minimumFractionDigits: 0 })}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => handleAddToCart(e, product)}
                    disabled={outOfStock}
                    className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-2 bg-accent-500 hover:bg-accent-600 active:bg-accent-700 text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="Agregar al carrito"
                  >
                    <ShoppingCartIcon className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Agregar</span>
                  </button>
                </div>
                {savings > 0 && (
                  <p className="text-[11px] text-success-600 dark:text-success-500 mt-1 font-medium">
                    Ahorrás ${savings.toLocaleString('es-AR')}
                  </p>
                )}
              </div>
            </div>
          </Link>
        )
      })}
    </div>
  )
}

export default ProductGrid

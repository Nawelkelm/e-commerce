import { Link } from 'react-router-dom'
import { ShoppingCartIcon } from '@heroicons/react/24/outline'
import { StarIcon as StarSolid } from '@heroicons/react/24/solid'
import { useAuthStore } from '../../store/authStore'
import { getProductImageUrl, PLACEHOLDER_IMAGE } from '../../utils/imageHelpers'
import { toast } from 'react-hot-toast'

/** Un producto se considera nuevo durante sus primeros 30 días. */
const DIAS_PARA_SER_NUEVO = 30

const pesos = (n) =>
  `$${Number(n).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

/**
 * Deriva del producto todo lo que la tarjeta necesita mostrar.
 *
 * Antes la tarjeta leía `product.discount`, `product.rating` e `isNew`, que no
 * existen: el modelo tiene `salePrice`, `averageRating` y `createdAt`. Por eso
 * el badge de oferta, el precio tachado y las estrellas no aparecían nunca,
 * aunque el código para mostrarlos ya estaba escrito.
 */
const derivarDatos = (product) => {
  const precio = parseFloat(product.price) || 0
  const oferta = product.salePrice != null ? parseFloat(product.salePrice) : null
  const enOferta = oferta != null && oferta > 0 && oferta < precio

  const rating = parseFloat(product.averageRating) || 0
  const reseñas = parseInt(product.totalReviews, 10) || 0

  const dias = product.createdAt
    ? (Date.now() - new Date(product.createdAt).getTime()) / 86400000
    : Infinity

  return {
    precio,
    precioFinal: enOferta ? oferta : precio,
    enOferta,
    porcentaje: enOferta ? Math.round(((precio - oferta) / precio) * 100) : 0,
    ahorro: enOferta ? Math.round(precio - oferta) : 0,
    rating,
    reseñas,
    tieneRating: rating > 0 && reseñas > 0,
    esNuevo: dias <= DIAS_PARA_SER_NUEVO,
    sinStock: product.stock === 0,
    pocoStock: product.stock > 0 && product.stock < 5
  }
}

const ProductGrid = ({ products }) => {
  const { addToCart } = useAuthStore()

  const handleAddToCart = (e, product) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart(product)
    toast.success(`${product.name} agregado al carrito`, {
      duration: 2000,
      position: 'bottom-right'
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
        const d = derivarDatos(product)

        return (
          // La tarjeta es un article y no un <a>: adentro hay un botón, y un
          // <button> dentro de un <a> es HTML inválido y rompe la navegación
          // por teclado. El enlace se estira sobre toda la tarjeta con ::after.
          <article
            key={product.id}
            className="group relative flex flex-col overflow-hidden rounded-xl border border-surface-200 bg-white transition-all duration-200 hover:border-primary-300 hover:shadow-md dark:border-surface-800 dark:bg-surface-900 dark:hover:border-primary-700"
          >
            {/* Badges */}
            {d.enOferta && (
              <span className="absolute left-3 top-3 z-20 rounded bg-error-500 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white">
                -{d.porcentaje}%
              </span>
            )}
            {d.sinStock && (
              <span className="absolute right-3 top-3 z-20 rounded bg-surface-900/70 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                Agotado
              </span>
            )}
            {!d.sinStock && !d.enOferta && d.esNuevo && (
              <span className="absolute right-3 top-3 z-20 rounded bg-primary-600 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white">
                Nuevo
              </span>
            )}

            {/* Imagen */}
            <div className="relative aspect-square overflow-hidden bg-surface-100 dark:bg-surface-800">
              <img
                src={getProductImageUrl(product)}
                alt={product.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 ease-smooth group-hover:scale-[1.03]"
                onError={(e) => { e.target.src = PLACEHOLDER_IMAGE }}
              />
              {d.pocoStock && (
                <div className="absolute bottom-2 left-2 rounded-full bg-warning-500/90 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
                  ¡Solo {product.stock}!
                </div>
              )}
            </div>

            {/* Información */}
            <div className="flex flex-1 flex-col gap-1 p-4">
              {product.Category && (
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-primary-600 dark:text-primary-400">
                  {product.Category.name}
                </span>
              )}

              <h3 className="line-clamp-2 text-sm font-medium leading-snug text-surface-900 transition-colors duration-200 group-hover:text-primary-700 dark:text-white dark:group-hover:text-primary-300">
                {/* El enlace se estira sobre la tarjeta entera: toda el área es
                    clickeable y el botón de agregar queda por encima. */}
                <Link
                  to={`/productos/${product.slug}`}
                  className="after:absolute after:inset-0 after:z-10 after:content-['']"
                >
                  {product.name}
                </Link>
              </h3>

              {d.tieneRating && (
                <div className="flex items-center gap-0.5" aria-label={`${d.rating} de 5 estrellas`}>
                  {[...Array(5)].map((_, i) => (
                    <StarSolid
                      key={i}
                      aria-hidden="true"
                      className={`h-3 w-3 ${
                        i < Math.round(d.rating)
                          ? 'text-accent-400'
                          : 'text-surface-300 dark:text-surface-600'
                      }`}
                    />
                  ))}
                  <span className="ml-1 text-[11px] text-surface-400">
                    {d.rating.toFixed(1)} ({d.reseñas})
                  </span>
                </div>
              )}

              {/* Precio y acción, siempre visibles: ocultarlos tras el hover
                  los vuelve inalcanzables en pantallas táctiles. */}
              <div className="mt-auto pt-3">
                <div className="flex items-end justify-between gap-2">
                  <div>
                    {d.enOferta && (
                      <span className="mb-0.5 block text-[11px] leading-none text-surface-400 line-through">
                        {pesos(d.precio)}
                      </span>
                    )}
                    <span className="text-xl font-bold leading-none text-surface-900 dark:text-white">
                      {pesos(d.precioFinal)}
                    </span>
                  </div>

                  <button
                    onClick={(e) => handleAddToCart(e, product)}
                    disabled={d.sinStock}
                    className="relative z-20 inline-flex flex-shrink-0 items-center gap-1.5 rounded-lg bg-accent-500 px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-accent-600 active:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label={`Agregar ${product.name} al carrito`}
                  >
                    <ShoppingCartIcon aria-hidden="true" className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Agregar</span>
                  </button>
                </div>

                {d.ahorro > 0 && (
                  <p className="mt-1 text-[11px] font-medium text-success-600 dark:text-success-500">
                    Ahorrás {pesos(d.ahorro)}
                  </p>
                )}
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )
}

export default ProductGrid

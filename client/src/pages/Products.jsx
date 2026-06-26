import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useAuthStore } from '../store/authStore'
import ProductFilters from '../components/Search/ProductFilters'
import PageMeta from '../components/SEO/PageMeta'
import { getProductImageUrl, PLACEHOLDER_IMAGE } from '../utils/imageHelpers'

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showFilters, setShowFilters] = useState(window.innerWidth >= 1024) // Mostrar en desktop
  
  // Filtros avanzados
  const [filters, setFilters] = useState({
    categories: [],
    minPrice: '',
    maxPrice: '',
    sortBy: 'createdAt',
    sortOrder: 'DESC',
    inStock: false,
    onSale: false,
    featured: false,
    search: ''
  })
  
  const { addToCart } = useAuthStore()

  // Cargar parámetro de búsqueda de la URL
  useEffect(() => {
    const searchFromUrl = searchParams.get('search')
    if (searchFromUrl) {
      setFilters(prev => ({ ...prev, search: searchFromUrl }))
    }
  }, [searchParams])

  useEffect(() => {
    fetchProducts()
  }, [filters])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      
      // Construir query params con filtros avanzados
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.categories.length > 0) params.append('categories', filters.categories.join(','))
      if (filters.minPrice) params.append('minPrice', filters.minPrice)
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice)
      if (filters.sortBy) params.append('sortBy', filters.sortBy)
      if (filters.sortOrder) params.append('sortOrder', filters.sortOrder)
      if (filters.inStock) params.append('inStock', 'true')
      if (filters.onSale) params.append('onSale', 'true')
      if (filters.featured) params.append('featured', 'true')
      
      const response = await fetch(`/api/products?${params}`)
      
      if (!response.ok) {
        throw new Error('Error al cargar productos')
      }
      
      const data = await response.json()
      setProducts(data.products || [])
    } catch (err) {
      setError(err.message)
      console.error('Error fetching products:', err)
    } finally {
      setLoading(false)
    }                                      
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    
    // Actualizar URL params
    const params = new URLSearchParams()
    if (newFilters.search) params.set('search', newFilters.search)
    if (newFilters.categories.length > 0) params.set('categories', newFilters.categories.join(','))
    if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice)
    if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice)
    setSearchParams(params)
  }

  const clearFilters = () => {
    const resetFilters = {
      categories: [],
      minPrice: '',
      maxPrice: '',
      sortBy: 'createdAt',
      sortOrder: 'DESC',
      inStock: false,
      onSale: false,
      featured: false,
      search: ''
    }
    setFilters(resetFilters)
    setSearchParams(new URLSearchParams())
  }

  const hasActiveFilters = () => {
    return filters.search || 
           filters.categories.length > 0 || 
           filters.minPrice || 
           filters.maxPrice || 
           filters.inStock || 
           filters.onSale || 
           filters.featured
  }

  const handleAddToCart = (e, product) => {
    e.preventDefault() // Prevenir navegación del Link
    e.stopPropagation() // Detener propagación del evento
    
    const imageUrl = getProductImageUrl(product)
    
    addToCart({
      id: product.id,
      name: product.name,
      price: parseFloat(product.price),
      image: imageUrl
    })
    
    // Mostrar notificación (opcional)
    alert(`${product.name} agregado al carrito!`)
  }

  if (loading) {
    return (
      <>
        <PageMeta 
          title="Productos" 
          description="Explora nuestro catálogo de productos. Encuentra lo que buscas al mejor precio."
          keywords="productos, catálogo, comprar online, tienda"
        />
        <div className="min-h-screen bg-surface-50 dark:bg-surface-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-surface-600 dark:text-surface-400">Cargando productos...</p>
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface-50 dark:bg-surface-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 text-lg mb-4">Error: {error}</p>
          <button 
            onClick={fetchProducts}
            className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600"
          >
            Intentar nuevamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <PageMeta 
        title="Productos" 
        description="Explora nuestro catálogo de productos. Encuentra lo que buscas al mejor precio."
        keywords="productos, catálogo, comprar online, tienda"
      />
      <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header con título y botón de filtros móvil */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <h1 className="text-3xl font-bold text-surface-900 dark:text-white mb-4 sm:mb-0">
              Productos {products.length > 0 && `(${products.length})`}
            </h1>
            
            {/* Botón toggle filtros solo en móvil */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden flex items-center space-x-2 px-4 py-2 bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-lg hover:bg-surface-50 dark:bg-surface-900 dark:hover:bg-surface-700 transition-colors"
            >
              <FunnelIcon className="h-5 w-5 text-surface-600 dark:text-surface-400 dark:text-surface-300" />
              <span className="text-surface-700 dark:text-surface-300">
                {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
              </span>
              {hasActiveFilters() && (
                <span className="ml-2 px-2 py-1 bg-primary-600 text-white text-xs rounded-full">
                  {filters.categories.length + 
                   (filters.minPrice || filters.maxPrice ? 1 : 0) +
                   (filters.inStock ? 1 : 0) +
                   (filters.onSale ? 1 : 0) +
                   (filters.featured ? 1 : 0)}
                </span>
              )}
            </button>
          </div>

          {/* Tags de filtros activos */}
          {hasActiveFilters() && (
            <div className="mb-6 flex flex-wrap gap-2">
              {filters.search && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-indigo-200">
                  Búsqueda: {filters.search}
                  <button
                    onClick={() => handleFilterChange({ ...filters, search: '' })}
                    className="ml-2 text-primary-600 dark:text-primary-300 hover:text-primary-800 dark:hover:text-indigo-100"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </span>
              )}
              {filters.onSale && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200">
                  En oferta
                </span>
              )}
              {filters.inStock && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                  En stock
                </span>
              )}
              {filters.featured && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">
                  Destacados
                </span>
              )}
              {(filters.minPrice || filters.maxPrice) && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                  Precio: {filters.minPrice && `$${filters.minPrice}`} {filters.minPrice && filters.maxPrice && '-'} {filters.maxPrice && `$${filters.maxPrice}`}
                </span>
              )}
              <button
                onClick={clearFilters}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-surface-200 dark:bg-surface-700 text-surface-700 dark:text-surface-300 hover:bg-surface-300 dark:hover:bg-surface-600"
              >
                Limpiar todos
              </button>
            </div>
          )}

          {/* Layout con sidebar de filtros y grid de productos */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar de filtros */}
            <div className={`${showFilters ? 'block' : 'hidden'} lg:block lg:col-span-1`}>
              <div className="sticky top-4">
                <ProductFilters 
                  onFilterChange={handleFilterChange}
                  currentFilters={filters}
                />
              </div>
            </div>

            {/* Grid de productos */}
            <div className="lg:col-span-3">
              {products.length === 0 ? (
                <div className="text-center py-12 bg-white dark:bg-surface-800 rounded-lg shadow">
                  <p className="text-surface-600 dark:text-surface-400 text-lg mb-2">
                    {hasActiveFilters() ? 'No se encontraron productos con estos filtros' : 'No hay productos disponibles'}
                  </p>
                  {hasActiveFilters() && (
                    <button
                      onClick={clearFilters}
                      className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                    >
                      Limpiar filtros
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {products.map((product) => {
              // Manejar formato antiguo (string) y nuevo (objeto)
              const getImageSrc = () => {
                if (!product.images || product.images.length === 0) return null
                
                const firstImage = product.images[0]
                if (typeof firstImage === 'object' && firstImage.url) {
                  return firstImage.url
                }
                if (typeof firstImage === 'string') {
                  // Si es una URL completa (http/https), devolverla tal cual
                  if (firstImage.startsWith('http://') || firstImage.startsWith('https://')) {
                    return firstImage
                  }
                  // Si ya tiene /uploads, devolverla tal cual
                  if (firstImage.startsWith('/uploads')) {
                    return firstImage
                  }
                  // Caso contrario, agregar /uploads/
                  return `/uploads/${firstImage}`
                }
                return null
              }
              
              const imageSrc = getImageSrc()
              
                  return (
                    <Link 
                      key={product.id} 
                      to={`/productos/${product.slug}`}
                      className="bg-white dark:bg-surface-800 rounded-lg shadow hover:shadow-lg transition-all duration-300 hover:-translate-y-1 block"
                    >
                      <div className="aspect-w-16 aspect-h-12 bg-surface-200 dark:bg-surface-700 rounded-t-lg overflow-hidden">
                        {imageSrc ? (
                          <img 
                            src={imageSrc} 
                            alt={product.name}
                            className="w-full h-48 object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none'
                              e.target.nextSibling.style.display = 'flex'
                            }}
                          />
                        ) : null}
                        <div className="w-full h-48 bg-surface-200 dark:bg-surface-700 flex items-center justify-center" style={{display: imageSrc ? 'none' : 'flex'}}>
                          <span className="text-surface-400">Sin imagen</span>
                        </div>
                      </div>
                    
                      <div className="p-6">
                        <h3 className="font-semibold text-lg mb-2 text-surface-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-surface-600 dark:text-surface-400 dark:text-surface-300 mb-4 line-clamp-2">{product.description}</p>
                        <div className="flex items-center justify-between mb-4">
                          {product.salePrice ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xl font-bold text-red-600 dark:text-red-400">
                                ${parseFloat(product.salePrice).toFixed(2)}
                              </span>
                              <span className="text-sm text-surface-500 dark:text-surface-400 line-through">
                                ${parseFloat(product.price).toFixed(2)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-xl font-bold text-green-600 dark:text-green-400">
                              ${parseFloat(product.price).toFixed(2)}
                            </span>
                          )}
                          <span className="text-sm text-surface-500 dark:text-surface-400">Stock: {product.stock}</span>
                        </div>
                        
                        <button
                          onClick={(e) => handleAddToCart(e, product)}
                          disabled={product.stock === 0}
                          className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
                            product.stock === 0
                              ? 'bg-surface-300 dark:bg-surface-600 text-surface-500 dark:text-surface-400 cursor-not-allowed'
                              : 'bg-primary-600 text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2'
                          }`}
                        >
                          {product.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
                        </button>
                      </div>
                    </Link>
                  )
                })}
              </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Products
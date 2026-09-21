import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { FunnelIcon, XMarkIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import ProductFilters from '../components/Search/ProductFilters'
import ProductGrid from '../components/Product/ProductGrid'
import PageMeta from '../components/SEO/PageMeta'

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showFilters, setShowFilters] = useState(window.innerWidth >= 1024)

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

  // Leer parámetros de URL al montar (búsqueda + categoría desde Home)
  useEffect(() => {
    const searchFromUrl = searchParams.get('search')
    const categoriaFromUrl = searchParams.get('categoria')
    const categoriesFromUrl = searchParams.get('categories')

    const updates = {}
    if (searchFromUrl) updates.search = searchFromUrl
    if (categoriaFromUrl) updates.categories = [categoriaFromUrl]
    else if (categoriesFromUrl) updates.categories = categoriesFromUrl.split(',')

    if (Object.keys(updates).length > 0) {
      setFilters(prev => ({ ...prev, ...updates }))
    }
  }, []) // solo al montar

  useEffect(() => { fetchProducts() }, [filters])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      setError(null)
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
      if (!response.ok) throw new Error('No se pudieron cargar los productos')
      const data = await response.json()
      setProducts(data.products || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters)
    const params = new URLSearchParams()
    if (newFilters.search) params.set('search', newFilters.search)
    if (newFilters.categories.length > 0) params.set('categories', newFilters.categories.join(','))
    if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice)
    if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice)
    setSearchParams(params)
  }

  const clearFilters = () => {
    const reset = {
      categories: [], minPrice: '', maxPrice: '',
      sortBy: 'createdAt', sortOrder: 'DESC',
      inStock: false, onSale: false, featured: false, search: ''
    }
    setFilters(reset)
    setSearchParams(new URLSearchParams())
  }

  const hasActiveFilters = () =>
    filters.search || filters.categories.length > 0 || filters.minPrice ||
    filters.maxPrice || filters.inStock || filters.onSale || filters.featured

  const activeFilterCount = () =>
    (filters.search ? 1 : 0) + filters.categories.length +
    (filters.minPrice || filters.maxPrice ? 1 : 0) +
    (filters.inStock ? 1 : 0) + (filters.onSale ? 1 : 0) + (filters.featured ? 1 : 0)

  return (
    <>
      <PageMeta
        title="Productos"
        description="Explorá nuestro catálogo de productos. Encontrá lo que buscás al mejor precio."
        keywords="productos, catálogo, comprar online, tienda"
      />
      <div className="min-h-screen bg-surface-50 dark:bg-surface-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Header editorial: label + regla + resultado count */}
          <div className="flex items-center gap-3 mb-8">
            <span className="text-[10px] font-bold text-primary-600 dark:text-primary-500 uppercase tracking-[0.2em] flex-shrink-0">
              Catálogo
            </span>
            <div className="flex-1 h-px bg-surface-200 dark:bg-surface-800" />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="lg:hidden inline-flex items-center gap-2 text-[10px] text-surface-500 hover:text-primary-600 dark:hover:text-primary-400 uppercase tracking-wider transition-colors"
            >
              <FunnelIcon className="h-3.5 w-3.5" />
              {showFilters ? 'Ocultar' : 'Filtros'}
              {hasActiveFilters() && (
                <span className="bg-primary-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {activeFilterCount()}
                </span>
              )}
            </button>
            {!loading && products.length > 0 && (
              <span className="text-[10px] text-surface-400 hidden md:block flex-shrink-0">
                {products.length} resultado{products.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Tags de filtros activos */}
          {hasActiveFilters() && (
            <div className="mb-6 flex flex-wrap gap-2">
              {filters.search && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-primary-50 dark:bg-primary-950/50 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800">
                  "{filters.search}"
                  <button onClick={() => handleFilterChange({ ...filters, search: '' })} className="hover:text-primary-900 dark:hover:text-white transition-colors">
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.onSale && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-error-50 dark:bg-error-950/30 text-error-700 dark:text-error-400 border border-error-200 dark:border-error-800/50">
                  En oferta
                  <button onClick={() => handleFilterChange({ ...filters, onSale: false })} className="hover:text-error-900 dark:hover:text-white transition-colors">
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.inStock && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-success-50 dark:bg-surface-800 text-success-700 dark:text-success-500 border border-success-200 dark:border-success-800/50">
                  En stock
                  <button onClick={() => handleFilterChange({ ...filters, inStock: false })} className="hover:text-success-900 dark:hover:text-white transition-colors">
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              )}
              {filters.featured && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-accent-50 dark:bg-accent-950/30 text-accent-700 dark:text-accent-400 border border-accent-200 dark:border-accent-800/50">
                  Destacados
                  <button onClick={() => handleFilterChange({ ...filters, featured: false })} className="hover:text-accent-900 dark:hover:text-white transition-colors">
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              )}
              {(filters.minPrice || filters.maxPrice) && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 border border-surface-200 dark:border-surface-700">
                  ${filters.minPrice || '0'} – ${filters.maxPrice || '∞'}
                  <button onClick={() => handleFilterChange({ ...filters, minPrice: '', maxPrice: '' })} className="hover:text-surface-900 dark:hover:text-white transition-colors">
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                </span>
              )}
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium text-surface-500 hover:text-error-600 border border-surface-200 dark:border-surface-700 hover:border-error-300 dark:hover:border-error-700 transition-colors"
              >
                <XMarkIcon className="h-3 w-3" />
                Limpiar todos
              </button>
            </div>
          )}

          {/* Layout: sidebar + grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

            {/* Sidebar de filtros */}
            <div className={`${showFilters ? 'block' : 'hidden'} lg:block lg:col-span-1`}>
              <div className="sticky top-24">
                <ProductFilters onFilterChange={handleFilterChange} currentFilters={filters} />
              </div>
            </div>

            {/* Grid de productos — usa ProductGrid para coherencia visual */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className="flex items-center justify-center py-24">
                  <div className="loading-spinner h-8 w-8" />
                </div>
              ) : error ? (
                <div className="card p-12 text-center">
                  <p className="text-sm text-error-600 dark:text-error-400 mb-4">{error}</p>
                  <button onClick={fetchProducts} className="btn-primary btn-sm">
                    Reintentar
                  </button>
                </div>
              ) : products.length === 0 ? (
                <div className="card p-12 text-center">
                  <MagnifyingGlassIcon className="h-12 w-12 mx-auto text-surface-300 dark:text-surface-600 mb-4" />
                  <p className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-1">
                    {hasActiveFilters() ? 'Sin resultados para estos filtros' : 'Sin productos disponibles'}
                  </p>
                  <p className="text-xs text-surface-400 mb-4">
                    {hasActiveFilters() ? 'Probá con otros criterios de búsqueda' : 'Volvé más tarde'}
                  </p>
                  {hasActiveFilters() && (
                    <button onClick={clearFilters} className="btn-primary btn-sm">
                      Limpiar filtros
                    </button>
                  )}
                </div>
              ) : (
                <ProductGrid products={products} />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Products

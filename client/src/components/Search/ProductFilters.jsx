import { useState, useEffect } from 'react'
import { FunnelIcon, XMarkIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline'
import { productsAPI } from '../../services/api'

const ProductFilters = ({ onFilterChange, currentFilters = {} }) => {
  const [filterOptions, setFilterOptions] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    availability: true,
    sort: true
  })
  const [localFilters, setLocalFilters] = useState({
    categories: [],
    minPrice: '',
    maxPrice: '',
    inStock: false,
    onSale: false,
    featured: false,
    sortBy: 'createdAt',
    sortOrder: 'DESC',
    ...currentFilters
  })

  useEffect(() => {
    loadFilterOptions()
  }, [])

  const loadFilterOptions = async () => {
    try {
      setIsLoading(true)
      const response = await productsAPI.getFilterOptions()
      setFilterOptions(response.data)
    } catch (error) {
      console.error('Error loading filter options:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const handleCategoryToggle = (categoryId) => {
    setLocalFilters(prev => {
      const categories = prev.categories.includes(categoryId)
        ? prev.categories.filter(id => id !== categoryId)
        : [...prev.categories, categoryId]
      
      const newFilters = { ...prev, categories }
      onFilterChange(newFilters)
      return newFilters
    })
  }

  const handlePriceChange = (field, value) => {
    setLocalFilters(prev => {
      const newFilters = { ...prev, [field]: value }
      return newFilters
    })
  }

  const applyPriceFilter = () => {
    onFilterChange(localFilters)
  }

  const handleToggleFilter = (filter) => {
    setLocalFilters(prev => {
      const newFilters = { ...prev, [filter]: !prev[filter] }
      onFilterChange(newFilters)
      return newFilters
    })
  }

  const handleSortChange = (sortValue) => {
    const [sortBy, sortOrder] = sortValue.split(':')
    setLocalFilters(prev => {
      const newFilters = { ...prev, sortBy, sortOrder }
      onFilterChange(newFilters)
      return newFilters
    })
  }

  const clearAllFilters = () => {
    const resetFilters = {
      categories: [],
      minPrice: '',
      maxPrice: '',
      inStock: false,
      onSale: false,
      featured: false,
      sortBy: 'createdAt',
      sortOrder: 'DESC'
    }
    setLocalFilters(resetFilters)
    onFilterChange(resetFilters)
  }

  const hasActiveFilters = () => {
    return localFilters.categories.length > 0 ||
           localFilters.minPrice ||
           localFilters.maxPrice ||
           localFilters.inStock ||
           localFilters.onSale ||
           localFilters.featured
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0
    }).format(price)
  }

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FunnelIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Filtros</h3>
          {hasActiveFilters() && (
            <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-xs font-medium rounded-full">
              {localFilters.categories.length + 
               (localFilters.minPrice || localFilters.maxPrice ? 1 : 0) +
               (localFilters.inStock ? 1 : 0) +
               (localFilters.onSale ? 1 : 0) +
               (localFilters.featured ? 1 : 0)}
            </span>
          )}
        </div>
        {hasActiveFilters() && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium"
          >
            Limpiar todo
          </button>
        )}
      </div>

      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {/* Categories */}
        <div className="p-4">
          <button
            onClick={() => toggleSection('categories')}
            className="w-full flex items-center justify-between text-left mb-3"
          >
            <span className="font-medium text-gray-900 dark:text-white">Categorías</span>
            {expandedSections.categories ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-500" />
            )}
          </button>

          {expandedSections.categories && filterOptions?.categories && (
            <div className="space-y-2">
              {filterOptions.categories.map(category => (
                <label
                  key={category.id}
                  className="flex items-center space-x-2 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={localFilters.categories.includes(category.id)}
                    onChange={() => handleCategoryToggle(category.id)}
                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex-1">
                    {category.name}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({category.count})
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Price Range */}
        <div className="p-4">
          <button
            onClick={() => toggleSection('price')}
            className="w-full flex items-center justify-between text-left mb-3"
          >
            <span className="font-medium text-gray-900 dark:text-white">Rango de precio</span>
            {expandedSections.price ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-500" />
            )}
          </button>

          {expandedSections.price && filterOptions?.priceRange && (
            <div className="space-y-3">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {formatPrice(filterOptions.priceRange.min)} - {formatPrice(filterOptions.priceRange.max)}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Mínimo
                  </label>
                  <input
                    type="number"
                    value={localFilters.minPrice}
                    onChange={(e) => handlePriceChange('minPrice', e.target.value)}
                    onBlur={applyPriceFilter}
                    placeholder="0"
                    min={filterOptions.priceRange.min}
                    max={filterOptions.priceRange.max}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                    Máximo
                  </label>
                  <input
                    type="number"
                    value={localFilters.maxPrice}
                    onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
                    onBlur={applyPriceFilter}
                    placeholder={filterOptions.priceRange.max.toString()}
                    min={filterOptions.priceRange.min}
                    max={filterOptions.priceRange.max}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <button
                onClick={applyPriceFilter}
                className="w-full px-3 py-1.5 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
              >
                Aplicar
              </button>
            </div>
          )}
        </div>

        {/* Availability & Special Filters */}
        <div className="p-4">
          <button
            onClick={() => toggleSection('availability')}
            className="w-full flex items-center justify-between text-left mb-3"
          >
            <span className="font-medium text-gray-900 dark:text-white">Disponibilidad</span>
            {expandedSections.availability ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-500" />
            )}
          </button>

          {expandedSections.availability && (
            <div className="space-y-2">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={localFilters.inStock}
                  onChange={() => handleToggleFilter('inStock')}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  Solo en stock
                </span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={localFilters.onSale}
                  onChange={() => handleToggleFilter('onSale')}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  En oferta
                </span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={localFilters.featured}
                  onChange={() => handleToggleFilter('featured')}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  Destacados
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Sort Order */}
        <div className="p-4">
          <button
            onClick={() => toggleSection('sort')}
            className="w-full flex items-center justify-between text-left mb-3"
          >
            <span className="font-medium text-gray-900 dark:text-white">Ordenar por</span>
            {expandedSections.sort ? (
              <ChevronUpIcon className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 text-gray-500" />
            )}
          </button>

          {expandedSections.sort && filterOptions?.sortOptions && (
            <select
              value={`${localFilters.sortBy}:${localFilters.sortOrder}`}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              {filterOptions.sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </div>
  )
}

export default ProductFilters

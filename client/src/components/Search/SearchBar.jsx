import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { productsAPI } from '../../services/api'
import { useDebounce } from '../../hooks/useDebounce'

const SearchBar = ({ 
  placeholder = 'Buscar productos...', 
  className = '',
  showButton = false,
  autoFocus = false 
}) => {
  const [query, setQuery] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const navigate = useNavigate()
  const wrapperRef = useRef(null)
  const inputRef = useRef(null)

  // Debounce search query
  const debouncedQuery = useDebounce(query, 300)

  // Load suggestions when query changes
  useEffect(() => {
    const loadSuggestions = async () => {
      if (debouncedQuery.trim().length < 2) {
        setSuggestions([])
        return
      }

      setIsLoading(true)
      try {
        const response = await productsAPI.searchSuggestions(debouncedQuery)
        setSuggestions(response.data.suggestions || [])
        setShowSuggestions(true)
      } catch (error) {
        console.error('Error loading suggestions:', error)
        setSuggestions([])
      } finally {
        setIsLoading(false)
      }
    }

    loadSuggestions()
  }, [debouncedQuery])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (query.trim()) {
      navigate(`/productos?search=${encodeURIComponent(query.trim())}`)
      setShowSuggestions(false)
      setQuery('')
      inputRef.current?.blur()
    }
  }

  const handleSelectSuggestion = (slug) => {
    navigate(`/productos/${slug}`)
    setShowSuggestions(false)
    setQuery('')
  }

  const handleClear = () => {
    setQuery('')
    setSuggestions([])
    setShowSuggestions(false)
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelectSuggestion(suggestions[selectedIndex].slug)
        } else {
          handleSubmit(e)
        }
        break
      case 'Escape':
        setShowSuggestions(false)
        setSelectedIndex(-1)
        break
      default:
        break
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price)
  }

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        {/* Search Icon */}
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <MagnifyingGlassIcon className="h-5 w-5" />
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true)
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className="
            w-full pl-10 pr-10 py-2.5 
            border border-gray-300 rounded-lg
            bg-white dark:bg-gray-800
            text-gray-900 dark:text-white
            placeholder-gray-500 dark:placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
            transition-all duration-200
          "
        />

        {/* Clear Button */}
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        )}

        {/* Submit Button (optional) */}
        {showButton && (
          <button
            type="submit"
            className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Buscar
          </button>
        )}
      </form>

      {/* Suggestions Dropdown */}
      {showSuggestions && (query.trim().length >= 2) && (
        <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-sm">Buscando...</p>
            </div>
          ) : suggestions.length > 0 ? (
            <>
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-200 dark:border-gray-700">
                {suggestions.length} {suggestions.length === 1 ? 'resultado' : 'resultados'}
              </div>
              <ul>
                {suggestions.map((product, index) => (
                  <li key={product.id}>
                    <button
                      onClick={() => handleSelectSuggestion(product.slug)}
                      className={`
                        w-full px-4 py-3 flex items-center space-x-3
                        hover:bg-gray-50 dark:hover:bg-gray-700
                        transition-colors duration-150
                        ${index === selectedIndex ? 'bg-gray-50 dark:bg-gray-700' : ''}
                        ${index !== suggestions.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : ''}
                      `}
                    >
                      {/* Product Image */}
                      <div className="flex-shrink-0 w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <MagnifyingGlassIcon className="h-6 w-6" />
                          </div>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 text-left min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">
                          {product.name}
                        </p>
                        <div className="flex items-center space-x-2 text-sm">
                          {product.category && (
                            <span className="text-gray-500 dark:text-gray-400">
                              {product.category}
                            </span>
                          )}
                          {!product.inStock && (
                            <span className="text-red-600 dark:text-red-400 font-medium">
                              Sin stock
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Price */}
                      <div className="flex-shrink-0 text-right">
                        <p className="font-bold text-indigo-600 dark:text-indigo-400">
                          {formatPrice(product.price)}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>

              {/* View All Results */}
              <div className="border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleSubmit}
                  className="w-full px-4 py-3 text-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Ver todos los resultados para "{query}"
                </button>
              </div>
            </>
          ) : (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              <MagnifyingGlassIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No se encontraron resultados para "{query}"</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchBar

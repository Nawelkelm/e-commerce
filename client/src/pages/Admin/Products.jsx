import React, { useState, useEffect } from 'react'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  PhotoIcon, 
  XMarkIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  SparklesIcon,
  TagIcon,
  CubeIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../../store/authStore'
import ProductImportExport from '../../components/Admin/ProductImportExport'
import LowStockAlert from '../../components/Admin/LowStockAlert'

const Products = () => {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [suppliers, setSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)
  const [uploading, setUploading] = useState(false)
  
  // Estados para búsqueda y filtros
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    stock: '',
    featured: ''
  })
  const [sortConfig, setSortConfig] = useState({
    key: 'createdAt',
    direction: 'desc'
  })
  const [showFilters, setShowFilters] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    price: '',
    comparePrice: '',
    costPrice: '',
    sku: '',
    barcode: '',
    stock: '',
    minStock: '',
    weight: '',
    dimensions: '',
    categoryId: '',
    supplierId: '',
    isOwnProduction: false,
    isActive: true,
    isFeatured: false,
    tags: '',
    seoTitle: '',
    seoDescription: ''
  })
  const [images, setImages] = useState([]) // Nuevas imágenes a subir
  const [imagePreview, setImagePreview] = useState([]) // Previews de nuevas imágenes
  const [existingImages, setExistingImages] = useState([]) // Imágenes ya guardadas en el servidor
  const { token } = useAuthStore()

  useEffect(() => {
    fetchProducts()
    fetchCategories()
    fetchSuppliers()
  }, [])

  // Efecto para filtrar y ordenar productos
  useEffect(() => {
    filterAndSortProducts()
  }, [products, searchQuery, filters, sortConfig])

  const filterAndSortProducts = () => {
    let filtered = [...products]

    // Búsqueda por texto
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(query) ||
        product.sku?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query) ||
        product.Category?.name?.toLowerCase().includes(query)
      )
    }

    // Filtro por categoría
    if (filters.category) {
      filtered = filtered.filter(product => product.categoryId === filters.category)
    }

    // Filtro por estado
    if (filters.status !== '') {
      const isActive = filters.status === 'true'
      filtered = filtered.filter(product => product.isActive === isActive)
    }

    // Filtro por stock
    if (filters.stock) {
      if (filters.stock === 'low') {
        filtered = filtered.filter(product => product.stock <= (product.lowStockThreshold || 10))
      } else if (filters.stock === 'out') {
        filtered = filtered.filter(product => product.stock === 0)
      } else if (filters.stock === 'available') {
        filtered = filtered.filter(product => product.stock > 0)
      }
    }

    // Filtro por destacado
    if (filters.featured !== '') {
      const isFeatured = filters.featured === 'true'
      filtered = filtered.filter(product => product.isFeatured === isFeatured)
    }

    // Ordenamiento
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key]
        let bValue = b[sortConfig.key]

        // Manejo especial para categorías
        if (sortConfig.key === 'category') {
          aValue = a.Category?.name || ''
          bValue = b.Category?.name || ''
        }

        // Conversión a números si es necesario
        if (sortConfig.key === 'price' || sortConfig.key === 'stock') {
          aValue = parseFloat(aValue) || 0
          bValue = parseFloat(bValue) || 0
        }

        // Conversión a strings para comparación
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase()
          bValue = bValue.toLowerCase()
        }

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1
        }
        return 0
      })
    }

    setFilteredProducts(filtered)
  }

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const clearFilters = () => {
    setSearchQuery('')
    setFilters({
      category: '',
      status: '',
      stock: '',
      featured: ''
    })
    setSortConfig({
      key: 'createdAt',
      direction: 'desc'
    })
  }

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/products', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
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

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/admin/categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setCategories(data || [])
      }
    } catch (err) {
      console.error('Error fetching categories:', err)
    }
  }

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/suppliers?isActive=true', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setSuppliers(data || [])
      }
    } catch (err) {
      console.error('Error fetching suppliers:', err)
    }
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    setImages(files)
    
    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file))
    setImagePreview(previews)
  }

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index)
    const newPreviews = imagePreview.filter((_, i) => i !== index)
    setImages(newImages)
    setImagePreview(newPreviews)
  }

  const removeExistingImage = (index) => {
    const newExistingImages = existingImages.filter((_, i) => i !== index)
    setExistingImages(newExistingImages)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      shortDescription: '',
      price: '',
      comparePrice: '',
      costPrice: '',
      sku: '',
      barcode: '',
      stock: '',
      minStock: '',
      weight: '',
      dimensions: '',
      categoryId: '',
      supplierId: '',
      isOwnProduction: false,
      isActive: true,
      isFeatured: false,
      tags: '',
      seoTitle: '',
      seoDescription: ''
    })
    setImages([])
    setImagePreview([])
    setExistingImages([])
    setEditingProduct(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)
    
    try {
      const submitData = new FormData()
      
      // Add form fields
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '') {
          submitData.append(key, formData[key])
        }
      })
      
      // Add existing images to keep (solo al editar)
      if (editingProduct && existingImages.length > 0) {
        submitData.append('existingImages', JSON.stringify(existingImages))
      }
      
      // Add new images to upload
      images.forEach(image => {
        submitData.append('images', image)
      })
      
      const url = editingProduct 
        ? `/api/admin/products/${editingProduct.id}`
        : '/api/admin/products'
      
      const method = editingProduct ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: submitData
      })

      if (response.ok) {
        await fetchProducts()
        setShowModal(false)
        resetForm()
        alert(editingProduct ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente')
      } else {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al guardar producto')
      }
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name || '',
      description: product.description || '',
      shortDescription: product.shortDescription || '',
      price: product.price || '',
      comparePrice: product.comparePrice || '',
      costPrice: product.costPrice || '',
      sku: product.sku || '',
      barcode: product.barcode || '',
      stock: product.stock || '',
      minStock: product.minStock || '',
      weight: product.weight || '',
      dimensions: product.dimensions || '',
      categoryId: product.categoryId || '',
      supplierId: product.supplierId || '',
      isOwnProduction: product.isOwnProduction || false,
      isActive: product.isActive !== false,
      isFeatured: product.isFeatured || false,
      tags: product.tags || '',
      seoTitle: product.seoTitle || '',
      seoDescription: product.seoDescription || ''
    })
    
    // Cargar imágenes existentes del producto
    setExistingImages(product.images || [])
    
    // Limpiar nuevas imágenes
    setImages([])
    setImagePreview([])
    
    setShowModal(true)
  }

  const handleDeleteProduct = async (productId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        setProducts(products.filter(p => p.id !== productId))
        alert('Producto eliminado exitosamente')
      } else {
        throw new Error('Error al eliminar producto')
      }
    } catch (err) {
      alert('Error al eliminar producto: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 text-lg mb-4">Error: {error}</p>
        <button 
          onClick={fetchProducts}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Intentar nuevamente
        </button>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Header con gradiente */}
      <div className="mb-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                <CubeIcon className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                Gestión de Productos
              </h1>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 ml-14">
              Administra tu inventario completo en un solo lugar
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => {
                resetForm()
                setShowModal(true)
              }}
              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200 hover:shadow-xl hover:scale-105"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Nuevo Producto
            </button>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      <LowStockAlert />

      {/* Import/Export Actions */}
      <div className="mb-6">
        <ProductImportExport onImportSuccess={fetchProducts} />
      </div>

      {/* Barra de búsqueda y filtros - Rediseñada */}
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Barra de búsqueda mejorada */}
          <div className="flex-1">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, SKU, descripción o categoría..."
                className="block w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg leading-5 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white dark:focus:bg-gray-600 transition-all duration-200 sm:text-sm"
              />
            </div>
          </div>

          {/* Botón de filtros mejorado */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center px-6 py-3 border-2 rounded-lg shadow-sm text-sm font-medium transition-all duration-200 ${
              showFilters || Object.values(filters).some(v => v)
                ? 'border-indigo-500 text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30'
                : 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600'
            }`}
          >
            <FunnelIcon className="h-5 w-5 mr-2" />
            Filtros
            {(filters.category || filters.status !== '' || filters.stock || filters.featured !== '') && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                Activos
              </span>
            )}
          </button>

          {/* Botón limpiar filtros */}
          {(searchQuery || filters.category || filters.status !== '' || filters.stock || filters.featured !== '') && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              <XMarkIcon className="h-5 w-5 mr-2" />
              Limpiar
            </button>
          )}
        </div>

        {/* Panel de filtros expandible */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Filtro por categoría */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Categoría
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Todas las categorías</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro por estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Estado
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Todos</option>
                  <option value="true">Activos</option>
                  <option value="false">Inactivos</option>
                </select>
              </div>

              {/* Filtro por stock */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Stock
                </label>
                <select
                  value={filters.stock}
                  onChange={(e) => setFilters({ ...filters, stock: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Todos</option>
                  <option value="available">Disponible</option>
                  <option value="low">Stock bajo</option>
                  <option value="out">Sin stock</option>
                </select>
              </div>

              {/* Filtro por destacado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Destacados
                </label>
                <select
                  value={filters.featured}
                  onChange={(e) => setFilters({ ...filters, featured: e.target.value })}
                  className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="">Todos</option>
                  <option value="true">Destacados</option>
                  <option value="false">No destacados</option>
                </select>
              </div>
            </div>

            {/* Contador de resultados mejorado */}
            <div className="mt-4 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg px-4 py-3 border border-indigo-100 dark:border-indigo-800">
              <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <CubeIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Mostrando <span className="font-bold text-indigo-600 dark:text-indigo-400">{filteredProducts.length}</span> de <span className="font-semibold">{products.length}</span> productos
              </div>
              {filteredProducts.length < products.length && (
                <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                  {products.length - filteredProducts.length} ocultos por filtros
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Tabla mejorada */}
      <div className="bg-white dark:bg-gray-800 shadow-xl rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800">
            <tr>
              <th 
                onClick={() => handleSort('name')}
                className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  Producto
                  <ArrowsUpDownIcon className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                </div>
              </th>
              <th 
                onClick={() => handleSort('category')}
                className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  Categoría
                  <ArrowsUpDownIcon className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Proveedor
              </th>
              <th 
                onClick={() => handleSort('price')}
                className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  Precio
                  <ArrowsUpDownIcon className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                </div>
              </th>
              <th 
                onClick={() => handleSort('stock')}
                className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  Stock
                  <ArrowsUpDownIcon className="h-4 w-4 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                </div>
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    <span className="ml-3 text-gray-600 dark:text-gray-400">Cargando productos...</span>
                  </div>
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center">
                  <div className="text-gray-500 dark:text-gray-400">
                    {searchQuery || filters.category || filters.status !== '' || filters.stock || filters.featured !== '' 
                      ? 'No se encontraron productos con los filtros aplicados'
                      : 'No hay productos registrados'}
                  </div>
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-14 w-14">
                      <img
                        className="h-14 w-14 rounded-xl object-cover shadow-sm ring-2 ring-gray-100 dark:ring-gray-700"
                        src={
                          product.images?.[0] 
                            ? (typeof product.images[0] === 'string' 
                                ? (product.images[0].startsWith('http://') || product.images[0].startsWith('https://') 
                                    ? product.images[0] 
                                    : `/api${product.images[0].startsWith('/uploads') ? product.images[0] : '/uploads/' + product.images[0]}`)
                                : product.images[0].url)
                            : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60"%3E%3Crect fill="%23ddd" width="60" height="60"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle" font-size="12"%3ESin imagen%3C/text%3E%3C/svg%3E'
                        }
                        alt={product.name}
                        onError={(e) => {
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="60" height="60"%3E%3Crect fill="%23ddd" width="60" height="60"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle" font-size="12"%3ESin imagen%3C/text%3E%3C/svg%3E'
                        }}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                          {product.name}
                        </div>
                        {product.isFeatured && (
                          <SparklesIcon className="h-4 w-4 text-yellow-500" title="Destacado" />
                        )}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <TagIcon className="h-3 w-3 inline mr-1" />
                        SKU: {product.sku}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300">
                    {product.Category?.name || 'Sin categoría'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {product.isOwnProduction ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      Producción Propia
                    </span>
                  ) : product.supplier ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                      {product.supplier.name}
                    </span>
                  ) : (
                    <span className="text-xs text-gray-400">Sin proveedor</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-bold text-gray-900 dark:text-gray-100">
                    ${parseFloat(product.price).toFixed(2)}
                  </div>
                  {product.comparePrice && parseFloat(product.comparePrice) > parseFloat(product.price) && (
                    <div className="text-xs text-gray-400 line-through">
                      ${parseFloat(product.comparePrice).toFixed(2)}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      product.stock <= 0 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                        : product.stock <= product.minStock
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                        : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    }`}>
                      {product.stock} unidades
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full ${
                      product.isActive
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full mr-2 ${product.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    {product.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex space-x-2 justify-end">
                    <button
                      onClick={() => handleEdit(product)}
                      className="p-2 text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                      title="Editar producto"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                      title="Eliminar producto"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700 sm:px-6 mt-4 rounded-lg">
        <div className="flex-1 flex justify-between sm:hidden">
          <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
            Anterior
          </button>
          <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
            Siguiente
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Mostrando <span className="font-medium">1</span> a{' '}
              <span className="font-medium">3</span> de{' '}
              <span className="font-medium">3</span> productos
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                Anterior
              </button>
              <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 bg-indigo-50 dark:bg-indigo-900 text-sm font-medium text-indigo-600 dark:text-indigo-300">
                1
              </button>
              <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600">
                Siguiente
              </button>
            </nav>
          </div>
        </div>
      </div>

      {/* Modal de Crear/Editar Producto - Rediseñado */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-900/75 dark:bg-black/85 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-start justify-center p-4">
          <div className="relative w-full max-w-5xl my-8">
            {/* Header del Modal */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl px-6 py-5 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    {editingProduct ? (
                      <PencilIcon className="h-6 w-6 text-white" />
                    ) : (
                      <PlusIcon className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Contenido del Modal */}
            <div className="bg-white dark:bg-gray-800 rounded-b-2xl shadow-2xl">
              <form onSubmit={handleSubmit} className="p-6 space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Información Básica */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 pb-3 border-b-2 border-indigo-100 dark:border-indigo-900">
                      <CubeIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Información Básica</h4>
                    </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Nombre del Producto <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="block w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      placeholder="Ej: Laptop Dell Inspiron 15"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Descripción Corta</label>
                    <input
                      type="text"
                      value={formData.shortDescription}
                      onChange={(e) => setFormData({...formData, shortDescription: e.target.value})}
                      className="block w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                      placeholder="Descripción breve para listados"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Descripción Completa</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={4}
                      className="block w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
                      placeholder="Descripción detallada del producto..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Categoría</label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                      className="block w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                    >
                      <option value="">Seleccionar categoría</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Proveedor */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Proveedor</label>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
                        <input
                          type="checkbox"
                          id="isOwnProduction"
                          checked={formData.isOwnProduction}
                          onChange={(e) => setFormData({
                            ...formData, 
                            isOwnProduction: e.target.checked,
                            supplierId: e.target.checked ? '' : formData.supplierId
                          })}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor="isOwnProduction" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                          Producción Propia
                        </label>
                      </div>
                      
                      {!formData.isOwnProduction && (
                        <select
                          value={formData.supplierId}
                          onChange={(e) => setFormData({...formData, supplierId: e.target.value})}
                          className="block w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        >
                          <option value="">Seleccionar proveedor</option>
                          {suppliers.map(supplier => (
                            <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </div>
                </div>

                {/* Precios y Stock */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-3 border-b-2 border-purple-100 dark:border-purple-900">
                    <TagIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Precios y Stock</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Precio (ARS) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-semibold">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({...formData, price: e.target.value})}
                          className="block w-full pl-8 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                          placeholder="0.00"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Precio Comparación</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400 font-semibold">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.comparePrice}
                          onChange={(e) => setFormData({...formData, comparePrice: e.target.value})}
                          className="block w-full pl-8 pr-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Stock <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({...formData, stock: e.target.value})}
                        className="block w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        placeholder="0"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Stock Mínimo</label>
                      <input
                        type="number"
                        value={formData.minStock}
                        onChange={(e) => setFormData({...formData, minStock: e.target.value})}
                        className="block w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">SKU</label>
                      <input
                        type="text"
                        value={formData.sku}
                        onChange={(e) => setFormData({...formData, sku: e.target.value})}
                        className="block w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        placeholder="SKU-001"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Código de Barras</label>
                      <input
                        type="text"
                        value={formData.barcode}
                        onChange={(e) => setFormData({...formData, barcode: e.target.value})}
                        className="block w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                        placeholder="7798123456789"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                        className="h-5 w-5 text-indigo-600 focus:ring-2 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded transition-all"
                      />
                      <label className="ml-3 block text-sm font-medium text-gray-900 dark:text-gray-100">Producto activo</label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.isFeatured}
                        onChange={(e) => setFormData({...formData, isFeatured: e.target.checked})}
                        className="h-5 w-5 text-indigo-600 focus:ring-2 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded transition-all"
                      />
                      <label className="ml-3 flex items-center text-sm font-medium text-gray-900 dark:text-gray-100">
                        <SparklesIcon className="h-4 w-4 text-yellow-500 mr-1" />
                        Producto destacado
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* Imágenes */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-3 border-b-2 border-indigo-100 dark:border-indigo-900">
                  <PhotoIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Imágenes del Producto</h4>
                </div>
                
                {/* Imágenes existentes (al editar) */}
                {existingImages.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Imágenes actuales:</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {existingImages.map((image, index) => (
                        <div key={`existing-${index}`} className="relative group">
                          <img
                            src={image.url}
                            alt={image.alt || `Imagen ${index + 1}`}
                            className="h-28 w-full object-cover rounded-xl border-2 border-indigo-200 dark:border-indigo-700 shadow-md group-hover:shadow-xl transition-all"
                          />
                          {image.isPrimary && (
                            <span className="absolute top-2 left-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-semibold px-2.5 py-1 rounded-lg shadow-lg">
                              ★ Principal
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => removeExistingImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-lg transition-all hover:scale-110"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="border-2 border-dashed border-indigo-300 dark:border-indigo-700 rounded-xl p-8 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all">
                  <div className="text-center">
                    <div className="mx-auto h-16 w-16 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mb-4">
                      <PhotoIcon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div className="mt-4">
                      <label className="cursor-pointer inline-block">
                        <span className="inline-flex items-center px-6 py-3 border-2 border-indigo-600 dark:border-indigo-500 rounded-lg text-sm font-semibold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-all">
                          <PhotoIcon className="h-5 w-5 mr-2" />
                          {existingImages.length > 0 ? 'Agregar más imágenes' : 'Seleccionar imágenes'}
                        </span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={handleImageChange}
                          className="sr-only"
                        />
                      </label>
                    </div>
                    <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">PNG, JPG, WEBP hasta 10MB cada una</p>
                  </div>

                  {/* Preview de nuevas imágenes */}
                  {imagePreview.length > 0 && (
                    <div className="mt-6 p-4 bg-white dark:bg-gray-700 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                        <span className="inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                        Nuevas imágenes a agregar:
                      </p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {imagePreview.map((preview, index) => (
                          <div key={`new-${index}`} className="relative group">
                            <img
                              src={preview}
                              alt={`Preview ${index + 1}`}
                              className="h-28 w-full object-cover rounded-xl border-2 border-green-300 dark:border-green-600 shadow-md group-hover:shadow-xl transition-all"
                            />
                            <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-lg">
                              Nueva
                            </span>
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 shadow-lg transition-all hover:scale-110"
                            >
                              <XMarkIcon className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex justify-end space-x-4 pt-6 border-t-2 border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="px-6 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-sm font-semibold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all shadow-sm hover:shadow-md"
                  disabled={uploading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-sm font-semibold text-white shadow-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-xl hover:scale-105 flex items-center gap-2"
                >
                  {uploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Guardando...
                    </>
                  ) : (
                    <>
                      {editingProduct ? <PencilIcon className="h-5 w-5" /> : <PlusIcon className="h-5 w-5" />}
                      {editingProduct ? 'Actualizar Producto' : 'Crear Producto'}
                    </>
                  )}
                </button>
              </div>
            </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Products
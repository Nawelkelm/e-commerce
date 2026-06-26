import React, { useState, useEffect } from 'react'
import { PlusIcon, PencilIcon, TrashIcon, TagIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useAuthStore } from '../../store/authStore'

const Categories = () => {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true
  })
  const { token } = useAuthStore()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Error al cargar categorías')
      }
      
      const data = await response.json()
      setCategories(data || [])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const url = editingCategory 
        ? `/api/admin/categories/${editingCategory.id}`
        : '/api/admin/categories'
      
      const method = editingCategory ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        await fetchCategories()
        setShowModal(false)
        setEditingCategory(null)
        setFormData({ name: '', description: '', isActive: true })
      } else {
        throw new Error('Error al guardar categoría')
      }
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      isActive: category.isActive
    })
    setShowModal(true)
  }

  const handleDelete = async (categoryId) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/categories/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        await fetchCategories()
      } else {
        throw new Error('Error al eliminar categoría')
      }
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 text-lg mb-4">Error: {error}</p>
        <button 
          onClick={fetchCategories}
          className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700"
        >
          Intentar nuevamente
        </button>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      {/* Header mejorado */}
      <div className="mb-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                <TagIcon className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                Categorías
              </h1>
            </div>
            <p className="text-sm text-surface-600 dark:text-surface-400 ml-14">
              Organiza tus productos en categorías
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 hover:shadow-xl hover:scale-105"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Nueva Categoría
            </button>
          </div>
        </div>
      </div>

      {/* Grid de categorías mejorado */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white dark:bg-surface-800 rounded-xl border-2 border-dashed border-surface-300 dark:border-surface-600 dark:border-surface-700">
            <TagIcon className="mx-auto h-12 w-12 text-surface-400" />
            <p className="mt-4 text-surface-500 dark:text-surface-400">No hay categorías disponibles</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-4 text-primary-600 dark:text-primary-400 hover:text-primary-700 font-medium"
            >
              Crear la primera categoría
            </button>
          </div>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              className="bg-white dark:bg-surface-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 overflow-hidden border border-surface-200 dark:border-surface-700 hover:scale-105"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-lg">
                        <TagIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                      </div>
                      <h3 className="text-lg font-bold text-surface-900 dark:text-white">
                        {category.name}
                      </h3>
                    </div>
                    <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                      category.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full mr-2 ${category.isActive ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      {category.isActive ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-2 text-primary-600 hover:text-indigo-900 dark:text-primary-400 dark:hover:text-primary-300 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-all"
                      title="Editar"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-2 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                      title="Eliminar"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                {category.description && (
                  <p className="text-sm text-surface-600 dark:text-surface-400 mb-3 line-clamp-2">
                    {category.description}
                  </p>
                )}
                <div className="pt-3 border-t border-surface-200 dark:border-surface-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-surface-500 dark:text-surface-400">Productos</span>
                    <span className="font-bold text-primary-600 dark:text-primary-400">
                      {category.productCount || 0}
                    </span>
                  </div>
                </div>
              </div>
              <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
            </div>
          ))
        )}
      </div>

      {/* Modal mejorado */}
      {showModal && (
        <div className="fixed inset-0 bg-surface-900/75 dark:bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-lg">
            {/* Header del modal */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl px-6 py-5 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    {editingCategory ? (
                      <PencilIcon className="h-6 w-6 text-white" />
                    ) : (
                      <PlusIcon className="h-6 w-6 text-white" />
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setEditingCategory(null)
                    setFormData({ name: '', description: '', isActive: true })
                  }}
                  className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-all"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            {/* Contenido del modal */}
            <div className="bg-white dark:bg-surface-800 rounded-b-2xl shadow-2xl">
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="block w-full px-4 py-3 border-2 border-surface-200 dark:border-surface-700 dark:border-surface-600 rounded-lg bg-surface-50 dark:bg-surface-900 dark:bg-surface-700 text-surface-900 dark:text-white dark:text-surface-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    placeholder="Ej: Electrónica"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="block w-full px-4 py-3 border-2 border-surface-200 dark:border-surface-700 dark:border-surface-600 rounded-lg bg-surface-50 dark:bg-surface-900 dark:bg-surface-700 text-surface-900 dark:text-white dark:text-surface-100 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all resize-none"
                    placeholder="Descripción opcional de la categoría..."
                  />
                </div>
                
                <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="h-5 w-5 text-primary-600 focus:ring-2 focus:ring-primary-500 border-surface-300 dark:border-surface-600 rounded transition-all"
                    />
                    <label className="ml-3 block text-sm font-medium text-surface-900 dark:text-white dark:text-surface-100">
                      Categoría activa
                    </label>
                  </div>
                </div>
              
                <div className="flex justify-end space-x-4 pt-4 border-t-2 border-surface-200 dark:border-surface-700">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingCategory(null)
                      setFormData({ name: '', description: '', isActive: true })
                    }}
                    className="px-6 py-3 border-2 border-surface-300 dark:border-surface-600 rounded-lg text-sm font-semibold text-surface-700 dark:text-surface-300 bg-white dark:bg-surface-800 dark:bg-surface-700 hover:bg-surface-50 dark:bg-surface-900 dark:hover:bg-surface-600 transition-all shadow-sm hover:shadow-md"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg text-sm font-semibold text-white shadow-lg hover:from-indigo-700 hover:to-purple-700 transition-all hover:shadow-xl hover:scale-105 flex items-center gap-2"
                  >
                    {editingCategory ? (
                      <>
                        <PencilIcon className="h-5 w-5" />
                        Actualizar
                      </>
                    ) : (
                      <>
                        <PlusIcon className="h-5 w-5" />
                        Crear
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

export default Categories
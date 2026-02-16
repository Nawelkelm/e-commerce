import React, { useState, useEffect } from 'react'
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  KeyIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../../store/authStore'

const RoleManagement = () => {
  const [roles, setRoles] = useState([])
  const [permissions, setPermissions] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState(null)
  const [modalMode, setModalMode] = useState('create') // 'create', 'edit', 'view'
  const [roleForm, setRoleForm] = useState({
    name: '',
    displayName: '',
    description: '',
    permissions: []
  })
  
  const { token } = useAuthStore()

  // Fetch roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/roles', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setRoles(data)
        } else {
          throw new Error('Error al cargar los roles')
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    
    if (token) {
      fetchRoles()
    }
  }, [token])

  // Fetch permissions
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await fetch('/api/admin/permissions', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          setPermissions(data)
        }
      } catch (err) {
        console.error('Error loading permissions:', err)
      }
    }
    
    if (token) {
      fetchPermissions()
    }
  }, [token])

  // Create role
  const createRole = async (roleData) => {
    try {
      const response = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(roleData)
      })
      
      if (response.ok) {
        const result = await response.json()
        setRoles([result.role, ...roles])
        setShowRoleModal(false)
        resetForm()
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Error al crear el rol')
      }
    } catch (err) {
      setError(err.message)
    }
  }

  // Update role
  const updateRole = async (roleId, roleData) => {
    try {
      const response = await fetch(`/api/admin/roles/${roleId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(roleData)
      })
      
      if (response.ok) {
        const result = await response.json()
        setRoles(roles.map(role => 
          role.id === roleId ? result.role : role
        ))
        setShowRoleModal(false)
        resetForm()
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Error al actualizar el rol')
      }
    } catch (err) {
      setError(err.message)
    }
  }

  // Delete role
  const deleteRole = async (roleId) => {
    try {
      const response = await fetch(`/api/admin/roles/${roleId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        setRoles(roles.filter(role => role.id !== roleId))
        setShowDeleteModal(false)
        setSelectedRole(null)
      } else {
        const error = await response.json()
        throw new Error(error.message || 'Error al eliminar el rol')
      }
    } catch (err) {
      setError(err.message)
    }
  }

  // Form handlers
  const resetForm = () => {
    setRoleForm({
      name: '',
      displayName: '',
      description: '',
      permissions: []
    })
  }

  const handleCreateRole = () => {
    setModalMode('create')
    resetForm()
    setShowRoleModal(true)
  }

  const handleEditRole = (role) => {
    setModalMode('edit')
    setSelectedRole(role)
    setRoleForm({
      name: role.name,
      displayName: role.displayName,
      description: role.description || '',
      permissions: role.Permissions?.map(p => p.id) || []
    })
    setShowRoleModal(true)
  }

  const handleViewRole = (role) => {
    setModalMode('view')
    setSelectedRole(role)
    setShowRoleModal(true)
  }

  const handleDeleteRole = (role) => {
    setSelectedRole(role)
    setShowDeleteModal(true)
  }

  const handleFormSubmit = (e) => {
    e.preventDefault()
    if (modalMode === 'create') {
      createRole(roleForm)
    } else if (modalMode === 'edit') {
      updateRole(selectedRole.id, roleForm)
    }
  }

  const handlePermissionToggle = (permissionId) => {
    if (roleForm.permissions.includes(permissionId)) {
      setRoleForm({
        ...roleForm,
        permissions: roleForm.permissions.filter(id => id !== permissionId)
      })
    } else {
      setRoleForm({
        ...roleForm,
        permissions: [...roleForm.permissions, permissionId]
      })
    }
  }

  const getCategoryDisplayName = (category) => {
    const categoryNames = {
      user_management: 'Gestión de Usuarios',
      product_management: 'Gestión de Productos',
      order_management: 'Gestión de Pedidos',
      analytics: 'Analíticas y Reportes',
      system_management: 'Administración del Sistema',
      profile: 'Perfil Personal'
    }
    return categoryNames[category] || category
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="sm:flex sm:items-center mb-8">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">Gestión de Roles y Permisos</h1>
          <p className="mt-2 text-sm text-gray-700">
            Administra roles y permisos del sistema para controlar el acceso de los usuarios
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={handleCreateRole}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Crear Rol
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Rol
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Permisos
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {roles.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                  No se encontraron roles
                </td>
              </tr>
            ) : (
              roles.map((role) => (
                <tr key={role.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                          <ShieldCheckIcon className="h-6 w-6 text-indigo-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {role.displayName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {role.name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {role.Permissions?.length || 0} permisos
                    </div>
                    <div className="text-sm text-gray-500">
                      {role.description || 'Sin descripción'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        role.isSystemRole
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {role.isSystemRole ? 'Sistema' : 'Personalizado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        role.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {role.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleViewRole(role)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Ver detalles"
                      >
                        <KeyIcon className="h-5 w-5" />
                      </button>
                      {!role.isSystemRole && (
                        <>
                          <button
                            onClick={() => handleEditRole(role)}
                            className="text-indigo-600 hover:text-indigo-900 p-1"
                            title="Editar rol"
                          >
                            <PencilIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRole(role)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Eliminar rol"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de crear/editar/ver rol */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {modalMode === 'create' ? 'Crear Rol' : 
                   modalMode === 'edit' ? 'Editar Rol' : 'Detalles del Rol'}
                </h2>
                <button
                  onClick={() => setShowRoleModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {modalMode === 'view' ? (
                // Vista de solo lectura
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-medium text-gray-900 mb-4">Información del Rol</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Nombre Interno</label>
                          <p className="text-sm text-gray-900">{selectedRole?.name}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Nombre de Visualización</label>
                          <p className="text-sm text-gray-900">{selectedRole?.displayName}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-500">Descripción</label>
                          <p className="text-sm text-gray-900">{selectedRole?.description || 'Sin descripción'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 mb-4">Permisos Asignados</h3>
                    {Object.entries(permissions).map(([category, categoryPermissions]) => {
                      const rolePermissions = selectedRole?.Permissions?.map(p => p.id) || []
                      const hasPermissionsInCategory = categoryPermissions.some(p => rolePermissions.includes(p.id))
                      
                      if (!hasPermissionsInCategory) return null
                      
                      return (
                        <div key={category} className="mb-4">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">
                            {getCategoryDisplayName(category)}
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {categoryPermissions.map(permission => {
                              if (!rolePermissions.includes(permission.id)) return null
                              
                              return (
                                <div key={permission.id} className="flex items-center space-x-2">
                                  <CheckIcon className="h-4 w-4 text-green-500" />
                                  <span className="text-sm text-gray-700">{permission.displayName}</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                // Formulario de crear/editar
                <form onSubmit={handleFormSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre Interno *
                      </label>
                      <input
                        type="text"
                        required
                        value={roleForm.name}
                        onChange={(e) => setRoleForm({...roleForm, name: e.target.value})}
                        placeholder="ej: sales_manager"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre de Visualización *
                      </label>
                      <input
                        type="text"
                        required
                        value={roleForm.displayName}
                        onChange={(e) => setRoleForm({...roleForm, displayName: e.target.value})}
                        placeholder="ej: Gerente de Ventas"
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción
                    </label>
                    <textarea
                      rows={3}
                      value={roleForm.description}
                      onChange={(e) => setRoleForm({...roleForm, description: e.target.value})}
                      placeholder="Describe las responsabilidades de este rol..."
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Permisos
                    </label>
                    <div className="space-y-4 max-h-96 overflow-y-auto border border-gray-200 rounded-md p-4">
                      {Object.entries(permissions).map(([category, categoryPermissions]) => (
                        <div key={category}>
                          <h4 className="text-sm font-medium text-gray-900 mb-2">
                            {getCategoryDisplayName(category)}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ml-4">
                            {categoryPermissions.map(permission => (
                              <label key={permission.id} className="flex items-center space-x-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={roleForm.permissions.includes(permission.id)}
                                  onChange={() => handlePermissionToggle(permission.id)}
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                                <span className="text-sm text-gray-700">{permission.displayName}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowRoleModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
                    >
                      {modalMode === 'create' ? 'Crear Rol' : 'Actualizar Rol'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && selectedRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600 mr-2" />
                <h3 className="text-lg font-medium text-gray-900">Eliminar Rol</h3>
              </div>
              
              <p className="text-sm text-gray-500 mb-6">
                ¿Estás seguro de que quieres eliminar el rol <strong>{selectedRole.displayName}</strong>? 
                Esta acción no se puede deshacer.
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => deleteRole(selectedRole.id)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RoleManagement
import { useState, useEffect } from 'react'
import { bankAccountsAPI } from '../../services/api'
import { PlusIcon, PencilIcon, TrashIcon, CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'

export default function BankAccounts() {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAccount, setEditingAccount] = useState(null)
  const [formData, setFormData] = useState({
    bankName: '',
    accountType: 'Cuenta Corriente',
    accountNumber: '',
    cbu: '',
    alias: '',
    holderName: '',
    holderDocument: '',
    isActive: true,
    isPrimary: false
  })

  useEffect(() => {
    fetchAccounts()
  }, [])

  const fetchAccounts = async () => {
    try {
      setLoading(true)
      const response = await bankAccountsAPI.getAll()
      setAccounts(response.data)
    } catch (error) {
      console.error('Error fetching accounts:', error)
      alert('Error al cargar cuentas bancarias')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      if (editingAccount) {
        await bankAccountsAPI.update(editingAccount.id, formData)
        alert('Cuenta bancaria actualizada')
      } else {
        await bankAccountsAPI.create(formData)
        alert('Cuenta bancaria creada')
      }
      
      setShowModal(false)
      setEditingAccount(null)
      resetForm()
      fetchAccounts()
    } catch (error) {
      console.error('Error saving account:', error)
      alert(error.response?.data?.message || 'Error al guardar cuenta bancaria')
    }
  }

  const handleEdit = (account) => {
    setEditingAccount(account)
    setFormData({
      bankName: account.bankName,
      accountType: account.accountType,
      accountNumber: account.accountNumber,
      cbu: account.cbu,
      alias: account.alias || '',
      holderName: account.holderName,
      holderDocument: account.holderDocument,
      isActive: account.isActive,
      isPrimary: account.isPrimary
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta cuenta bancaria?')) return
    
    try {
      await bankAccountsAPI.delete(id)
      alert('Cuenta bancaria eliminada')
      fetchAccounts()
    } catch (error) {
      console.error('Error deleting account:', error)
      alert('Error al eliminar cuenta bancaria')
    }
  }

  const handleSetPrimary = async (id) => {
    try {
      await bankAccountsAPI.setPrimary(id)
      alert('Cuenta marcada como principal')
      fetchAccounts()
    } catch (error) {
      console.error('Error setting primary:', error)
      alert('Error al marcar como principal')
    }
  }

  const resetForm = () => {
    setFormData({
      bankName: '',
      accountType: 'Cuenta Corriente',
      accountNumber: '',
      cbu: '',
      alias: '',
      holderName: '',
      holderDocument: '',
      isActive: true,
      isPrimary: false
    })
  }

  const handleOpenModal = () => {
    resetForm()
    setEditingAccount(null)
    setShowModal(true)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
          Cuentas Bancarias
        </h1>
        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg"
        >
          <PlusIcon className="w-5 h-5" />
          Nueva Cuenta
        </button>
      </div>

      {accounts.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-surface-800 rounded-lg">
          <p className="text-surface-500 dark:text-surface-400">
            No hay cuentas bancarias configuradas
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {accounts.map((account) => (
            <div
              key={account.id}
              className={`bg-white dark:bg-surface-800 rounded-lg shadow p-6 ${
                account.isPrimary ? 'ring-2 ring-primary-500' : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-semibold text-surface-900 dark:text-white">
                      {account.bankName}
                    </h3>
                    {account.isPrimary && (
                      <span className="bg-primary-100 text-primary-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-primary-900 dark:text-primary-300">
                        Principal
                      </span>
                    )}
                    {account.isActive ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    ) : (
                      <XMarkIcon className="w-5 h-5 text-red-500" />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-surface-500 dark:text-surface-400">Tipo:</span>
                      <span className="ml-2 text-surface-900 dark:text-white">{account.accountType}</span>
                    </div>
                    <div>
                      <span className="text-surface-500 dark:text-surface-400">N° Cuenta:</span>
                      <span className="ml-2 text-surface-900 dark:text-white font-mono">{account.accountNumber}</span>
                    </div>
                    <div>
                      <span className="text-surface-500 dark:text-surface-400">CBU:</span>
                      <span className="ml-2 text-surface-900 dark:text-white font-mono">{account.cbu}</span>
                    </div>
                    {account.alias && (
                      <div>
                        <span className="text-surface-500 dark:text-surface-400">Alias:</span>
                        <span className="ml-2 text-surface-900 dark:text-white">{account.alias}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-surface-500 dark:text-surface-400">Titular:</span>
                      <span className="ml-2 text-surface-900 dark:text-white">{account.holderName}</span>
                    </div>
                    <div>
                      <span className="text-surface-500 dark:text-surface-400">CUIT/CUIL:</span>
                      <span className="ml-2 text-surface-900 dark:text-white font-mono">{account.holderDocument}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  {!account.isPrimary && account.isActive && (
                    <button
                      onClick={() => handleSetPrimary(account.id)}
                      className="text-primary-600 hover:text-primary-800 dark:text-primary-400 p-2"
                      title="Marcar como principal"
                    >
                      <CheckCircleIcon className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(account)}
                    className="text-surface-600 dark:text-surface-400 hover:text-surface-800 dark:text-surface-400 p-2"
                  >
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(account.id)}
                    className="text-red-600 hover:text-red-800 dark:text-red-400 p-2"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-surface-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-surface-900 dark:text-white mb-4">
                {editingAccount ? 'Editar Cuenta Bancaria' : 'Nueva Cuenta Bancaria'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                    Banco
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-surface-700 dark:border-surface-600"
                    placeholder="Ej: Banco Nación"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                    Tipo de Cuenta
                  </label>
                  <select
                    value={formData.accountType}
                    onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-surface-700 dark:border-surface-600"
                  >
                    <option value="Cuenta Corriente">Cuenta Corriente</option>
                    <option value="Caja de Ahorro">Caja de Ahorro</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                      Número de Cuenta
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.accountNumber}
                      onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-surface-700 dark:border-surface-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                      CBU (22 dígitos)
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={22}
                      value={formData.cbu}
                      onChange={(e) => setFormData({ ...formData, cbu: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-surface-700 dark:border-surface-600 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                    Alias (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.alias}
                    onChange={(e) => setFormData({ ...formData, alias: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg dark:bg-surface-700 dark:border-surface-600"
                    placeholder="Ej: TIENDA.ONLINE"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                      Titular
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.holderName}
                      onChange={(e) => setFormData({ ...formData, holderName: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-surface-700 dark:border-surface-600"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">
                      CUIT/CUIL
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.holderDocument}
                      onChange={(e) => setFormData({ ...formData, holderDocument: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg dark:bg-surface-700 dark:border-surface-600 font-mono"
                      placeholder="Ej: 20-12345678-9"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="rounded mr-2"
                    />
                    <span className="text-sm text-surface-700 dark:text-surface-300">Activa</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isPrimary}
                      onChange={(e) => setFormData({ ...formData, isPrimary: e.target.checked })}
                      className="rounded mr-2"
                    />
                    <span className="text-sm text-surface-700 dark:text-surface-300">Principal</span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingAccount(null)
                      resetForm()
                    }}
                    className="px-4 py-2 text-surface-700 dark:text-surface-300 bg-surface-200 dark:bg-surface-700 rounded-lg hover:bg-surface-300 dark:hover:bg-surface-600"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg"
                  >
                    {editingAccount ? 'Actualizar' : 'Crear'}
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

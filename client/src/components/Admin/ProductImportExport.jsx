import React, { useState } from 'react'
import { 
  ArrowUpTrayIcon, 
  ArrowDownTrayIcon, 
  DocumentArrowDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline'
import { useAuthStore } from '../../store/authStore'
import toast from 'react-hot-toast'

const ProductImportExport = ({ onImportSuccess }) => {
  const [showImportModal, setShowImportModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [importing, setImporting] = useState(false)
  const [exporting, setExporting] = useState(false)
  const { token } = useAuthStore()

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      setSelectedFile(file)
      setPreview(null)
    }
  }

  const handlePreview = async () => {
    if (!selectedFile) {
      toast.error('Selecciona un archivo primero')
      return
    }

    setImporting(true)
    const formData = new FormData()
    formData.append('file', selectedFile)

    try {
      const response = await fetch('/api/products/excel/preview', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al procesar archivo')
      }

      setPreview(data.preview)
      
      if (data.preview.errorCount > 0) {
        toast.error(`Se encontraron ${data.preview.errorCount} errores`)
      } else {
        toast.success('Archivo procesado correctamente')
      }
    } catch (error) {
      console.error('Preview error:', error)
      toast.error(error.message || 'Error al procesar archivo')
      setPreview(null)
    } finally {
      setImporting(false)
    }
  }

  const handleConfirmImport = async () => {
    if (!preview || preview.errorCount > 0) {
      toast.error('Corrige los errores antes de importar')
      return
    }

    setImporting(true)

    try {
      const response = await fetch('/api/products/excel/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tempFile: preview.tempFile
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Error al importar productos')
      }

      toast.success(`${data.results.imported} productos importados exitosamente`)
      
      if (data.results.skipped > 0) {
        toast.error(`${data.results.skipped} productos omitidos por errores`, {
          duration: 5000
        })
      }

      if (data.results.details.warnings.length > 0) {
        toast(`${data.results.details.warnings.length} advertencias de stock bajo`, {
          icon: '⚠️',
          duration: 4000
        })
      }

      setShowImportModal(false)
      setSelectedFile(null)
      setPreview(null)
      
      if (onImportSuccess) {
        onImportSuccess()
      }
    } catch (error) {
      console.error('Import error:', error)
      toast.error(error.message || 'Error al importar productos')
    } finally {
      setImporting(false)
    }
  }

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/api/products/excel/template', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Error al descargar plantilla')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'plantilla-productos.xlsx'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('Plantilla descargada')
    } catch (error) {
      console.error('Download template error:', error)
      toast.error('Error al descargar plantilla')
    }
  }

  const handleExport = async () => {
    setExporting(true)
    
    try {
      const response = await fetch('/api/products/excel/export', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Error al exportar productos')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `productos-${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast.success('Productos exportados')
    } catch (error) {
      console.error('Export error:', error)
      toast.error('Error al exportar productos')
    } finally {
      setExporting(false)
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleDownloadTemplate}
          className="inline-flex items-center px-4 py-2 border border-surface-300 dark:border-surface-600 rounded-md shadow-sm text-sm font-medium text-surface-700 dark:text-surface-300 dark:text-surface-200 bg-white dark:bg-surface-800 dark:bg-surface-700 hover:bg-surface-50 dark:bg-surface-900 dark:hover:bg-surface-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
          Plantilla Excel
        </button>

        <button
          onClick={() => setShowImportModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
          Importar Excel
        </button>

        <button
          onClick={handleExport}
          disabled={exporting}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
          {exporting ? 'Exportando...' : 'Exportar Excel'}
        </button>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-surface-500 dark:bg-surface-900 bg-opacity-75 dark:bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setShowImportModal(false)}></div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

            <div className="inline-block align-bottom bg-white dark:bg-surface-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full sm:p-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-surface-900 dark:text-white">
                    Importar Productos desde Excel
                  </h3>
                  <button
                    onClick={() => {
                      setShowImportModal(false)
                      setSelectedFile(null)
                      setPreview(null)
                    }}
                    className="text-surface-400 hover:text-surface-500 dark:text-surface-400 dark:hover:text-surface-300"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="mt-4">
                  <div className="border-2 border-dashed border-surface-300 dark:border-surface-600 rounded-lg p-6">
                    <div className="text-center">
                      <ArrowUpTrayIcon className="mx-auto h-12 w-12 text-surface-400 dark:text-surface-500 dark:text-surface-400" />
                      <div className="mt-4">
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <span className="mt-2 block text-sm font-medium text-surface-900 dark:text-white">
                            {selectedFile ? selectedFile.name : 'Selecciona un archivo Excel'}
                          </span>
                          <input
                            id="file-upload"
                            name="file-upload"
                            type="file"
                            accept=".xlsx,.xls"
                            className="sr-only"
                            onChange={handleFileSelect}
                          />
                          <span className="mt-1 block text-sm text-surface-500 dark:text-surface-400">
                            o arrastra y suelta
                          </span>
                        </label>
                      </div>
                      <p className="text-xs text-surface-500 dark:text-surface-400 mt-2">
                        Archivos .xlsx o .xls hasta 10MB
                      </p>
                    </div>

                    {selectedFile && !preview && (
                      <div className="mt-4 text-center">
                        <button
                          onClick={handlePreview}
                          disabled={importing}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                        >
                          {importing ? 'Procesando...' : 'Vista Previa'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Preview Results */}
                  {preview && (
                    <div className="mt-6 space-y-4">
                      <div className="bg-surface-50 dark:bg-surface-900 dark:bg-surface-700 rounded-lg p-4">
                        <h4 className="text-sm font-medium text-surface-900 dark:text-white mb-3">
                          Resumen de Importación
                        </h4>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="text-center">
                            <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                              {preview.successCount}
                            </p>
                            <p className="text-sm text-surface-600 dark:text-surface-400 dark:text-surface-300">Productos válidos</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                              {preview.errorCount}
                            </p>
                            <p className="text-sm text-surface-600 dark:text-surface-400 dark:text-surface-300">Errores</p>
                          </div>
                          <div className="text-center">
                            <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                              {preview.warningCount}
                            </p>
                            <p className="text-sm text-surface-600 dark:text-surface-400 dark:text-surface-300">Advertencias</p>
                          </div>
                        </div>
                      </div>

                      {/* Errors */}
                      {preview.errors && preview.errors.length > 0 && (
                        <div className="bg-red-50 dark:bg-red-900 dark:bg-opacity-20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                          <div className="flex items-start">
                            <XCircleIcon className="h-5 w-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" />
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-red-800 dark:text-red-300 mb-2">
                                Errores encontrados
                              </h4>
                              <ul className="list-disc list-inside text-sm text-red-700 dark:text-red-400 space-y-1 max-h-40 overflow-y-auto">
                                {preview.errors.map((error, index) => (
                                  <li key={index}>{error}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Warnings */}
                      {preview.warnings && preview.warnings.length > 0 && (
                        <div className="bg-yellow-50 dark:bg-yellow-900 dark:bg-opacity-20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                          <div className="flex items-start">
                            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 mt-0.5 mr-2 flex-shrink-0" />
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-300 mb-2">
                                Advertencias
                              </h4>
                              <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-400 space-y-1 max-h-40 overflow-y-auto">
                                {preview.warnings.map((warning, index) => (
                                  <li key={index}>{warning}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Success Preview */}
                      {preview.success && preview.success.length > 0 && (
                        <div className="bg-green-50 dark:bg-green-900 dark:bg-opacity-20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                          <div className="flex items-start">
                            <CheckCircleIcon className="h-5 w-5 text-green-400 mt-0.5 mr-2 flex-shrink-0" />
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-green-800 dark:text-green-300 mb-2">
                                Vista previa ({preview.success.length} productos)
                                {preview.hasMore && ` - Mostrando los primeros 10`}
                              </h4>
                              <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                  <thead>
                                    <tr className="text-left text-green-700 dark:text-green-400">
                                      <th className="px-2 py-1">Nombre</th>
                                      <th className="px-2 py-1">Precio</th>
                                      <th className="px-2 py-1">Stock</th>
                                      <th className="px-2 py-1">Categoría</th>
                                    </tr>
                                  </thead>
                                  <tbody className="text-green-600 dark:text-green-300">
                                    {preview.success.map((item, index) => (
                                      <tr key={index} className="border-t border-green-200 dark:border-green-800">
                                        <td className="px-2 py-1">{item.data.name}</td>
                                        <td className="px-2 py-1">${item.data.price.toLocaleString()}</td>
                                        <td className="px-2 py-1">{item.data.stock}</td>
                                        <td className="px-2 py-1">{item.data.categoryId || 'N/A'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowImportModal(false)
                      setSelectedFile(null)
                      setPreview(null)
                    }}
                    className="px-4 py-2 border border-surface-300 dark:border-surface-600 rounded-md shadow-sm text-sm font-medium text-surface-700 dark:text-surface-300 dark:text-surface-200 bg-white dark:bg-surface-800 dark:bg-surface-700 hover:bg-surface-50 dark:bg-surface-900 dark:hover:bg-surface-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Cancelar
                  </button>
                  {preview && preview.errorCount === 0 && (
                    <button
                      onClick={handleConfirmImport}
                      disabled={importing}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {importing ? 'Importando...' : `Importar ${preview.successCount} productos`}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default ProductImportExport

import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FaUniversity, FaCheckCircle, FaCopy, FaUpload, FaInfoCircle, FaCheck } from 'react-icons/fa'
import { HiDocumentText } from 'react-icons/hi'
import { bankAccountsAPI, uploadPaymentProof } from '../services/api'
import { useAuthStore } from '../store/authStore'

export default function PaymentTransfer() {
  const location = useLocation()
  const navigate = useNavigate()
  const { token } = useAuthStore()
  const [bankData, setBankData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  
  const { orderId, orderNumber, total } = location.state || {}

  useEffect(() => {
    // Verificar que el usuario esté autenticado
    if (!token) {
      alert('Debe iniciar sesión para continuar')
      navigate('/login')
      return
    }

    if (!orderId) {
      navigate('/carrito')
      return
    }
    loadBankData()
  }, [orderId, token])

  const loadBankData = async () => {
    try {
      const response = await bankAccountsAPI.getActive()
      setBankData(response.data)
    } catch (error) {
      console.error('Error loading bank data:', error)
      alert('Error al cargar datos bancarios. Por favor contacte al vendedor.')
    } finally {
      setLoading(false)
    }
  }

  const [copiedField, setCopiedField] = useState(null)

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Validar tamaño (máx 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo no puede superar los 5MB')
        return
      }
      
      // Validar tipo
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
      if (!validTypes.includes(file.type)) {
        alert('Solo se permiten archivos JPG, PNG o PDF')
        return
      }
      
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Por favor seleccione un archivo')
      return
    }

    try {
      setUploading(true)
      await uploadPaymentProof(orderId, selectedFile)
      setUploadSuccess(true)
      alert('Comprobante cargado correctamente. Su pedido será verificado pronto.')
    } catch (error) {
      console.error('Error uploading proof:', error)
      alert(error.response?.data?.message || 'Error al cargar comprobante')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!bankData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-4">
            No hay datos bancarios configurados
          </h2>
          <p className="text-surface-600 dark:text-surface-400 mb-6">
            Por favor contacte al vendedor para obtener los datos de transferencia.
          </p>
          <button
            onClick={() => navigate('/pedidos')}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Ver Mis Pedidos
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-xl p-8 mb-8 text-white">
          <div className="flex items-center gap-6 mb-6">
            <div className="bg-white/20 backdrop-blur-sm p-5 rounded-2xl">
              <FaUniversity className="text-white text-4xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Transferencia Bancaria
              </h1>
              <p className="text-blue-100 text-lg">
                Pedido #{orderNumber}
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <span className="text-lg text-blue-100">Monto a transferir:</span>
              <span className="text-3xl font-bold">${parseFloat(total).toFixed(2)} ARS</span>
            </div>
          </div>
        </div>

        {/* Datos Bancarios - Grid Moderno */}
        <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <HiDocumentText className="text-primary-600 text-2xl" />
            <h2 className="text-2xl font-bold text-surface-900 dark:text-white">
              Datos para la Transferencia
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Banco */}
            <div className="col-span-2 p-5 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-primary-200 dark:border-blue-700 rounded-xl">
              <p className="text-sm font-medium text-primary-700 dark:text-primary-300 mb-1">Banco</p>
              <p className="text-xl font-bold text-primary-900 dark:text-blue-100">
                {bankData.bankName}
              </p>
            </div>

            {/* Tipo de Cuenta */}
            <div className="p-5 bg-surface-50 dark:bg-surface-900 dark:bg-surface-700/50 border border-surface-200 dark:border-surface-700 dark:border-surface-600 rounded-xl">
              <p className="text-sm font-medium text-surface-600 dark:text-surface-400 mb-1">Tipo de Cuenta</p>
              <p className="text-lg font-semibold text-surface-900 dark:text-white">
                {bankData.accountType}
              </p>
            </div>

            {/* Titular */}
            <div className="p-5 bg-surface-50 dark:bg-surface-900 dark:bg-surface-700/50 border border-surface-200 dark:border-surface-700 dark:border-surface-600 rounded-xl">
              <p className="text-sm font-medium text-surface-600 dark:text-surface-400 mb-1">Titular</p>
              <p className="text-lg font-semibold text-surface-900 dark:text-white">
                {bankData.holderName}
              </p>
            </div>

            {/* CBU - Destacado */}
            <div className="col-span-2 p-5 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 rounded-xl">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-700 dark:text-green-300 mb-1">CBU (Recomendado)</p>
                  <p className="text-lg font-mono font-bold text-green-900 dark:text-green-100 tracking-wider">
                    {bankData.cbu}
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(bankData.cbu, 'cbu')}
                  className={`ml-4 p-3 rounded-xl transition-all duration-200 ${
                    copiedField === 'cbu'
                      ? 'bg-green-600 text-white scale-110'
                      : 'bg-white dark:bg-surface-800 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 shadow-md'
                  }`}
                  title="Copiar CBU"
                >
                  {copiedField === 'cbu' ? <FaCheck className="text-xl" /> : <FaCopy className="text-xl" />}
                </button>
              </div>
              {copiedField === 'cbu' && (
                <p className="text-sm text-green-700 dark:text-green-300 font-medium animate-pulse">
                  ✓ Copiado al portapapeles
                </p>
              )}
            </div>

            {/* Alias */}
            {bankData.alias && (
              <div className="col-span-2 p-5 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-300 dark:border-purple-700 rounded-xl">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-purple-700 dark:text-purple-300 mb-1">Alias (Alternativo)</p>
                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100 uppercase tracking-wide">
                      {bankData.alias}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(bankData.alias, 'alias')}
                    className={`ml-4 p-3 rounded-xl transition-all duration-200 ${
                      copiedField === 'alias'
                        ? 'bg-purple-600 text-white scale-110'
                        : 'bg-white dark:bg-surface-800 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/30 shadow-md'
                    }`}
                    title="Copiar Alias"
                  >
                    {copiedField === 'alias' ? <FaCheck className="text-xl" /> : <FaCopy className="text-xl" />}
                  </button>
                </div>
                {copiedField === 'alias' && (
                  <p className="text-sm text-purple-700 dark:text-purple-300 font-medium animate-pulse">
                    ✓ Copiado al portapapeles
                  </p>
                )}
              </div>
            )}

            {/* Número de Cuenta */}
            <div className="col-span-2 p-5 bg-surface-50 dark:bg-surface-900 dark:bg-surface-700/50 border border-surface-200 dark:border-surface-700 dark:border-surface-600 rounded-xl">
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-surface-600 dark:text-surface-400 mb-1">Número de Cuenta</p>
                  <p className="text-lg font-mono font-semibold text-surface-900 dark:text-white">
                    {bankData.accountNumber}
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(bankData.accountNumber, 'account')}
                  className={`ml-4 p-3 rounded-xl transition-all duration-200 ${
                    copiedField === 'account'
                      ? 'bg-primary-600 text-white scale-110'
                      : 'bg-white dark:bg-surface-800 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/30 shadow-md'
                  }`}
                  title="Copiar Número de Cuenta"
                >
                  {copiedField === 'account' ? <FaCheck /> : <FaCopy />}
                </button>
              </div>
            </div>

            {/* CUIT */}
            <div className="col-span-2 p-5 bg-surface-50 dark:bg-surface-900 dark:bg-surface-700/50 border border-surface-200 dark:border-surface-700 dark:border-surface-600 rounded-xl">
              <p className="text-sm font-medium text-surface-600 dark:text-surface-400 mb-1">CUIT/CUIL del Titular</p>
              <p className="text-lg font-mono font-semibold text-surface-900 dark:text-white">
                {bankData.holderDocument}
              </p>
            </div>
          </div>
        </div>

        {/* Upload Comprobante - Diseño Mejorado */}
        {!uploadSuccess ? (
          <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <FaUpload className="text-primary-600 text-2xl" />
              <h2 className="text-2xl font-bold text-surface-900 dark:text-white">
                Cargar Comprobante de Pago
              </h2>
            </div>
            
            <p className="text-surface-600 dark:text-surface-400 mb-6 text-lg">
              Una vez realizada la transferencia, cargue aquí el comprobante para que podamos verificar su pago.
            </p>

            <div className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
              selectedFile 
                ? 'border-green-400 bg-green-50 dark:bg-green-900/20' 
                : 'border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-900 dark:bg-surface-700/30 hover:border-blue-400 hover:bg-primary-50 dark:hover:bg-primary-900/10'
            }`}>
              <input
                type="file"
                id="proof-upload"
                accept="image/jpeg,image/jpg,image/png,application/pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              
              <label
                htmlFor="proof-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                {selectedFile ? (
                  <>
                    <FaCheckCircle className="text-6xl text-green-500 mb-4 animate-bounce" />
                    <p className="text-surface-900 dark:text-white font-bold text-lg mb-2">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-surface-600 dark:text-surface-400">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </>
                ) : (
                  <>
                    <div className="bg-primary-100 dark:bg-primary-900/30 p-6 rounded-full mb-4">
                      <FaUpload className="text-5xl text-primary-600 dark:text-primary-400" />
                    </div>
                    <p className="text-surface-900 dark:text-white font-bold text-xl mb-2">
                      Seleccionar archivo
                    </p>
                    <p className="text-surface-600 dark:text-surface-400 mb-1">
                      Haga clic o arrastre el archivo aquí
                    </p>
                    <p className="text-sm text-surface-500 dark:text-surface-400">
                      JPG, PNG o PDF (máx. 5MB)
                    </p>
                  </>
                )}
              </label>
            </div>

            {selectedFile && (
              <div className="mt-6 flex gap-4">
                <button
                  onClick={() => setSelectedFile(null)}
                  className="flex-1 px-6 py-4 border-2 border-surface-300 dark:border-surface-600 text-surface-700 dark:text-surface-300 rounded-xl hover:bg-surface-100 dark:bg-surface-800 dark:hover:bg-surface-700 transition-all duration-200 font-semibold text-lg"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className="flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {uploading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Cargando...
                    </span>
                  ) : (
                    'Subir Comprobante'
                  )}
                </button>
              </div>
            )}

            <div className="mt-6 text-center">
              <button
                onClick={() => navigate('/pedidos')}
                className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold text-lg hover:underline transition-colors"
              >
                Cargar más tarde desde Mis Pedidos →
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-2 border-green-300 dark:border-green-700 rounded-2xl p-10 text-center shadow-xl">
            <div className="bg-green-100 dark:bg-green-900/30 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <FaCheckCircle className="text-green-600 dark:text-green-400 text-6xl" />
            </div>
            <h2 className="text-3xl font-bold text-green-800 dark:text-green-300 mb-3">
              ¡Comprobante Cargado Exitosamente!
            </h2>
            <p className="text-green-700 dark:text-green-400 mb-8 text-lg max-w-2xl mx-auto">
              Su comprobante fue recibido correctamente. Nuestro equipo verificará el pago y actualizará el estado de su pedido en un plazo de 24-48 horas.
            </p>
            <button
              onClick={() => navigate('/pedidos')}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Ver Mis Pedidos
            </button>
          </div>
        )}

        {/* Instrucciones - Card Informativo */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-300 dark:border-amber-700 rounded-2xl p-8 shadow-lg">
          <div className="flex items-start gap-4 mb-4">
            <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-xl">
              <FaInfoCircle className="text-amber-600 dark:text-amber-400 text-3xl" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-amber-900 dark:text-amber-300 mb-2">
                Instrucciones Importantes
              </h3>
              <p className="text-amber-700 dark:text-amber-400">
                Por favor, tenga en cuenta las siguientes indicaciones:
              </p>
            </div>
          </div>
          
          <div className="space-y-3 ml-2">
            <div className="flex items-start gap-3 p-4 bg-white/50 dark:bg-surface-800/50 rounded-xl">
              <FaCheckCircle className="text-green-500 text-xl flex-shrink-0 mt-0.5" />
              <p className="text-amber-800 dark:text-amber-300 font-medium">
                Asegúrese de transferir el <strong>monto exacto</strong> indicado: ${parseFloat(total).toFixed(2)} ARS
              </p>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-white/50 dark:bg-surface-800/50 rounded-xl">
              <FaCheckCircle className="text-green-500 text-xl flex-shrink-0 mt-0.5" />
              <p className="text-amber-800 dark:text-amber-300 font-medium">
                Use el número de orden <strong>#{orderNumber}</strong> como referencia si es posible
              </p>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-white/50 dark:bg-surface-800/50 rounded-xl">
              <FaCheckCircle className="text-green-500 text-xl flex-shrink-0 mt-0.5" />
              <p className="text-amber-800 dark:text-amber-300 font-medium">
                Conserve el comprobante de la transferencia hasta que confirmemos el pago
              </p>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-white/50 dark:bg-surface-800/50 rounded-xl">
              <FaCheckCircle className="text-green-500 text-xl flex-shrink-0 mt-0.5" />
              <p className="text-amber-800 dark:text-amber-300 font-medium">
                El pedido será procesado una vez verificado el pago (<strong>24-48 horas hábiles</strong>)
              </p>
            </div>
            
            <div className="flex items-start gap-3 p-4 bg-white/50 dark:bg-surface-800/50 rounded-xl">
              <FaCheckCircle className="text-green-500 text-xl flex-shrink-0 mt-0.5" />
              <p className="text-amber-800 dark:text-amber-300 font-medium">
                Recibirá un <strong>email de confirmación</strong> cuando su pago sea validado
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

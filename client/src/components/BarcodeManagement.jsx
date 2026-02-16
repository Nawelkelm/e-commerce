import { useState, useEffect } from 'react';
import { 
  QrCodeIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  CheckCircleIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../services/api';

const BARCODE_TYPES = [
  { value: 'EAN13', label: 'EAN-13 (Europeo)', description: '13 dígitos, estándar internacional' },
  { value: 'UPC', label: 'UPC-A (Americano)', description: '12 dígitos, estándar USA' },
  { value: 'CODE128', label: 'Code 128', description: 'Alfanumérico, alta densidad' },
  { value: 'CODE39', label: 'Code 39', description: 'Alfanumérico, industrial' },
  { value: 'QR', label: 'QR Code', description: 'Código 2D, multifuncional' },
  { value: 'DATAMATRIX', label: 'Data Matrix', description: 'Código 2D, espacios pequeños' },
  { value: 'INTERNAL', label: 'Código Interno', description: 'Sistema propio' }
];

const BarcodeManagement = ({ productId }) => {
  const [barcodes, setBarcodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchMode, setSearchMode] = useState(false);
  const [searchCode, setSearchCode] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    type: 'EAN13',
    isPrimary: false
  });

  useEffect(() => {
    if (productId) {
      fetchBarcodes();
    }
  }, [productId]);

  const fetchBarcodes = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/${productId}/barcodes`);
      setBarcodes(response.data);
    } catch (error) {
      console.error('Error fetching barcodes:', error);
      toast.error('Error al cargar los códigos de barras');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      code: '',
      type: 'EAN13',
      isPrimary: false
    });
  };

  const handleAddBarcode = async (e) => {
    e.preventDefault();

    try {
      await api.post(`/stock/barcodes`, {
        productId,
        ...formData
      });
      
      toast.success('Código de barras agregado exitosamente');
      setShowModal(false);
      resetForm();
      fetchBarcodes();
    } catch (error) {
      console.error('Error adding barcode:', error);
      toast.error(error.response?.data?.message || 'Error al agregar el código de barras');
    }
  };

  const handleDeleteBarcode = async (barcodeId) => {
    if (!confirm('¿Estás seguro de eliminar este código de barras?')) {
      return;
    }

    try {
      await api.delete(`/stock/barcodes/${barcodeId}`);
      toast.success('Código de barras eliminado');
      fetchBarcodes();
    } catch (error) {
      console.error('Error deleting barcode:', error);
      toast.error('Error al eliminar el código de barras');
    }
  };

  const handleSetPrimary = async (barcodeId) => {
    try {
      await api.patch(`/stock/barcodes/${barcodeId}/primary`);
      toast.success('Código principal actualizado');
      fetchBarcodes();
    } catch (error) {
      console.error('Error setting primary:', error);
      toast.error('Error al actualizar el código principal');
    }
  };

  const handleSearch = async () => {
    if (!searchCode.trim()) {
      toast.error('Ingresa un código para buscar');
      return;
    }

    try {
      const response = await api.get(`/stock/barcodes/${encodeURIComponent(searchCode)}/search`);
      setSearchResults(response.data);
      
      if (!response.data) {
        toast.error('No se encontró ningún producto con ese código');
      }
    } catch (error) {
      console.error('Error searching barcode:', error);
      toast.error('Error al buscar el código');
      setSearchResults(null);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Código copiado al portapapeles');
  };

  const generateRandomCode = () => {
    const type = formData.type;
    let code = '';
    
    switch (type) {
      case 'EAN13':
        code = Math.floor(Math.random() * 1000000000000).toString().padStart(12, '0');
        // Calculate check digit
        let sum = 0;
        for (let i = 0; i < 12; i++) {
          sum += parseInt(code[i]) * (i % 2 === 0 ? 1 : 3);
        }
        const checkDigit = (10 - (sum % 10)) % 10;
        code = code + checkDigit;
        break;
      case 'UPC':
        code = Math.floor(Math.random() * 100000000000).toString().padStart(11, '0');
        // Calculate check digit
        let upcSum = 0;
        for (let i = 0; i < 11; i++) {
          upcSum += parseInt(code[i]) * (i % 2 === 0 ? 3 : 1);
        }
        const upcCheck = (10 - (upcSum % 10)) % 10;
        code = code + upcCheck;
        break;
      case 'INTERNAL':
        code = 'INT-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        break;
      default:
        code = Math.random().toString(36).substr(2, 12).toUpperCase();
    }
    
    handleInputChange('code', code);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <QrCodeIcon className="h-7 w-7" />
          Códigos de Barras
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setSearchMode(!searchMode)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              searchMode
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
            Buscar
          </button>
          {!searchMode && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <PlusIcon className="h-5 w-5" />
              Agregar Código
            </button>
          )}
        </div>
      </div>

      {/* Search Mode */}
      {searchMode ? (
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Escanea o ingresa un código de barras..."
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              autoFocus
            />
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Buscar
            </button>
          </div>

          {searchResults && (
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-green-50 dark:bg-green-900/20">
              <div className="flex items-start gap-4">
                {searchResults.product.images?.[0] && (
                  <img
                    src={searchResults.product.images[0]}
                    alt={searchResults.product.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                    {searchResults.product.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    SKU: {searchResults.product.sku} | Stock: {searchResults.product.stock}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${searchResults.product.price}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      searchResults.isPrimary
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {searchResults.type} {searchResults.isPrimary && '(Principal)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Barcodes List */}
          {barcodes.length === 0 ? (
            <div className="text-center py-12">
              <QrCodeIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No hay códigos de barras registrados</p>
              <button
                onClick={() => setShowModal(true)}
                className="mt-4 text-blue-600 dark:text-blue-400 hover:underline"
              >
                Agregar el primer código
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {barcodes.map((barcode) => (
                <div
                  key={barcode.id}
                  className={`p-4 border-2 rounded-lg ${
                    barcode.isPrimary
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <QrCodeIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <span className="font-mono text-lg font-bold text-gray-900 dark:text-white">
                          {barcode.code}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {BARCODE_TYPES.find(t => t.value === barcode.type)?.label || barcode.type}
                        </span>
                        {barcode.isPrimary && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 rounded text-xs font-medium flex items-center gap-1">
                            <CheckCircleIcon className="h-3 w-3" />
                            Principal
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleCopyCode(barcode.code)}
                        className="p-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                        title="Copiar código"
                      >
                        <DocumentDuplicateIcon className="h-5 w-5" />
                      </button>
                      {!barcode.isPrimary && (
                        <>
                          <button
                            onClick={() => handleSetPrimary(barcode.id)}
                            className="p-2 text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400"
                            title="Marcar como principal"
                          >
                            <CheckCircleIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBarcode(barcode.id)}
                            className="p-2 text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                            title="Eliminar"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {BARCODE_TYPES.find(t => t.value === barcode.type)?.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Agregar Código de Barras
              </h3>
              
              <form onSubmit={handleAddBarcode} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tipo de Código *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    {BARCODE_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {BARCODE_TYPES.find(t => t.value === formData.type)?.description}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Código *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => handleInputChange('code', e.target.value)}
                      required
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                      placeholder="Escanea o ingresa el código"
                    />
                    <button
                      type="button"
                      onClick={generateRandomCode}
                      className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-sm"
                      title="Generar código aleatorio"
                    >
                      Auto
                    </button>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isPrimary"
                    checked={formData.isPrimary}
                    onChange={(e) => handleInputChange('isPrimary', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isPrimary" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Marcar como código principal
                  </label>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Agregar Código
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BarcodeManagement;

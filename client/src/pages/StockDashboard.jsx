import { useState, useEffect } from 'react';
import { 
  ChartBarIcon,
  ClockIcon,
  QrCodeIcon,
  QueueListIcon,
  BellAlertIcon,
  CubeIcon,
  MagnifyingGlassIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../services/api';
import StockMovementHistory from '../components/StockMovementHistory';
import BatchManagement from '../components/BatchManagement';
import BarcodeManagement from '../components/BarcodeManagement';
import StockAlertsPanel from '../components/StockAlertsPanel';

const TABS = [
  { id: 'alerts', name: 'Alertas', icon: BellAlertIcon },
  { id: 'movements', name: 'Historial de Movimientos', icon: ClockIcon },
  { id: 'batches', name: 'Gestión de Lotes', icon: QueueListIcon },
  { id: 'barcodes', name: 'Códigos de Barras', icon: QrCodeIcon }
];

const StockDashboard = () => {
  const [activeTab, setActiveTab] = useState('alerts');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/products');
      setProducts(response.data.products || response.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.sku?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleProductSelect = (product) => {
    setSelectedProduct(product.id);
    setShowProductSelector(false);
    setSearchQuery('');
    // Cambiar a la pestaña de lotes cuando se selecciona un producto
    if (activeTab === 'alerts') {
      setActiveTab('batches');
    }
  };

  const clearProductSelection = () => {
    setSelectedProduct(null);
  };

  const getSelectedProductData = () => {
    return products.find(p => p.id === selectedProduct);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'alerts':
        return <StockAlertsPanel />;
      case 'movements':
        return <StockMovementHistory productId={selectedProduct} />;
      case 'batches':
        return selectedProduct ? (
          <BatchManagement productId={selectedProduct} />
        ) : (
          <div className="bg-white dark:bg-surface-800 rounded-lg shadow-lg p-12 text-center">
            <QueueListIcon className="h-16 w-16 text-surface-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">
              Selecciona un Producto
            </h3>
            <p className="text-surface-600 dark:text-surface-400 mb-4">
              Para gestionar lotes, primero selecciona un producto desde el catálogo
            </p>
            <button
              onClick={() => setShowProductSelector(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              <CubeIcon className="h-5 w-5" />
              Seleccionar Producto
            </button>
          </div>
        );
      case 'barcodes':
        return selectedProduct ? (
          <BarcodeManagement productId={selectedProduct} />
        ) : (
          <div className="bg-white dark:bg-surface-800 rounded-lg shadow-lg p-12 text-center">
            <QrCodeIcon className="h-16 w-16 text-surface-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">
              Selecciona un Producto
            </h3>
            <p className="text-surface-600 dark:text-surface-400 mb-4">
              Para gestionar códigos de barras, primero selecciona un producto desde el catálogo
            </p>
            <button
              onClick={() => setShowProductSelector(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              <CubeIcon className="h-5 w-5" />
              Seleccionar Producto
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-3 mb-2">
            <div className="flex items-center gap-3">
              <ChartBarIcon className="h-10 w-10 text-primary-600 dark:text-primary-400" />
              <h1 className="text-4xl font-bold text-surface-900 dark:text-white">
                Panel de Gestión de Stock
              </h1>
            </div>
            <button
              onClick={() => setShowProductSelector(!showProductSelector)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
            >
              <CubeIcon className="h-5 w-5" />
              Seleccionar Producto
            </button>
          </div>
          <p className="text-surface-600 dark:text-surface-400 text-lg">
            Sistema avanzado de control de inventario con trazabilidad completa
          </p>
        </div>

        {/* Product Selector Modal */}
        {showProductSelector && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-surface-800 rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-surface-200 dark:border-surface-700">
                <h2 className="text-2xl font-bold text-surface-900 dark:text-white">
                  Seleccionar Producto
                </h2>
                <button
                  onClick={() => setShowProductSelector(false)}
                  className="text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:text-surface-300 dark:text-surface-400 dark:hover:text-surface-200"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="p-6 border-b border-surface-200 dark:border-surface-700">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-surface-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar por nombre o SKU..."
                    className="w-full pl-10 pr-4 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Products List */}
              <div className="flex-1 overflow-y-auto p-6">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
                    <p className="mt-4 text-surface-600 dark:text-surface-400">Cargando productos...</p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-8">
                    <CubeIcon className="h-12 w-12 text-surface-400 mx-auto mb-3" />
                    <p className="text-surface-600 dark:text-surface-400">No se encontraron productos</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredProducts.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleProductSelect(product)}
                        className="w-full flex items-center gap-4 p-4 border border-surface-200 dark:border-surface-700 rounded-lg hover:bg-surface-50 dark:bg-surface-900 dark:hover:bg-surface-700 transition-colors text-left"
                      >
                        {product.images && product.images[0] ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-surface-200 dark:bg-surface-700 rounded-lg flex items-center justify-center">
                            <CubeIcon className="h-8 w-8 text-surface-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-surface-900 dark:text-white">
                            {product.name}
                          </h3>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-sm text-surface-600 dark:text-surface-400">
                              SKU: {product.sku}
                            </span>
                            {product.isOwnProduction ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                                Producción Propia
                              </span>
                            ) : product.supplier ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                                {product.supplier.name}
                              </span>
                            ) : null}
                            <span className={`text-sm font-medium ${
                              product.stock > product.stockMin 
                                ? 'text-green-600 dark:text-green-400' 
                                : 'text-red-600 dark:text-red-400'
                            }`}>
                              Stock: {product.stock}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Selected Product Badge */}
        {selectedProduct && (
          <div className="mb-6 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CubeIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                <div>
                  <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">
                    Producto seleccionado:
                  </p>
                  <p className="text-lg font-bold text-primary-900 dark:text-blue-100">
                    {getSelectedProductData()?.name} <span className="text-sm font-normal text-primary-600 dark:text-primary-400">({getSelectedProductData()?.sku})</span>
                  </p>
                  {getSelectedProductData()?.isOwnProduction ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 mt-1">
                      Producción Propia
                    </span>
                  ) : getSelectedProductData()?.supplier ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300 mt-1">
                      Proveedor: {getSelectedProductData()?.supplier.name}
                    </span>
                  ) : null}
                </div>
              </div>
              <button
                onClick={clearProductSelection}
                className="text-primary-600 dark:text-primary-400 hover:text-primary-800 dark:hover:text-blue-200"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white dark:bg-surface-800 rounded-lg shadow mb-6">
          <div className="border-b border-surface-200 dark:border-surface-700">
            <nav className="flex -mb-px overflow-x-auto">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                        : 'border-transparent text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:text-surface-300 dark:hover:text-surface-300 hover:border-surface-300 dark:border-surface-600 dark:hover:border-surface-600'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="animate-fade-in">
          {renderTabContent()}
        </div>

        {/* Info Cards */}
        {activeTab === 'alerts' && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center gap-3 mb-3">
                <ClockIcon className="h-8 w-8" />
                <h3 className="text-lg font-semibold">Historial Completo</h3>
              </div>
              <p className="text-blue-100">
                Rastrea cada movimiento de stock con información detallada de usuario, fecha, cantidad y costos.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center gap-3 mb-3">
                <QueueListIcon className="h-8 w-8" />
                <h3 className="text-lg font-semibold">Control FIFO/FEFO</h3>
              </div>
              <p className="text-purple-100">
                Gestión de lotes por fecha de fabricación y vencimiento para una rotación óptima del inventario.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-lg p-6 text-white">
              <div className="flex items-center gap-3 mb-3">
                <QrCodeIcon className="h-8 w-8" />
                <h3 className="text-lg font-semibold">Códigos Múltiples</h3>
              </div>
              <p className="text-green-100">
                Soporte para EAN-13, UPC, QR, Code 128 y más. Escanea y gestiona productos al instante.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockDashboard;

import { useState, useEffect } from 'react';
import { 
  ClockIcon, 
  ArrowUpIcon, 
  ArrowDownIcon, 
  AdjustmentsHorizontalIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  ArrowsRightLeftIcon,
  DocumentArrowDownIcon,
  FunnelIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../services/api';

const MOVEMENT_TYPES = {
  purchase: { label: 'Compra', color: 'text-green-600 dark:text-green-400', icon: ArrowUpIcon },
  sale: { label: 'Venta', color: 'text-primary-600 dark:text-primary-400', icon: ArrowDownIcon },
  adjustment: { label: 'Ajuste', color: 'text-yellow-600 dark:text-yellow-400', icon: AdjustmentsHorizontalIcon },
  return: { label: 'Devolución', color: 'text-purple-600 dark:text-purple-400', icon: ArrowPathIcon },
  damage: { label: 'Merma/Daño', color: 'text-red-600 dark:text-red-400', icon: ExclamationTriangleIcon },
  transfer_in: { label: 'Transferencia Entrada', color: 'text-teal-600 dark:text-teal-400', icon: ArrowsRightLeftIcon },
  transfer_out: { label: 'Transferencia Salida', color: 'text-orange-600 dark:text-orange-400', icon: ArrowsRightLeftIcon },
  import: { label: 'Importación', color: 'text-primary-600 dark:text-primary-400', icon: DocumentArrowDownIcon }
};

const StockMovementHistory = ({ productId = null }) => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: '',
    startDate: '',
    endDate: '',
    productName: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetchMovements();
    if (productId) {
      fetchSummary();
    }
  }, [productId]);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (productId) params.append('productId', productId);
      if (filters.type) params.append('type', filters.type);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await api.get(`/stock/history?${params.toString()}`);
      setMovements(response.data);
    } catch (error) {
      console.error('Error fetching movements:', error);
      toast.error('Error al cargar el historial de movimientos');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await api.get(`/stock/history/${productId}/summary`);
      setSummary(response.data);
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const applyFilters = () => {
    fetchMovements();
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      startDate: '',
      endDate: '',
      productName: ''
    });
    setTimeout(() => fetchMovements(), 100);
  };

  const exportToExcel = async () => {
    try {
      const params = new URLSearchParams();
      if (productId) params.append('productId', productId);
      if (filters.type) params.append('type', filters.type);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const response = await api.get(`/stock/history/export?${params.toString()}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `movimientos_stock_${new Date().getTime()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Historial exportado exitosamente');
    } catch (error) {
      console.error('Error exporting:', error);
      toast.error('Error al exportar el historial');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-surface-800 rounded-lg shadow-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
            <ClockIcon className="h-7 w-7" />
            Historial de Movimientos
          </h2>
          {productId && summary && (
            <p className="text-sm text-surface-600 dark:text-surface-400 mt-1">
              Total movimientos: {summary.totalMovements} | 
              Entradas: {summary.totalIn} | 
              Salidas: {summary.totalOut}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-surface-100 dark:bg-surface-800 dark:bg-surface-700 text-surface-700 dark:text-surface-300 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors"
          >
            <FunnelIcon className="h-5 w-5" />
            Filtros
          </button>
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <DocumentArrowDownIcon className="h-5 w-5" />
            Exportar
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-6 p-4 bg-surface-50 dark:bg-surface-900 dark:bg-surface-700 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Tipo de Movimiento
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-surface-800 text-surface-900 dark:text-white"
              >
                <option value="">Todos</option>
                {Object.entries(MOVEMENT_TYPES).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-surface-800 text-surface-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Fecha Fin
              </label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-surface-800 text-surface-900 dark:text-white"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={applyFilters}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Aplicar
              </button>
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-surface-300 dark:bg-surface-600 text-surface-700 dark:text-surface-300 rounded-lg hover:bg-surface-400 dark:hover:bg-surface-500 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Movements List */}
      {movements.length === 0 ? (
        <div className="text-center py-12">
          <ClockIcon className="h-16 w-16 text-surface-400 mx-auto mb-4" />
          <p className="text-surface-600 dark:text-surface-400">No hay movimientos registrados</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-surface-200 dark:divide-surface-700">
            <thead className="bg-surface-50 dark:bg-surface-900 dark:bg-surface-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 dark:text-surface-300 uppercase tracking-wider">
                  Fecha
                </th>
                {!productId && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 dark:text-surface-300 uppercase tracking-wider">
                    Producto
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 dark:text-surface-300 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 dark:text-surface-300 uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 dark:text-surface-300 uppercase tracking-wider">
                  Stock Anterior
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 dark:text-surface-300 uppercase tracking-wider">
                  Stock Nuevo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 dark:text-surface-300 uppercase tracking-wider">
                  Costo Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 dark:text-surface-300 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-surface-500 dark:text-surface-400 dark:text-surface-300 uppercase tracking-wider">
                  Notas
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-surface-800 divide-y divide-surface-200 dark:divide-surface-700">
              {movements.map((movement) => {
                const typeConfig = MOVEMENT_TYPES[movement.type];
                const Icon = typeConfig?.icon || ClockIcon;
                
                return (
                  <tr key={movement.id} className="hover:bg-surface-50 dark:bg-surface-900 dark:hover:bg-surface-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-900 dark:text-white dark:text-surface-300">
                      {formatDate(movement.createdAt)}
                    </td>
                    {!productId && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-900 dark:text-white dark:text-surface-300">
                        {movement.product?.name || 'N/A'}
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`flex items-center gap-2 ${typeConfig?.color || 'text-surface-600'}`}>
                        <Icon className="h-5 w-5" />
                        <span className="text-sm font-medium">{typeConfig?.label || movement.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-surface-900 dark:text-white">
                      {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-600 dark:text-surface-400">
                      {movement.previousStock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-900 dark:text-white font-medium">
                      {movement.newStock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-900 dark:text-white">
                      {movement.totalCost ? formatCurrency(movement.totalCost) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-surface-600 dark:text-surface-400">
                      {movement.user?.name || 'Sistema'}
                    </td>
                    <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400 max-w-xs truncate">
                      {movement.notes || '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StockMovementHistory;

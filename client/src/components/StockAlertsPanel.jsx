import { useState, useEffect } from 'react';
import { 
  BellAlertIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  CheckCircleIcon,
  XMarkIcon,
  FunnelIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import api from '../services/api';

const SEVERITY_CONFIG = {
  critical: {
    label: 'Crítico',
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    borderColor: 'border-red-500',
    icon: ExclamationTriangleIcon
  },
  warning: {
    label: 'Advertencia',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    borderColor: 'border-yellow-500',
    icon: ExclamationCircleIcon
  },
  info: {
    label: 'Información',
    color: 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200',
    borderColor: 'border-primary-500',
    icon: InformationCircleIcon
  }
};

const ALERT_TYPES = {
  low_stock: 'Stock Bajo',
  out_of_stock: 'Sin Stock',
  expiring_soon: 'Próximo a Vencer',
  expired: 'Vencido',
  overstock: 'Sobre Stock',
  reorder_point: 'Punto de Reorden'
};

const StockAlertsPanel = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    severity: '',
    type: '',
    status: 'active'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    warning: 0,
    info: 0
  });

  useEffect(() => {
    fetchAlerts();
  }, [filters.status]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.severity) params.append('severity', filters.severity);
      if (filters.type) params.append('type', filters.type);
      if (filters.status) params.append('status', filters.status);

      const response = await api.get(`/stock/alerts?${params.toString()}`);
      const alertsData = response.data.alerts || [];
      setAlerts(alertsData);
      
      // Calculate stats
      const stats = {
        total: alertsData.length,
        critical: alertsData.filter(a => a.severity === 'critical').length,
        warning: alertsData.filter(a => a.severity === 'warning').length,
        info: alertsData.filter(a => a.severity === 'info').length
      };
      setStats(stats);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      toast.error('Error al cargar las alertas');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAlert = async (alertId, resolution) => {
    try {
      await api.patch(`/stock/alerts/${alertId}/resolve`, { resolution });
      toast.success('Alerta resuelta');
      fetchAlerts();
    } catch (error) {
      console.error('Error resolving alert:', error);
      toast.error('Error al resolver la alerta');
    }
  };

  const handleDismissAlert = async (alertId) => {
    if (!confirm('¿Deseas descartar esta alerta?')) return;
    
    await handleResolveAlert(alertId, 'Descartada por el usuario');
  };

  const applyFilters = () => {
    fetchAlerts();
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      severity: '',
      type: '',
      status: 'active'
    });
    setTimeout(() => fetchAlerts(), 100);
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

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    if (seconds < 60) return 'hace un momento';
    if (seconds < 3600) return `hace ${Math.floor(seconds / 60)} minutos`;
    if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)} horas`;
    if (seconds < 604800) return `hace ${Math.floor(seconds / 86400)} días`;
    return formatDate(date);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-surface-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-600 dark:text-surface-400">Total Alertas</p>
              <p className="text-3xl font-bold text-surface-900 dark:text-white">{stats.total}</p>
            </div>
            <BellAlertIcon className="h-12 w-12 text-surface-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-surface-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-600 dark:text-surface-400">Críticas</p>
              <p className="text-3xl font-bold text-red-600">{stats.critical}</p>
            </div>
            <ExclamationTriangleIcon className="h-12 w-12 text-red-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-surface-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-600 dark:text-surface-400">Advertencias</p>
              <p className="text-3xl font-bold text-yellow-600">{stats.warning}</p>
            </div>
            <ExclamationCircleIcon className="h-12 w-12 text-yellow-400" />
          </div>
        </div>

        <div className="bg-white dark:bg-surface-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-surface-600 dark:text-surface-400">Información</p>
              <p className="text-3xl font-bold text-primary-600">{stats.info}</p>
            </div>
            <InformationCircleIcon className="h-12 w-12 text-primary-400" />
          </div>
        </div>
      </div>

      {/* Main Panel */}
      <div className="bg-white dark:bg-surface-800 rounded-lg shadow-lg">
        {/* Header */}
        <div className="p-6 border-b border-surface-200 dark:border-surface-700">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
              <BellAlertIcon className="h-7 w-7" />
              Alertas de Stock
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-surface-100 dark:bg-surface-800 dark:bg-surface-700 text-surface-700 dark:text-surface-300 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors"
              >
                <FunnelIcon className="h-5 w-5" />
                Filtros
              </button>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="px-4 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-surface-800 dark:bg-surface-700 text-surface-900 dark:text-white"
              >
                <option value="active">Activas</option>
                <option value="resolved">Resueltas</option>
                <option value="">Todas</option>
              </select>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="p-4 bg-surface-50 dark:bg-surface-900 dark:bg-surface-700 border-b border-surface-200 dark:border-surface-700 dark:border-surface-600">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                  Severidad
                </label>
                <select
                  value={filters.severity}
                  onChange={(e) => setFilters(prev => ({ ...prev, severity: e.target.value }))}
                  className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-surface-800 text-surface-900 dark:text-white"
                >
                  <option value="">Todas</option>
                  <option value="critical">Crítica</option>
                  <option value="warning">Advertencia</option>
                  <option value="info">Información</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                  Tipo de Alerta
                </label>
                <select
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-surface-800 text-surface-900 dark:text-white"
                >
                  <option value="">Todos</option>
                  {Object.entries(ALERT_TYPES).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
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

        {/* Alerts List */}
        <div className="p-6">
          {alerts.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <p className="text-surface-600 dark:text-surface-400">
                {filters.status === 'active' ? '¡Todo en orden! No hay alertas activas.' : 'No hay alertas para mostrar.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => {
                const config = SEVERITY_CONFIG[alert.severity];
                const Icon = config.icon;
                
                return (
                  <div
                    key={alert.id}
                    className={`border-l-4 ${config.borderColor} bg-white dark:bg-surface-800 rounded-r-lg shadow p-4 hover:shadow-md transition-shadow`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4 flex-1">
                        <div className={`p-3 rounded-lg ${config.color}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${config.color}`}>
                              {config.label}
                            </span>
                            <span className="text-xs text-surface-500 dark:text-surface-400 flex items-center gap-1">
                              <ClockIcon className="h-3 w-3" />
                              {getTimeAgo(alert.createdAt)}
                            </span>
                          </div>
                          
                          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-1">
                            {ALERT_TYPES[alert.type] || alert.type}
                          </h3>
                          
                          <p className="text-surface-700 dark:text-surface-300 mb-2">
                            {alert.message}
                          </p>
                          
                          {alert.product && (
                            <Link
                              to={`/products/${alert.product.id}`}
                              className="inline-flex items-center gap-2 text-sm text-primary-600 dark:text-primary-400 hover:underline"
                            >
                              <span className="font-medium">{alert.product.name}</span>
                              <span className="text-surface-500 dark:text-surface-400">
                                (SKU: {alert.product.sku})
                              </span>
                            </Link>
                          )}
                          
                          {alert.metadata && (
                            <div className="mt-2 text-sm text-surface-600 dark:text-surface-400">
                              {alert.metadata.currentStock !== undefined && (
                                <span>Stock actual: <strong>{alert.metadata.currentStock}</strong></span>
                              )}
                              {alert.metadata.threshold !== undefined && (
                                <span className="ml-4">Umbral: <strong>{alert.metadata.threshold}</strong></span>
                              )}
                              {alert.metadata.daysUntilExpiration !== undefined && (
                                <span className="ml-4">Días hasta vencer: <strong>{alert.metadata.daysUntilExpiration}</strong></span>
                              )}
                            </div>
                          )}
                          
                          {alert.resolvedAt && (
                            <div className="mt-2 text-sm text-green-600 dark:text-green-400">
                              ✓ Resuelta el {formatDate(alert.resolvedAt)}
                              {alert.resolution && <span> - {alert.resolution}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {!alert.resolvedAt && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleResolveAlert(alert.id, 'Gestionado manualmente')}
                            className="p-2 text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-surface-700 rounded-lg transition-colors"
                            title="Marcar como resuelta"
                          >
                            <CheckCircleIcon className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDismissAlert(alert.id)}
                            className="p-2 text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:bg-surface-800 dark:text-surface-400 dark:hover:bg-surface-700 rounded-lg transition-colors"
                            title="Descartar"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockAlertsPanel;

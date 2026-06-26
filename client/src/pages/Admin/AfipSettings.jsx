import { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ArrowPathIcon,
  DocumentTextIcon,
  ClipboardDocumentCheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const AfipSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [credentials, setCredentials] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [stats, setStats] = useState(null);
  
  const [formData, setFormData] = useState({
    name: 'Configuración Principal',
    cuit: '',
    businessName: '',
    certificate: '',
    privateKey: '',
    pointOfSale: 1,
    production: false,
    taxCategory: 'responsable_inscripto',
    address: '',
    city: '',
    postalCode: '',
    province: '',
    iibbNumber: '',
    activityStartDate: ''
  });

  const [activeTab, setActiveTab] = useState('config'); // config, connection, stats

  useEffect(() => {
    loadCredentials();
    loadStats();
  }, []);

  const loadCredentials = async () => {
    try {
      const token = Cookies.get('token');
      const response = await fetch('/api/afip/credentials', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setCredentials(data.data);
          setFormData({
            name: data.data.name || 'Configuración Principal',
            cuit: data.data.cuit || '',
            businessName: data.data.businessName || '',
            certificate: '', // No mostrar por seguridad
            privateKey: '', // No mostrar por seguridad
            pointOfSale: data.data.pointOfSale || 1,
            production: data.data.production || false,
            taxCategory: data.data.taxCategory || 'responsable_inscripto',
            address: data.data.address || '',
            city: data.data.city || '',
            postalCode: data.data.postalCode || '',
            province: data.data.province || '',
            iibbNumber: data.data.iibbNumber || '',
            activityStartDate: data.data.activityStartDate || ''
          });
        }
      }
    } catch (error) {
      console.error('Error loading credentials:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const token = Cookies.get('token');
      const response = await fetch('/api/afip/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        }
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const testConnection = async () => {
    setTesting(true);
    try {
      const token = Cookies.get('token');
      const response = await fetch('/api/afip/test-connection', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();
      setConnectionStatus(data);
      
      if (data.success) {
        alert('✅ Conexión exitosa con AFIP');
      } else {
        alert(`❌ Error: ${data.message}\n${data.error || ''}`);
      }
    } catch (error) {
      setConnectionStatus({
        success: false,
        message: 'Error al conectar',
        error: error.message
      });
      alert(`❌ Error: ${error.message}`);
    } finally {
      setTesting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const token = Cookies.get('token');
      
      // Validar CUIT
      if (formData.cuit && formData.cuit.length !== 11) {
        alert('El CUIT debe tener 11 dígitos (sin guiones)');
        setSaving(false);
        return;
      }

      const response = await fetch('/api/afip/credentials', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Credenciales guardadas exitosamente');
        loadCredentials();
      } else {
        alert(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = (field, event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          [field]: e.target.result
        }));
      };
      reader.readAsText(file);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white">
            Configuración AFIP
          </h1>
          <p className="mt-2 text-surface-600 dark:text-surface-400 dark:text-surface-300">
            Sistema de facturación electrónica de Argentina
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-surface-200 dark:border-surface-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('config')}
                className={`${
                  activeTab === 'config'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:text-surface-300 hover:border-surface-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                <ClipboardDocumentCheckIcon className="h-5 w-5 inline mr-2" />
                Configuración
              </button>
              <button
                onClick={() => setActiveTab('connection')}
                className={`${
                  activeTab === 'connection'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:text-surface-300 hover:border-surface-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                <ArrowPathIcon className="h-5 w-5 inline mr-2" />
                Conexión
              </button>
              <button
                onClick={() => setActiveTab('stats')}
                className={`${
                  activeTab === 'stats'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:text-surface-300 hover:border-surface-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                <DocumentTextIcon className="h-5 w-5 inline mr-2" />
                Estadísticas
              </button>
            </nav>
          </div>
        </div>

        {/* Configuration Tab */}
        {activeTab === 'config' && (
          <div className="bg-white dark:bg-surface-800 shadow rounded-lg p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* CUIT y Razón Social */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                    CUIT *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength="11"
                    placeholder="20123456789 (sin guiones)"
                    value={formData.cuit}
                    onChange={(e) => setFormData({ ...formData, cuit: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-4 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                    Razón Social *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Mi Empresa S.A."
                    value={formData.businessName}
                    onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                    className="w-full px-4 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Certificados */}
              <div className="border-t border-surface-200 dark:border-surface-700 pt-6">
                <h3 className="text-lg font-medium text-surface-900 dark:text-white mb-4">
                  Certificados Digitales
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Certificado (.crt) *
                    </label>
                    <input
                      type="file"
                      accept=".crt,.pem"
                      onChange={(e) => handleFileUpload('certificate', e)}
                      className="w-full px-4 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 dark:bg-surface-700 text-surface-900 dark:text-white"
                    />
                    {credentials?.hasCredentials && (
                      <p className="mt-2 text-sm text-green-600">
                        ✓ Certificado configurado
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Clave Privada (.key) *
                    </label>
                    <input
                      type="file"
                      accept=".key,.pem"
                      onChange={(e) => handleFileUpload('privateKey', e)}
                      className="w-full px-4 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 dark:bg-surface-700 text-surface-900 dark:text-white"
                    />
                    {credentials?.hasCredentials && (
                      <p className="mt-2 text-sm text-green-600">
                        ✓ Clave privada configurada
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Configuración Fiscal */}
              <div className="border-t border-surface-200 dark:border-surface-700 pt-6">
                <h3 className="text-lg font-medium text-surface-900 dark:text-white mb-4">
                  Configuración Fiscal
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Categoría Tributaria *
                    </label>
                    <select
                      value={formData.taxCategory}
                      onChange={(e) => setFormData({ ...formData, taxCategory: e.target.value })}
                      className="w-full px-4 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="responsable_inscripto">Responsable Inscripto</option>
                      <option value="responsable_monotributo">Monotributo</option>
                      <option value="exento">Exento</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Punto de Venta *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="9999"
                      required
                      value={formData.pointOfSale}
                      onChange={(e) => setFormData({ ...formData, pointOfSale: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Ambiente
                    </label>
                    <select
                      value={formData.production}
                      onChange={(e) => setFormData({ ...formData, production: e.target.value === 'true' })}
                      className="w-full px-4 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="false">Testing (Homologación)</option>
                      <option value="true">Producción</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Dirección */}
              <div className="border-t border-surface-200 dark:border-surface-700 pt-6">
                <h3 className="text-lg font-medium text-surface-900 dark:text-white mb-4">
                  Datos Adicionales
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Dirección
                    </label>
                    <input
                      type="text"
                      placeholder="Av. Corrientes 1234"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      placeholder="Buenos Aires"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Código Postal
                    </label>
                    <input
                      type="text"
                      placeholder="C1043"
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className="w-full px-4 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Provincia
                    </label>
                    <input
                      type="text"
                      placeholder="Buenos Aires"
                      value={formData.province}
                      onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                      className="w-full px-4 py-2 border border-surface-300 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 dark:bg-surface-700 text-surface-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-surface-200 dark:border-surface-700">
                <button
                  type="button"
                  onClick={loadCredentials}
                  className="px-6 py-2 border border-surface-300 dark:border-surface-600 rounded-lg text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:bg-surface-900 dark:hover:bg-surface-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Guardando...' : 'Guardar Configuración'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Connection Tab */}
        {activeTab === 'connection' && (
          <div className="bg-white dark:bg-surface-800 shadow rounded-lg p-6">
            <div className="space-y-6">
              {/* Estado Actual */}
              <div>
                <h3 className="text-lg font-medium text-surface-900 dark:text-white mb-4">
                  Estado de Conexión
                </h3>
                
                {credentials ? (
                  <div className="bg-surface-50 dark:bg-surface-900 dark:bg-surface-700 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                        Estado:
                      </span>
                      <span className={`flex items-center gap-2 ${
                        credentials.connectionStatus === 'connected' ? 'text-green-600' :
                        credentials.connectionStatus === 'error' ? 'text-red-600' :
                        'text-yellow-600'
                      }`}>
                        {credentials.connectionStatus === 'connected' && <CheckCircleIcon className="h-5 w-5" />}
                        {credentials.connectionStatus === 'error' && <XCircleIcon className="h-5 w-5" />}
                        {credentials.connectionStatus === 'not_configured' && <ExclamationTriangleIcon className="h-5 w-5" />}
                        {credentials.connectionStatus === 'connected' ? 'Conectado' :
                         credentials.connectionStatus === 'error' ? 'Error' :
                         'No Configurado'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                        Ambiente:
                      </span>
                      <span className="text-sm text-surface-900 dark:text-white">
                        {credentials.production ? '🔴 Producción' : '🟢 Testing'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                        CUIT:
                      </span>
                      <span className="text-sm text-surface-900 dark:text-white font-mono">
                        {credentials.cuit?.replace(/(\d{2})(\d{8})(\d{1})/, '$1-$2-$3')}
                      </span>
                    </div>

                    {credentials.lastConnectionTest && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                          Última prueba:
                        </span>
                        <span className="text-sm text-surface-900 dark:text-white">
                          {new Date(credentials.lastConnectionTest).toLocaleString('es-AR')}
                        </span>
                      </div>
                    )}

                    {credentials.lastError && (
                      <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded">
                        <p className="text-sm text-red-800 dark:text-red-200">
                          <strong>Último error:</strong> {credentials.lastError}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      No hay credenciales AFIP configuradas
                    </p>
                  </div>
                )}
              </div>

              {/* Test de Conexión */}
              <div className="border-t border-surface-200 dark:border-surface-700 pt-6">
                <button
                  onClick={testConnection}
                  disabled={testing || !credentials}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowPathIcon className={`h-5 w-5 ${testing ? 'animate-spin' : ''}`} />
                  {testing ? 'Probando conexión...' : 'Probar Conexión con AFIP'}
                </button>
              </div>

              {/* Resultado del Test */}
              {connectionStatus && (
                <div className={`p-4 rounded-lg ${
                  connectionStatus.success 
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                }`}>
                  <div className="flex items-start gap-3">
                    {connectionStatus.success ? (
                      <CheckCircleIcon className="h-6 w-6 text-green-600 flex-shrink-0" />
                    ) : (
                      <XCircleIcon className="h-6 w-6 text-red-600 flex-shrink-0" />
                    )}
                    <div className="flex-1">
                      <h4 className={`font-medium ${
                        connectionStatus.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                      }`}>
                        {connectionStatus.message}
                      </h4>
                      {connectionStatus.data && (
                        <pre className="mt-2 text-sm text-surface-700 dark:text-surface-300 overflow-auto">
                          {JSON.stringify(connectionStatus.data, null, 2)}
                        </pre>
                      )}
                      {connectionStatus.error && (
                        <p className="mt-2 text-sm text-red-700 dark:text-red-300">
                          {connectionStatus.error}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div className="bg-white dark:bg-surface-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-surface-900 dark:text-white mb-6">
              Estadísticas de Facturación Electrónica
            </h3>

            {stats ? (
              <div className="space-y-6">
                {/* Por Estado */}
                <div>
                  <h4 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">
                    Por Estado de Autorización
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.byStatus && stats.byStatus.map((item) => (
                      <div key={item.afipStatus} className="bg-surface-50 dark:bg-surface-900 dark:bg-surface-700 rounded-lg p-4">
                        <div className="text-sm text-surface-600 dark:text-surface-400 mb-1">
                          {item.afipStatus === 'authorized' && '✅ Autorizadas'}
                          {item.afipStatus === 'pending' && '⏳ Pendientes'}
                          {item.afipStatus === 'rejected' && '❌ Rechazadas'}
                          {item.afipStatus === 'error' && '⚠️ Con Error'}
                        </div>
                        <div className="text-2xl font-bold text-surface-900 dark:text-white">
                          {item.count}
                        </div>
                        <div className="text-sm text-surface-600 dark:text-surface-400 mt-1">
                          ${parseFloat(item.total || 0).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Por Tipo */}
                <div className="border-t border-surface-200 dark:border-surface-700 pt-6">
                  <h4 className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">
                    Por Tipo de Factura (Autorizadas)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {stats.byType && stats.byType.map((item) => (
                      <div key={item.invoiceType} className="bg-surface-50 dark:bg-surface-900 dark:bg-surface-700 rounded-lg p-4">
                        <div className="text-sm text-surface-600 dark:text-surface-400 mb-1">
                          Factura {item.invoiceType}
                        </div>
                        <div className="text-2xl font-bold text-surface-900 dark:text-white">
                          {item.count}
                        </div>
                        <div className="text-sm text-surface-600 dark:text-surface-400 mt-1">
                          ${parseFloat(item.total || 0).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-surface-500 dark:text-surface-400">
                No hay datos disponibles
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AfipSettings;

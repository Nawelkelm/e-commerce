import { useState, useEffect } from 'react';
import { 
  QueueListIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../services/api';

const BatchManagement = ({ productId }) => {
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBatch, setEditingBatch] = useState(null);
  const [formData, setFormData] = useState({
    batchNumber: '',
    quantity: '',
    manufacturingDate: '',
    expirationDate: '',
    unitCost: '',
    supplier: '',
    notes: ''
  });

  useEffect(() => {
    if (productId) {
      fetchBatches();
    }
  }, [productId]);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/${productId}/batches`);
      setBatches(response.data.batches || []);
    } catch (error) {
      console.error('Error fetching batches:', error);
      toast.error('Error al cargar los lotes');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      batchNumber: '',
      quantity: '',
      manufacturingDate: '',
      expirationDate: '',
      unitCost: '',
      supplier: '',
      notes: ''
    });
    setEditingBatch(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (batch) => {
    setEditingBatch(batch);
    setFormData({
      batchNumber: batch.batchNumber,
      quantity: batch.quantity.toString(),
      manufacturingDate: batch.manufacturingDate?.split('T')[0] || '',
      expirationDate: batch.expirationDate?.split('T')[0] || '',
      unitCost: batch.unitCost?.toString() || '',
      supplier: batch.supplier || '',
      notes: batch.notes || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const data = {
        ...formData,
        quantity: parseInt(formData.quantity),
        unitCost: formData.unitCost ? parseFloat(formData.unitCost) : null
      };

      if (editingBatch) {
        await api.put(`/stock/batches/${editingBatch.id}`, data);
        toast.success('Lote actualizado exitosamente');
      } else {
        await api.post(`/products/${productId}/batches`, data);
        toast.success('Lote agregado exitosamente');
      }

      setShowModal(false);
      resetForm();
      fetchBatches();
    } catch (error) {
      console.error('Error saving batch:', error);
      toast.error(error.response?.data?.message || 'Error al guardar el lote');
    }
  };

  const handleUpdateQuantity = async (batchId, newQuantity, reason) => {
    try {
      await api.patch(`/stock/batches/${batchId}/quantity`, {
        quantity: parseInt(newQuantity),
        reason
      });
      toast.success('Cantidad actualizada');
      fetchBatches();
    } catch (error) {
      console.error('Error updating quantity:', error);
      toast.error('Error al actualizar la cantidad');
    }
  };

  const getExpirationStatus = (batch) => {
    const daysUntilExpiration = batch.daysUntilExpiration;
    
    if (batch.status === 'expired') {
      return { label: 'Vencido', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: XCircleIcon };
    } else if (daysUntilExpiration <= 7) {
      return { label: `Vence en ${daysUntilExpiration}d`, color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: ExclamationTriangleIcon };
    } else if (daysUntilExpiration <= 30) {
      return { label: `Vence en ${daysUntilExpiration}d`, color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: ClockIcon };
    } else if (batch.status === 'consumed') {
      return { label: 'Consumido', color: 'bg-surface-100 dark:bg-surface-800 text-surface-800 dark:bg-surface-700 dark:text-surface-300', icon: CheckCircleIcon };
    } else {
      return { label: 'Activo', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: CheckCircleIcon };
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return '-';
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
        <h2 className="text-2xl font-bold text-surface-900 dark:text-white flex items-center gap-2">
          <QueueListIcon className="h-7 w-7" />
          Gestión de Lotes (FIFO/FEFO)
        </h2>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Nuevo Lote
        </button>
      </div>

      {/* Batches List */}
      {batches.length === 0 ? (
        <div className="text-center py-12">
          <QueueListIcon className="h-16 w-16 text-surface-400 mx-auto mb-4" />
          <p className="text-surface-600 dark:text-surface-400">No hay lotes registrados</p>
          <button
            onClick={openAddModal}
            className="mt-4 text-primary-600 dark:text-primary-400 hover:underline"
          >
            Agregar el primer lote
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {batches.map((batch, index) => {
            const status = getExpirationStatus(batch);
            const StatusIcon = status.icon;
            
            return (
              <div
                key={batch.id}
                className="border border-surface-200 dark:border-surface-700 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg font-bold text-surface-900 dark:text-white">
                        Lote #{batch.batchNumber}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
                        <StatusIcon className="h-4 w-4" />
                        {status.label}
                      </span>
                      {index === 0 && batch.status === 'active' && (
                        <span className="px-2 py-1 bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 rounded text-xs font-medium">
                          Siguiente a usar
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-surface-600 dark:text-surface-400">Cantidad:</span>
                        <span className="ml-2 font-semibold text-surface-900 dark:text-white">
                          {batch.quantity} unidades
                        </span>
                      </div>
                      <div>
                        <span className="text-surface-600 dark:text-surface-400">Fabricación:</span>
                        <span className="ml-2 text-surface-900 dark:text-white">
                          {formatDate(batch.manufacturingDate)}
                        </span>
                      </div>
                      <div>
                        <span className="text-surface-600 dark:text-surface-400">Vencimiento:</span>
                        <span className="ml-2 text-surface-900 dark:text-white">
                          {formatDate(batch.expirationDate)}
                        </span>
                      </div>
                      <div>
                        <span className="text-surface-600 dark:text-surface-400">Costo Unit.:</span>
                        <span className="ml-2 text-surface-900 dark:text-white">
                          {formatCurrency(batch.unitCost)}
                        </span>
                      </div>
                    </div>
                    {batch.supplier && (
                      <div className="mt-2 text-sm">
                        <span className="text-surface-600 dark:text-surface-400">Proveedor:</span>
                        <span className="ml-2 text-surface-900 dark:text-white">{batch.supplier}</span>
                      </div>
                    )}
                    {batch.notes && (
                      <div className="mt-2 text-sm text-surface-600 dark:text-surface-400">
                        <span className="font-medium">Notas:</span> {batch.notes}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(batch)}
                      className="p-2 text-primary-600 hover:bg-primary-50 dark:text-primary-400 dark:hover:bg-surface-700 rounded-lg transition-colors"
                      title="Editar lote"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                
                {/* Quick Quantity Adjustment */}
                {batch.status === 'active' && (
                  <div className="mt-3 pt-3 border-t border-surface-200 dark:border-surface-700">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-surface-600 dark:text-surface-400">Ajuste rápido:</span>
                      <button
                        onClick={() => handleUpdateQuantity(batch.id, batch.quantity - 1, 'Ajuste manual')}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-800"
                      >
                        -1
                      </button>
                      <button
                        onClick={() => handleUpdateQuantity(batch.id, batch.quantity - 10, 'Ajuste manual')}
                        className="px-3 py-1 text-sm bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 rounded hover:bg-red-200 dark:hover:bg-red-800"
                      >
                        -10
                      </button>
                      <button
                        onClick={() => handleUpdateQuantity(batch.id, batch.quantity + 1, 'Ajuste manual')}
                        className="px-3 py-1 text-sm bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 rounded hover:bg-green-200 dark:hover:bg-green-800"
                      >
                        +1
                      </button>
                      <button
                        onClick={() => handleUpdateQuantity(batch.id, batch.quantity + 10, 'Ajuste manual')}
                        className="px-3 py-1 text-sm bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200 rounded hover:bg-green-200 dark:hover:bg-green-800"
                      >
                        +10
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-surface-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-4">
                {editingBatch ? 'Editar Lote' : 'Nuevo Lote'}
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Número de Lote *
                    </label>
                    <input
                      type="text"
                      value={formData.batchNumber}
                      onChange={(e) => handleInputChange('batchNumber', e.target.value)}
                      required
                      className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-surface-800 dark:bg-surface-700 text-surface-900 dark:text-white"
                      placeholder="Ej: LOTE-2024-001"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Cantidad *
                    </label>
                    <input
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => handleInputChange('quantity', e.target.value)}
                      required
                      min="0"
                      className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-surface-800 dark:bg-surface-700 text-surface-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Fecha de Fabricación
                    </label>
                    <input
                      type="date"
                      value={formData.manufacturingDate}
                      onChange={(e) => handleInputChange('manufacturingDate', e.target.value)}
                      className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-surface-800 dark:bg-surface-700 text-surface-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Fecha de Vencimiento
                    </label>
                    <input
                      type="date"
                      value={formData.expirationDate}
                      onChange={(e) => handleInputChange('expirationDate', e.target.value)}
                      className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-surface-800 dark:bg-surface-700 text-surface-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Costo Unitario
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.unitCost}
                      onChange={(e) => handleInputChange('unitCost', e.target.value)}
                      className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-surface-800 dark:bg-surface-700 text-surface-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                      Proveedor
                    </label>
                    <input
                      type="text"
                      value={formData.supplier}
                      onChange={(e) => handleInputChange('supplier', e.target.value)}
                      className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-surface-800 dark:bg-surface-700 text-surface-900 dark:text-white"
                      placeholder="Nombre del proveedor"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                    Notas
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border border-surface-300 dark:border-surface-600 rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-surface-800 dark:bg-surface-700 text-surface-900 dark:text-white"
                    placeholder="Información adicional del lote..."
                  />
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 text-surface-700 dark:text-surface-300 bg-surface-100 dark:bg-surface-800 dark:bg-surface-700 rounded-lg hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    {editingBatch ? 'Actualizar' : 'Agregar'} Lote
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

export default BatchManagement;

import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave } from 'react-icons/fa';
import '../../styles/Admin/CouponForm.css';

const CouponForm = ({ coupon, onClose }) => {
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minPurchase: '',
    maxDiscount: '',
    usageLimit: '',
    usageLimitPerUser: '1',
    startDate: '',
    endDate: '',
    isActive: true,
    isPublic: true,
    firstPurchaseOnly: false,
    stackable: false,
    applicableCategories: [],
    applicableProducts: [],
    excludedCategories: [],
    excludedProducts: []
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (coupon) {
      setFormData({
        code: coupon.code || '',
        description: coupon.description || '',
        discountType: coupon.discountType || 'percentage',
        discountValue: coupon.discountValue || '',
        minPurchase: coupon.minPurchase || '',
        maxDiscount: coupon.maxDiscount || '',
        usageLimit: coupon.usageLimit || '',
        usageLimitPerUser: coupon.usageLimitPerUser || '1',
        startDate: coupon.startDate ? coupon.startDate.split('T')[0] : '',
        endDate: coupon.endDate ? coupon.endDate.split('T')[0] : '',
        isActive: coupon.isActive !== undefined ? coupon.isActive : true,
        isPublic: coupon.isPublic !== undefined ? coupon.isPublic : true,
        firstPurchaseOnly: coupon.firstPurchaseOnly || false,
        stackable: coupon.stackable || false,
        applicableCategories: coupon.applicableCategories || [],
        applicableProducts: coupon.applicableProducts || [],
        excludedCategories: coupon.excludedCategories || [],
        excludedProducts: coupon.excludedProducts || []
      });
    }
  }, [coupon]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = 'El código es requerido';
    } else if (formData.code.length < 3) {
      newErrors.code = 'El código debe tener al menos 3 caracteres';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es requerida';
    }

    if (!formData.discountValue || formData.discountValue <= 0) {
      newErrors.discountValue = 'El valor del descuento debe ser mayor a 0';
    }

    if (formData.discountType === 'percentage' && formData.discountValue > 100) {
      newErrors.discountValue = 'El porcentaje no puede ser mayor a 100';
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.startDate) > new Date(formData.endDate)) {
        newErrors.endDate = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const url = coupon
        ? `http://localhost:5000/api/coupons/${coupon.id}`
        : 'http://localhost:5000/api/coupons';
      
      const method = coupon ? 'PUT' : 'POST';

      // Prepare data
      const submitData = {
        ...formData,
        code: formData.code.toUpperCase(),
        discountValue: parseFloat(formData.discountValue),
        minPurchase: formData.minPurchase ? parseFloat(formData.minPurchase) : null,
        maxDiscount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        usageLimitPerUser: formData.usageLimitPerUser ? parseInt(formData.usageLimitPerUser) : null,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(submitData)
      });

      const data = await response.json();

      if (data.success) {
        alert(coupon ? 'Cupón actualizado exitosamente' : 'Cupón creado exitosamente');
        onClose(true);
      } else {
        alert(data.message || 'Error al guardar cupón');
      }
    } catch (error) {
      console.error('Error saving coupon:', error);
      alert('Error al guardar cupón');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => onClose(false)}>
      <div className="modal-content coupon-form" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{coupon ? 'Editar Cupón' : 'Crear Nuevo Cupón'}</h2>
          <button className="btn-close" onClick={() => onClose(false)}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Basic Info */}
            <div className="form-section">
              <h3>Información Básica</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Código del Cupón *</label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleChange}
                    placeholder="DESCUENTO2024"
                    className={errors.code ? 'error' : ''}
                    disabled={!!coupon}
                  />
                  {errors.code && <span className="error-message">{errors.code}</span>}
                  <small>Se convertirá a mayúsculas automáticamente</small>
                </div>

                <div className="form-group">
                  <label>Tipo de Descuento *</label>
                  <select
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleChange}
                  >
                    <option value="percentage">Porcentaje (%)</option>
                    <option value="fixed">Monto Fijo ($)</option>
                    <option value="freeShipping">Envío Gratis</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Descripción *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe el cupón para que los clientes lo entiendan"
                  rows={3}
                  className={errors.description ? 'error' : ''}
                />
                {errors.description && <span className="error-message">{errors.description}</span>}
              </div>
            </div>

            {/* Discount Settings */}
            <div className="form-section">
              <h3>Configuración del Descuento</h3>
              
              <div className="form-row">
                {formData.discountType !== 'freeShipping' && (
                  <div className="form-group">
                    <label>
                      Valor del Descuento *
                      {formData.discountType === 'percentage' ? ' (%)' : ' ($)'}
                    </label>
                    <input
                      type="number"
                      name="discountValue"
                      value={formData.discountValue}
                      onChange={handleChange}
                      placeholder={formData.discountType === 'percentage' ? '10' : '100'}
                      min="0"
                      step={formData.discountType === 'percentage' ? '1' : '0.01'}
                      className={errors.discountValue ? 'error' : ''}
                    />
                    {errors.discountValue && <span className="error-message">{errors.discountValue}</span>}
                  </div>
                )}

                <div className="form-group">
                  <label>Compra Mínima ($)</label>
                  <input
                    type="number"
                    name="minPurchase"
                    value={formData.minPurchase}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                  <small>Opcional. Deja vacío para sin mínimo</small>
                </div>

                {formData.discountType === 'percentage' && (
                  <div className="form-group">
                    <label>Descuento Máximo ($)</label>
                    <input
                      type="number"
                      name="maxDiscount"
                      value={formData.maxDiscount}
                      onChange={handleChange}
                      placeholder="Sin límite"
                      min="0"
                      step="0.01"
                    />
                    <small>Opcional. Límite del descuento en pesos</small>
                  </div>
                )}
              </div>
            </div>

            {/* Usage Limits */}
            <div className="form-section">
              <h3>Límites de Uso</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Límite Total de Usos</label>
                  <input
                    type="number"
                    name="usageLimit"
                    value={formData.usageLimit}
                    onChange={handleChange}
                    placeholder="Ilimitado"
                    min="1"
                  />
                  <small>Opcional. Total de veces que se puede usar</small>
                </div>

                <div className="form-group">
                  <label>Límite por Usuario</label>
                  <input
                    type="number"
                    name="usageLimitPerUser"
                    value={formData.usageLimitPerUser}
                    onChange={handleChange}
                    placeholder="1"
                    min="1"
                  />
                  <small>Veces que cada usuario puede usar este cupón</small>
                </div>
              </div>
            </div>

            {/* Validity Period */}
            <div className="form-section">
              <h3>Período de Validez</h3>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Fecha de Inicio</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                  />
                  <small>Opcional. Deja vacío para activar inmediatamente</small>
                </div>

                <div className="form-group">
                  <label>Fecha de Fin</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className={errors.endDate ? 'error' : ''}
                  />
                  {errors.endDate && <span className="error-message">{errors.endDate}</span>}
                  <small>Opcional. Deja vacío para sin vencimiento</small>
                </div>
              </div>
            </div>

            {/* Additional Options */}
            <div className="form-section">
              <h3>Opciones Adicionales</h3>
              
              <div className="checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                  />
                  <span>Cupón activo</span>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="isPublic"
                    checked={formData.isPublic}
                    onChange={handleChange}
                  />
                  <span>Mostrar en home y página de cupones</span>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="firstPurchaseOnly"
                    checked={formData.firstPurchaseOnly}
                    onChange={handleChange}
                  />
                  <span>Solo para primera compra</span>
                </label>

                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="stackable"
                    checked={formData.stackable}
                    onChange={handleChange}
                  />
                  <span>Se puede combinar con otros cupones</span>
                </label>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => onClose(false)}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              <FaSave />
              {loading ? 'Guardando...' : coupon ? 'Actualizar Cupón' : 'Crear Cupón'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CouponForm;

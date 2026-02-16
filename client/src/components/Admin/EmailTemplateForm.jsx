import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import './EmailTemplateForm.css';

const EmailTemplateForm = ({ template, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'custom_notification',
    subject: '',
    htmlContent: '',
    textContent: '',
    variables: [],
    isActive: true
  });

  const [variableInput, setVariableInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const templateTypes = [
    { value: 'order_confirmation', label: 'Confirmación de Pedido' },
    { value: 'order_shipped', label: 'Pedido Enviado' },
    { value: 'order_delivered', label: 'Pedido Entregado' },
    { value: 'abandoned_cart', label: 'Carrito Abandonado' },
    { value: 'welcome', label: 'Bienvenida' },
    { value: 'password_reset', label: 'Recuperación de Contraseña' },
    { value: 'promotional', label: 'Promocional' },
    { value: 'custom_notification', label: 'Notificación Personalizada' }
  ];

  useEffect(() => {
    if (template) {
      setFormData({
        name: template.name || '',
        type: template.type || 'custom_notification',
        subject: template.subject || '',
        htmlContent: template.htmlContent || '',
        textContent: template.textContent || '',
        variables: template.variables || [],
        isActive: template.isActive !== undefined ? template.isActive : true
      });
    }
  }, [template]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddVariable = () => {
    const trimmed = variableInput.trim();
    if (trimmed && !formData.variables.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        variables: [...prev.variables, trimmed]
      }));
      setVariableInput('');
    }
  };

  const handleRemoveVariable = (variable) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.filter(v => v !== variable)
    }));
  };

  const handleVariableKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddVariable();
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('El nombre es requerido');
      return false;
    }
    if (!formData.subject.trim()) {
      setError('El asunto es requerido');
      return false;
    }
    if (!formData.htmlContent.trim()) {
      setError('El contenido HTML es requerido');
      return false;
    }
    if (!formData.type) {
      setError('El tipo es requerido');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const url = template 
        ? `http://localhost:5000/api/emails/templates/${template.id}`
        : 'http://localhost:5000/api/emails/templates';
      
      const method = template ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al guardar la plantilla');
      }

      onSave();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content email-form-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{template ? 'Editar Plantilla' : 'Nueva Plantilla'}</h2>
          <button onClick={onClose} className="close-button">
            <XMarkIcon className="icon" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Nombre *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ej: order_confirmation"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="type">Tipo *</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                disabled={loading}
              >
                {templateTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="subject">Asunto *</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="Ej: Confirmación de tu pedido #{{orderNumber}}"
              disabled={loading}
            />
            <small className="help-text">
              Puedes usar variables como {`{{variableName}}`}
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="variables">Variables</label>
            <div className="variable-input">
              <input
                type="text"
                value={variableInput}
                onChange={(e) => setVariableInput(e.target.value)}
                onKeyPress={handleVariableKeyPress}
                placeholder="Ej: customerName"
                disabled={loading}
              />
              <button 
                type="button" 
                onClick={handleAddVariable}
                disabled={loading || !variableInput.trim()}
                className="btn-add"
              >
                Agregar
              </button>
            </div>
            {formData.variables.length > 0 && (
              <div className="variable-tags">
                {formData.variables.map(variable => (
                  <span key={variable} className="variable-tag">
                    {`{{${variable}}}`}
                    <button
                      type="button"
                      onClick={() => handleRemoveVariable(variable)}
                      disabled={loading}
                      className="remove-tag"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            <small className="help-text">
              Define las variables que se usarán en el contenido
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="htmlContent">Contenido HTML *</label>
            <textarea
              id="htmlContent"
              name="htmlContent"
              value={formData.htmlContent}
              onChange={handleChange}
              rows="12"
              placeholder="<html>...</html>"
              disabled={loading}
              className="code-textarea"
            />
            <small className="help-text">
              HTML completo del email con estilos inline
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="textContent">Contenido de Texto</label>
            <textarea
              id="textContent"
              name="textContent"
              value={formData.textContent}
              onChange={handleChange}
              rows="6"
              placeholder="Versión de texto plano del email..."
              disabled={loading}
            />
            <small className="help-text">
              Versión alternativa en texto plano (opcional pero recomendado)
            </small>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                disabled={loading}
              />
              <span>Plantilla activa</span>
            </label>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Guardando...' : template ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmailTemplateForm;

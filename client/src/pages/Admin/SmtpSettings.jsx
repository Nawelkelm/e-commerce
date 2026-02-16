import React, { useState, useEffect } from 'react';
import { 
  ServerIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  EnvelopeIcon,
  KeyIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import './SmtpSettings.css';

const SmtpSettings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [presets, setPresets] = useState({});
  
  const [formData, setFormData] = useState({
    provider: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    user: '',
    password: '',
    fromName: 'Mi Tienda',
    fromEmail: 'noreply@example.com',
    isActive: false,
    testEmail: ''
  });

  useEffect(() => {
    fetchSettings();
    fetchPresets();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/smtp/settings', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        setFormData({
          provider: data.provider || 'gmail',
          host: data.host || 'smtp.gmail.com',
          port: data.port || 587,
          secure: data.secure || false,
          user: data.user || '',
          password: '', // Don't show password
          fromName: data.fromName || 'Mi Tienda',
          fromEmail: data.fromEmail || 'noreply@example.com',
          isActive: data.isActive || false,
          testEmail: data.testEmail || ''
        });
      }
    } catch (error) {
      console.error('Error fetching SMTP settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPresets = async () => {
    try {
      const response = await fetch('/api/smtp/presets', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPresets(data);
      }
    } catch (error) {
      console.error('Error fetching presets:', error);
    }
  };

  const handleProviderChange = (provider) => {
    const preset = presets[provider];
    if (preset) {
      setFormData(prev => ({
        ...prev,
        provider,
        host: preset.host || prev.host,
        port: preset.port || prev.port,
        secure: preset.secure !== undefined ? preset.secure : prev.secure
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/smtp/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSettings(data.settings);
        alert('✅ Configuración guardada exitosamente');
      } else {
        alert(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('❌ Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!formData.testEmail) {
      alert('Por favor ingresa un email de prueba');
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/smtp/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ testEmail: formData.testEmail })
      });

      const data = await response.json();
      setTestResult(data);

      if (data.success) {
        alert(`✅ ${data.message}\n\nRevisa tu bandeja de entrada en ${formData.testEmail}`);
      } else {
        alert(`❌ ${data.message}\n\nError: ${data.error || 'Desconocido'}`);
      }
    } catch (error) {
      console.error('Error testing SMTP:', error);
      setTestResult({ success: false, message: 'Error al probar conexión' });
      alert('❌ Error al probar la conexión SMTP');
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="smtp-settings">
        <div className="loading">Cargando configuración SMTP...</div>
      </div>
    );
  }

  return (
    <div className="smtp-settings">
      <div className="page-header">
        <div>
          <h1>
            <ServerIcon className="icon" />
            Configuración SMTP
          </h1>
          <p>Configura el servidor de email para enviar notificaciones automáticas</p>
        </div>
        {settings && settings.lastTestedAt && (
          <div className={`test-status ${settings.testStatus}`}>
            {settings.testStatus === 'success' ? (
              <CheckCircleIcon className="icon" />
            ) : (
              <XCircleIcon className="icon" />
            )}
            <span>
              Última prueba: {new Date(settings.lastTestedAt).toLocaleString()}
              <br />
              Estado: {settings.testStatus === 'success' ? 'Exitoso' : 'Fallido'}
            </span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="smtp-form">
        {/* Provider Selection */}
        <div className="form-section">
          <h2>Proveedor de Email</h2>
          <div className="provider-grid">
            {Object.keys(presets).map(provider => (
              <button
                key={provider}
                type="button"
                className={`provider-btn ${formData.provider === provider ? 'active' : ''}`}
                onClick={() => handleProviderChange(provider)}
              >
                <ServerIcon className="icon" />
                <span>{provider.charAt(0).toUpperCase() + provider.slice(1)}</span>
              </button>
            ))}
          </div>
          {presets[formData.provider]?.instructions && (
            <div className="info-box">
              <InformationCircleIcon className="icon" />
              <p>{presets[formData.provider].instructions}</p>
            </div>
          )}
        </div>

        {/* Server Configuration */}
        <div className="form-section">
          <h2>Configuración del Servidor</h2>
          <div className="form-row">
            <div className="form-group">
              <label>
                <ServerIcon className="icon" />
                Host SMTP
              </label>
              <input
                type="text"
                name="host"
                value={formData.host}
                onChange={handleChange}
                placeholder="smtp.gmail.com"
                required
              />
            </div>
            <div className="form-group">
              <label>Puerto</label>
              <input
                type="number"
                name="port"
                value={formData.port}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="secure"
                checked={formData.secure}
                onChange={handleChange}
              />
              <span>Usar SSL/TLS (puerto 465)</span>
            </label>
            <small>Desmarcado = STARTTLS (puerto 587)</small>
          </div>
        </div>

        {/* Authentication */}
        <div className="form-section">
          <h2>Autenticación</h2>
          <div className="form-group">
            <label>
              <EnvelopeIcon className="icon" />
              Usuario / Email
            </label>
            <input
              type="text"
              name="user"
              value={formData.user}
              onChange={handleChange}
              placeholder="tu-email@gmail.com"
            />
          </div>
          <div className="form-group">
            <label>
              <KeyIcon className="icon" />
              Contraseña / App Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Dejar vacío para mantener la actual"
            />
            <small>
              {formData.provider === 'gmail' && 'Usa una contraseña de aplicación, no tu contraseña normal'}
              {formData.provider === 'sendgrid' && 'Ingresa tu API Key de SendGrid'}
            </small>
          </div>
        </div>

        {/* Sender Information */}
        <div className="form-section">
          <h2>Información del Remitente</h2>
          <div className="form-row">
            <div className="form-group">
              <label>Nombre del Remitente</label>
              <input
                type="text"
                name="fromName"
                value={formData.fromName}
                onChange={handleChange}
                placeholder="Mi Tienda"
                required
              />
            </div>
            <div className="form-group">
              <label>Email del Remitente</label>
              <input
                type="email"
                name="fromEmail"
                value={formData.fromEmail}
                onChange={handleChange}
                placeholder="noreply@mitienda.com"
                required
              />
            </div>
          </div>
        </div>

        {/* Test Email */}
        <div className="form-section">
          <h2>Probar Configuración</h2>
          <div className="form-row">
            <div className="form-group" style={{flex: 1}}>
              <label>Email de Prueba</label>
              <input
                type="email"
                name="testEmail"
                value={formData.testEmail}
                onChange={handleChange}
                placeholder="tu-email@ejemplo.com"
              />
            </div>
            <button
              type="button"
              onClick={handleTest}
              disabled={testing || !formData.testEmail}
              className="btn-test"
            >
              {testing ? 'Enviando...' : 'Enviar Email de Prueba'}
            </button>
          </div>
        </div>

        {/* Active Status */}
        <div className="form-section">
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
              />
              <span>Activar envío de emails</span>
            </label>
            <small>
              Si está desactivado, los emails se guardarán en la base de datos pero no se enviarán
            </small>
          </div>
        </div>

        {/* Submit Button */}
        <div className="form-actions">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SmtpSettings;


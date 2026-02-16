import React, { useState, useEffect } from 'react';
import { PlusIcon, EnvelopeIcon, EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import EmailTemplateForm from '../../components/Admin/EmailTemplateForm';
import EmailTemplatePreview from '../../components/Admin/EmailTemplatePreview';
import { getApiUrl } from '../../config/api';
import './EmailTemplateManagement.css';

const EmailTemplateManagement = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showTestModal, setShowTestModal] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  const templateTypes = [
    { value: '', label: 'Todos los tipos' },
    { value: 'order_confirmation', label: 'Confirmación de Pedido' },
    { value: 'order_shipped', label: 'Pedido Enviado' },
    { value: 'order_delivered', label: 'Pedido Entregado' },
    { value: 'abandoned_cart', label: 'Carrito Abandonado' },
    { value: 'welcome', label: 'Bienvenida' },
    { value: 'password_reset', label: 'Restablecer Contraseña' },
    { value: 'promotional', label: 'Promocional' },
    { value: 'custom', label: 'Personalizado' }
  ];

  useEffect(() => {
    fetchTemplates();
  }, [searchTerm, filterType, filterStatus, currentPage]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(filterType && { type: filterType }),
        ...(filterStatus && { isActive: filterStatus })
      });

      const response = await fetch(`/api/emails/templates?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta plantilla?')) return;

    try {
      const response = await fetch(`/api/emails/templates/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        fetchTemplates();
      }
    } catch (error) {
      console.error('Error deleting template:', error);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const response = await fetch(`/api/emails/templates/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        fetchTemplates();
      }
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  const handleSendTest = async () => {
    if (!testEmail || !selectedTemplate) return;

    try {
      const response = await fetch(`/api/emails/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          templateId: selectedTemplate.id,
          recipientEmail: testEmail
        })
      });

      if (response.ok) {
        alert('Email de prueba enviado exitosamente');
        setShowTestModal(false);
        setTestEmail('');
      } else {
        alert('Error al enviar email de prueba');
      }
    } catch (error) {
      console.error('Error sending test email:', error);
      alert('Error al enviar email de prueba');
    }
  };

  const getTypeLabel = (type) => {
    const typeObj = templateTypes.find(t => t.value === type);
    return typeObj ? typeObj.label : type;
  };

  const getTypeBadgeClass = (type) => {
    const classes = {
      order_confirmation: 'badge-blue',
      order_shipped: 'badge-green',
      order_delivered: 'badge-purple',
      abandoned_cart: 'badge-orange',
      welcome: 'badge-pink',
      password_reset: 'badge-red',
      promotional: 'badge-yellow',
      custom: 'badge-gray'
    };
    return classes[type] || 'badge-gray';
  };

  return (
    <div className="email-template-management">
      <div className="page-header">
        <div>
          <h1>Plantillas de Email</h1>
          <p>Gestiona las plantillas de correo electrónico del sistema</p>
        </div>
        <button className="btn-primary" onClick={() => { setSelectedTemplate(null); setShowForm(true); }}>
          <PlusIcon className="icon" />
          Nueva Plantilla
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar plantillas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
          {templateTypes.map(type => (
            <option key={type.value} value={type.value}>{type.label}</option>
          ))}
        </select>

        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">Todos los estados</option>
          <option value="true">Activas</option>
          <option value="false">Inactivas</option>
        </select>
      </div>

      {/* Templates Table */}
      {loading ? (
        <div className="loading-state">Cargando plantillas...</div>
      ) : templates.length === 0 ? (
        <div className="empty-state">
          <EnvelopeIcon className="empty-icon" />
          <h3>No hay plantillas</h3>
          <p>Crea tu primera plantilla de email</p>
        </div>
      ) : (
        <>
          <div className="templates-table">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Asunto</th>
                  <th>Variables</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {templates.map(template => (
                  <tr key={template.id}>
                    <td>
                      <div className="template-name">
                        <EnvelopeIcon className="icon" />
                        {template.name}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getTypeBadgeClass(template.type)}`}>
                        {getTypeLabel(template.type)}
                      </span>
                    </td>
                    <td className="subject-cell">{template.subject}</td>
                    <td>
                      <span className="variables-count">{template.variables?.length || 0} variables</span>
                    </td>
                    <td>
                      <button
                        className={`status-toggle ${template.isActive ? 'active' : 'inactive'}`}
                        onClick={() => handleToggleStatus(template.id)}
                      >
                        {template.isActive ? 'Activa' : 'Inactiva'}
                      </button>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon"
                          onClick={() => { setSelectedTemplate(template); setShowPreview(true); }}
                          title="Vista previa"
                        >
                          <EyeIcon className="icon" />
                        </button>
                        <button
                          className="btn-icon"
                          onClick={() => { setSelectedTemplate(template); setShowForm(true); }}
                          title="Editar"
                        >
                          <PencilIcon className="icon" />
                        </button>
                        <button
                          className="btn-icon btn-test"
                          onClick={() => { setSelectedTemplate(template); setShowTestModal(true); }}
                          title="Enviar prueba"
                        >
                          <EnvelopeIcon className="icon" />
                        </button>
                        <button
                          className="btn-icon btn-danger"
                          onClick={() => handleDelete(template.id)}
                          title="Eliminar"
                        >
                          <TrashIcon className="icon" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                Anterior
              </button>
              <span>Página {currentPage} de {totalPages}</span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                Siguiente
              </button>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {showForm && (
        <EmailTemplateForm
          template={selectedTemplate}
          onClose={() => { setShowForm(false); setSelectedTemplate(null); }}
          onSave={() => { setShowForm(false); setSelectedTemplate(null); fetchTemplates(); }}
        />
      )}

      {showPreview && selectedTemplate && (
        <EmailTemplatePreview
          template={selectedTemplate}
          onClose={() => { setShowPreview(false); setSelectedTemplate(null); }}
        />
      )}

      {showTestModal && (
        <div className="modal-overlay" onClick={() => setShowTestModal(false)}>
          <div className="modal-content test-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Enviar Email de Prueba</h2>
            <p>Plantilla: <strong>{selectedTemplate?.name}</strong></p>
            <div className="form-group">
              <label>Email destinatario:</label>
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="ejemplo@correo.com"
              />
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowTestModal(false)}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleSendTest} disabled={!testEmail}>
                Enviar Prueba
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailTemplateManagement;


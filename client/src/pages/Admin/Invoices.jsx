import React, { useState, useEffect } from 'react';
import { 
  FaFileInvoiceDollar, 
  FaDownload, 
  FaEye, 
  FaEnvelope, 
  FaTimes,
  FaSearch,
  FaFilter,
  FaRedo,
  FaPlus
} from 'react-icons/fa';
import Cookies from 'js-cookie';
import '../../styles/Admin/Invoices.css';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [newInvoice, setNewInvoice] = useState({
    userId: '',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerAddress: '',
    customerTaxId: '',
    customerCuit: '',
    customerTaxCategory: 'consumidor_final',
    invoiceType: 'B',
    items: [{ name: '', quantity: 1, unitPrice: 0 }],
    discount: 0,
    shipping: 0,
    taxRate: 21,
    paymentMethod: 'Efectivo',
    observations: '',
    requestAfipCAE: false
  });

  useEffect(() => {
    fetchInvoices();
    fetchStats();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const token = Cookies.get('token');
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await fetch(`/api/invoices/all?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        alert('Sesión expirada. Por favor, inicia sesión nuevamente.');
        window.location.href = '/login';
        return;
      }

      const data = await response.json();
      if (data.invoices) {
        setInvoices(data.invoices);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = Cookies.get('token');
      const response = await fetch('/api/invoices/stats/summary', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        alert('Sesión expirada. Por favor, inicia sesión nuevamente.');
        window.location.href = '/login';
        return;
      }

      const data = await response.json();
      if (data) {
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching invoice stats:', error);
    }
  };

  const handleDownloadPDF = async (invoiceId, invoiceNumber) => {
    try {
      const token = Cookies.get('token');
      const response = await fetch(`/api/invoices/${invoiceId}/pdf`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Factura-${invoiceNumber}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error al descargar la factura');
    }
  };

  const handleViewPDF = async (invoiceId) => {
    const token = Cookies.get('token');
    window.open(`/api/invoices/${invoiceId}/view-pdf?token=${token}`, '_blank');
  };

  const handleSendEmail = async (invoiceId, invoiceNumber) => {
    if (!confirm(`¿Enviar factura ${invoiceNumber} por email al cliente?`)) return;

    try {
      const token = Cookies.get('token');
      const response = await fetch(`/api/invoices/${invoiceId}/email`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (response.ok) {
        alert('Factura enviada por email correctamente');
      } else {
        alert(data.message || 'Error al enviar la factura');
      }
    } catch (error) {
      console.error('Error sending invoice email:', error);
      alert('Error al enviar la factura');
    }
  };

  const handleCancelInvoice = async (invoiceId, invoiceNumber) => {
    if (!confirm(`¿Cancelar factura ${invoiceNumber}? Esta acción no se puede deshacer.`)) return;

    try {
      const token = Cookies.get('token');
      const response = await fetch(`/api/invoices/${invoiceId}/cancel`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (response.ok) {
        alert('Factura cancelada correctamente');
        fetchInvoices();
        fetchStats();
      } else {
        alert(data.message || 'Error al cancelar la factura');
      }
    } catch (error) {
      console.error('Error canceling invoice:', error);
      alert('Error al cancelar la factura');
    }
  };

  const fetchUsers = async () => {
    try {
      const token = Cookies.get('token');
      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleOpenCreateModal = () => {
    fetchUsers();
    setShowCreateModal(true);
  };

  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    setNewInvoice({
      userId: '',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      customerAddress: '',
      customerTaxId: '',
      customerCuit: '',
      customerTaxCategory: 'consumidor_final',
      invoiceType: 'B',
      items: [{ name: '', quantity: 1, unitPrice: 0 }],
      discount: 0,
      shipping: 0,
      taxRate: 21,
      paymentMethod: 'Efectivo',
      observations: '',
      requestAfipCAE: false
    });
  };

  const handleUserSelect = (userId) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setNewInvoice(prev => ({
        ...prev,
        userId: user.id,
        customerName: `${user.firstName} ${user.lastName}`,
        customerEmail: user.email,
        customerPhone: user.phone || ''
      }));
    }
  };

  const handleAddItem = () => {
    setNewInvoice(prev => ({
      ...prev,
      items: [...prev.items, { name: '', quantity: 1, unitPrice: 0 }]
    }));
  };

  const handleRemoveItem = (index) => {
    setNewInvoice(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleItemChange = (index, field, value) => {
    setNewInvoice(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const calculateTotal = () => {
    const subtotal = newInvoice.items.reduce((sum, item) => 
      sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0), 0
    );
    const discount = parseFloat(newInvoice.discount) || 0;
    const shipping = parseFloat(newInvoice.shipping) || 0;
    const taxRate = parseFloat(newInvoice.taxRate) || 0;
    const tax = (subtotal * taxRate) / 100;
    const total = subtotal + tax + shipping - discount;

    return { subtotal, tax, total };
  };

  const handleCreateInvoice = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!newInvoice.customerName || !newInvoice.customerEmail) {
      alert('Por favor completa los datos del cliente');
      return;
    }

    if (newInvoice.items.length === 0 || !newInvoice.items.some(item => item.name)) {
      alert('Por favor agrega al menos un producto');
      return;
    }

    try {
      const token = Cookies.get('token');
      
      // Preparar datos
      const invoiceData = {
        customerName: newInvoice.customerName,
        customerEmail: newInvoice.customerEmail,
        customerPhone: newInvoice.customerPhone || null,
        customerAddress: newInvoice.customerAddress || null,
        customerTaxId: newInvoice.customerTaxId || null,
        customerCuit: newInvoice.customerCuit || null,
        customerTaxCategory: newInvoice.customerTaxCategory,
        invoiceType: newInvoice.invoiceType,
        items: newInvoice.items.map(item => ({
          name: item.name,
          quantity: parseInt(item.quantity) || 1,
          unitPrice: parseFloat(item.unitPrice) || 0,
          subtotal: (parseInt(item.quantity) || 1) * (parseFloat(item.unitPrice) || 0)
        })),
        discount: parseFloat(newInvoice.discount) || 0,
        shipping: parseFloat(newInvoice.shipping) || 0,
        taxRate: parseFloat(newInvoice.taxRate) || 21,
        paymentMethod: newInvoice.paymentMethod,
        observations: newInvoice.observations || null,
        requestAfipCAE: newInvoice.requestAfipCAE
      };

      if (newInvoice.userId) {
        invoiceData.userId = newInvoice.userId;
      }

      const response = await fetch('/api/invoices/manual', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invoiceData)
      });

      const data = await response.json();

      if (response.ok) {
        alert('Factura creada exitosamente');
        handleCloseCreateModal();
        fetchInvoices();
        fetchStats();
      } else {
        alert(data.message || 'Error al crear la factura');
      }
    } catch (error) {
      console.error('Error creating invoice:', error);
      alert('Error al crear la factura');
    }
  };

  const handleRegeneratePDF = async (invoiceId, invoiceNumber) => {
    if (!confirm(`¿Regenerar PDF de factura ${invoiceNumber}?`)) return;

    try {
      const token = Cookies.get('token');
      const response = await fetch(`/api/invoices/${invoiceId}/regenerate-pdf`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (response.ok) {
        alert('PDF regenerado correctamente');
        fetchInvoices();
      } else {
        alert(data.message || 'Error al regenerar el PDF');
      }
    } catch (error) {
      console.error('Error regenerating PDF:', error);
      alert('Error al regenerar el PDF');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    // Parsear el valor a número
    const numAmount = parseFloat(amount);
    
    // Si es NaN o no es válido, retornar $ 0.00
    if (isNaN(numAmount) || amount === null || amount === undefined) {
      return '$ 0.00';
    }
    
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(numAmount);
  };

  const getStatusBadge = (status) => {
    const badges = {
      paid: { text: 'Pagada', class: 'badge-success' },
      pending: { text: 'Pendiente', class: 'badge-warning' },
      cancelled: { text: 'Cancelada', class: 'badge-danger' }
    };
    const badge = badges[status] || badges.pending;
    return <span className={`badge ${badge.class}`}>{badge.text}</span>;
  };

  return (
    <div className="invoices-page">
      <div className="page-header">
        <h1><FaFileInvoiceDollar /> Gestión de Facturas</h1>
        <button className="btn-primary" onClick={handleOpenCreateModal}>
          <FaPlus /> Nueva Factura Manual
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon total">
              <FaFileInvoiceDollar />
            </div>
            <div className="stat-info">
              <h3>{stats.totalInvoices}</h3>
              <p>Total Facturas</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon paid">
              <FaFileInvoiceDollar />
            </div>
            <div className="stat-info">
              <h3>{stats.paidInvoices}</h3>
              <p>Pagadas</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon pending">
              <FaFileInvoiceDollar />
            </div>
            <div className="stat-info">
              <h3>{stats.pendingInvoices}</h3>
              <p>Pendientes</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon revenue">
              <FaFileInvoiceDollar />
            </div>
            <div className="stat-info">
              <h3>{formatCurrency(stats.totalRevenue)}</h3>
              <p>Ingresos Totales</p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Buscar por número de factura, cliente o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <FaFilter />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Todos los estados</option>
            <option value="paid">Pagadas</option>
            <option value="pending">Pendientes</option>
            <option value="cancelled">Canceladas</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="invoices-table-container">
        {loading ? (
          <div className="loading">Cargando facturas...</div>
        ) : invoices.length === 0 ? (
          <div className="no-data">No se encontraron facturas</div>
        ) : (
          <table className="invoices-table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="invoice-number">
                    <strong>{invoice.invoiceNumber}</strong>
                  </td>
                  <td>
                    <div className="customer-info">
                      <div className="customer-name">
                        {invoice.customerName}
                      </div>
                      <div className="customer-email">
                        {invoice.customerEmail}
                      </div>
                    </div>
                  </td>
                  <td>{formatDate(invoice.issueDate)}</td>
                  <td className="amount">{formatCurrency(invoice.total)}</td>
                  <td>{getStatusBadge(invoice.status)}</td>
                  <td>
                    <div className="actions">
                      <button
                        onClick={() => handleViewPDF(invoice.id)}
                        className="btn-action btn-view"
                        title="Ver PDF"
                      >
                        <FaEye />
                      </button>
                      <button
                        onClick={() => handleDownloadPDF(invoice.id, invoice.invoiceNumber)}
                        className="btn-action btn-download"
                        title="Descargar PDF"
                      >
                        <FaDownload />
                      </button>
                      <button
                        onClick={() => handleSendEmail(invoice.id, invoice.invoiceNumber)}
                        className="btn-action btn-email"
                        title="Enviar por email"
                      >
                        <FaEnvelope />
                      </button>
                      {invoice.status !== 'cancelled' && (
                        <>
                          <button
                            onClick={() => handleRegeneratePDF(invoice.id, invoice.invoiceNumber)}
                            className="btn-action btn-regenerate"
                            title="Regenerar PDF"
                          >
                            <FaRedo />
                          </button>
                          <button
                            onClick={() => handleCancelInvoice(invoice.id, invoice.invoiceNumber)}
                            className="btn-action btn-cancel"
                            title="Cancelar factura"
                          >
                            <FaTimes />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </button>
          <span>Página {currentPage} de {totalPages}</span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Modal Crear Factura */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={handleCloseCreateModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><FaFileInvoiceDollar /> Nueva Factura Manual</h2>
              <button className="modal-close" onClick={handleCloseCreateModal}>
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="invoice-form">
              {/* Selección de Usuario */}
              <div className="form-section">
                <h3>Datos del Cliente</h3>
                
                <div className="form-group">
                  <label>Usuario Registrado (Opcional)</label>
                  <select 
                    value={newInvoice.userId} 
                    onChange={(e) => handleUserSelect(e.target.value)}
                  >
                    <option value="">-- Seleccionar usuario registrado --</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Nombre Completo *</label>
                    <input
                      type="text"
                      value={newInvoice.customerName}
                      onChange={(e) => setNewInvoice({...newInvoice, customerName: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      value={newInvoice.customerEmail}
                      onChange={(e) => setNewInvoice({...newInvoice, customerEmail: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Teléfono</label>
                    <input
                      type="text"
                      value={newInvoice.customerPhone}
                      onChange={(e) => setNewInvoice({...newInvoice, customerPhone: e.target.value})}
                    />
                  </div>

                  <div className="form-group">
                    <label>DNI/CUIT</label>
                    <input
                      type="text"
                      value={newInvoice.customerTaxId}
                      onChange={(e) => setNewInvoice({...newInvoice, customerTaxId: e.target.value})}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Dirección</label>
                  <input
                    type="text"
                    value={newInvoice.customerAddress}
                    onChange={(e) => setNewInvoice({...newInvoice, customerAddress: e.target.value})}
                  />
                </div>
              </div>

              {/* Datos AFIP */}
              <div className="form-section">
                <h3>Información Fiscal</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Tipo de Factura</label>
                    <select
                      value={newInvoice.invoiceType}
                      onChange={(e) => setNewInvoice({...newInvoice, invoiceType: e.target.value})}
                    >
                      <option value="A">A - Factura A</option>
                      <option value="B">B - Factura B</option>
                      <option value="C">C - Factura C</option>
                      <option value="E">E - Factura E (Exportación)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Categoría Fiscal</label>
                    <select
                      value={newInvoice.customerTaxCategory}
                      onChange={(e) => setNewInvoice({...newInvoice, customerTaxCategory: e.target.value})}
                    >
                      <option value="consumidor_final">Consumidor Final</option>
                      <option value="responsable_inscripto">Responsable Inscripto</option>
                      <option value="responsable_monotributo">Monotributo</option>
                      <option value="exento">Exento</option>
                    </select>
                  </div>
                </div>

                {newInvoice.customerTaxCategory === 'responsable_inscripto' && (
                  <div className="form-group">
                    <label>CUIT</label>
                    <input
                      type="text"
                      value={newInvoice.customerCuit}
                      onChange={(e) => setNewInvoice({...newInvoice, customerCuit: e.target.value})}
                      placeholder="20123456789"
                      maxLength="11"
                    />
                  </div>
                )}

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={newInvoice.requestAfipCAE}
                      onChange={(e) => setNewInvoice({...newInvoice, requestAfipCAE: e.target.checked})}
                    />
                    Solicitar CAE a AFIP automáticamente
                  </label>
                </div>
              </div>

              {/* Items */}
              <div className="form-section">
                <h3>Productos/Servicios</h3>
                
                {newInvoice.items.map((item, index) => (
                  <div key={index} className="item-row">
                    <div className="form-group flex-3">
                      <label>Descripción</label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                        placeholder="Nombre del producto/servicio"
                        required
                      />
                    </div>

                    <div className="form-group flex-1">
                      <label>Cantidad</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        min="1"
                        required
                      />
                    </div>

                    <div className="form-group flex-1">
                      <label>Precio Unit.</label>
                      <input
                        type="number"
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>

                    <div className="form-group flex-1">
                      <label>Subtotal</label>
                      <input
                        type="text"
                        value={formatCurrency(item.quantity * item.unitPrice)}
                        disabled
                      />
                    </div>

                    {newInvoice.items.length > 1 && (
                      <button
                        type="button"
                        className="btn-remove-item"
                        onClick={() => handleRemoveItem(index)}
                        title="Eliminar item"
                      >
                        <FaTimes />
                      </button>
                    )}
                  </div>
                ))}

                <button type="button" className="btn-add-item" onClick={handleAddItem}>
                  <FaPlus /> Agregar Item
                </button>
              </div>

              {/* Totales y Pago */}
              <div className="form-section">
                <h3>Totales y Pago</h3>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Descuento ($)</label>
                    <input
                      type="number"
                      value={newInvoice.discount}
                      onChange={(e) => setNewInvoice({...newInvoice, discount: e.target.value})}
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="form-group">
                    <label>Envío ($)</label>
                    <input
                      type="number"
                      value={newInvoice.shipping}
                      onChange={(e) => setNewInvoice({...newInvoice, shipping: e.target.value})}
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className="form-group">
                    <label>IVA (%)</label>
                    <input
                      type="number"
                      value={newInvoice.taxRate}
                      onChange={(e) => setNewInvoice({...newInvoice, taxRate: e.target.value})}
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Método de Pago</label>
                  <select
                    value={newInvoice.paymentMethod}
                    onChange={(e) => setNewInvoice({...newInvoice, paymentMethod: e.target.value})}
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Tarjeta de Crédito">Tarjeta de Crédito</option>
                    <option value="Tarjeta de Débito">Tarjeta de Débito</option>
                    <option value="Transferencia">Transferencia</option>
                    <option value="MercadoPago">MercadoPago</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Observaciones</label>
                  <textarea
                    value={newInvoice.observations}
                    onChange={(e) => setNewInvoice({...newInvoice, observations: e.target.value})}
                    rows="3"
                    placeholder="Notas adicionales..."
                  />
                </div>

                {/* Resumen de totales */}
                <div className="totals-summary">
                  <div className="total-row">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(calculateTotal().subtotal)}</span>
                  </div>
                  <div className="total-row">
                    <span>IVA ({newInvoice.taxRate}%):</span>
                    <span>{formatCurrency(calculateTotal().tax)}</span>
                  </div>
                  {parseFloat(newInvoice.discount) > 0 && (
                    <div className="total-row discount">
                      <span>Descuento:</span>
                      <span>-{formatCurrency(newInvoice.discount)}</span>
                    </div>
                  )}
                  {parseFloat(newInvoice.shipping) > 0 && (
                    <div className="total-row">
                      <span>Envío:</span>
                      <span>{formatCurrency(newInvoice.shipping)}</span>
                    </div>
                  )}
                  <div className="total-row total">
                    <span><strong>TOTAL:</strong></span>
                    <span><strong>{formatCurrency(calculateTotal().total)}</strong></span>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={handleCloseCreateModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  <FaFileInvoiceDollar /> Crear Factura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Invoices;

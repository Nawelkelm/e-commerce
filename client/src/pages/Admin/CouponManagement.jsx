import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaChartBar, FaSearch, FaFilter, FaCopy } from 'react-icons/fa';
import CouponForm from '../../components/Admin/CouponForm';
import CouponStats from '../../components/Admin/CouponStats';
import { getApiUrl } from '../../config/api';
import '../../styles/Admin/CouponManagement.css';

const CouponManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [selectedCouponId, setSelectedCouponId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchCoupons();
  }, [currentPage, searchTerm, statusFilter]);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found');
        return;
      }

      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await fetch(getApiUrl(`/coupons?${params}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          console.error('Unauthorized - redirecting to login');
          localStorage.removeItem('token');
          window.location.href = '/login';
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.coupons) {
        setCoupons(data.coupons);
        setTotalPages(data.totalPages);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedCoupon(null);
    setShowForm(true);
  };

  const handleEdit = (coupon) => {
    setSelectedCoupon(coupon);
    setShowForm(true);
  };

  const handleDelete = async (couponId) => {
    if (!window.confirm('¿Estás seguro de eliminar este cupón?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/coupons/${couponId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        alert('Cupón eliminado exitosamente');
        fetchCoupons();
      } else {
        alert(data.message || 'Error al eliminar cupón');
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
      alert('Error al eliminar cupón');
    }
  };

  const handleToggleStatus = async (couponId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/coupons/${couponId}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        fetchCoupons();
      } else {
        alert(data.message || 'Error al cambiar estado');
      }
    } catch (error) {
      console.error('Error toggling coupon:', error);
      alert('Error al cambiar estado del cupón');
    }
  };

  const handleViewStats = (couponId) => {
    setSelectedCouponId(couponId);
    setShowStats(true);
  };

  const handleFormClose = (saved) => {
    setShowForm(false);
    setSelectedCoupon(null);
    if (saved) {
      fetchCoupons();
    }
  };

  const handleStatsClose = () => {
    setShowStats(false);
    setSelectedCouponId(null);
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    alert(`Código ${code} copiado al portapapeles`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDiscount = (coupon) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}%`;
    } else if (coupon.discountType === 'fixed') {
      return `$${coupon.discountValue}`;
    } else {
      return 'Envío Gratis';
    }
  };

  const getStatusBadge = (coupon) => {
    const now = new Date();
    const endDate = coupon.endDate ? new Date(coupon.endDate) : null;
    
    if (!coupon.isActive) {
      return <span className="badge badge-inactive">Inactivo</span>;
    }
    if (endDate && endDate < now) {
      return <span className="badge badge-expired">Expirado</span>;
    }
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return <span className="badge badge-exhausted">Agotado</span>;
    }
    return <span className="badge badge-active">Activo</span>;
  };

  return (
    <div className="coupon-management">
      <div className="management-header">
        <div>
          <h1>Gestión de Cupones</h1>
          <p className="subtitle">Administra descuentos y promociones</p>
        </div>
        <button className="btn-primary" onClick={handleCreate}>
          <FaPlus /> Crear Cupón
        </button>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="search-box">
          <FaSearch />
          <input
            type="text"
            placeholder="Buscar por código o descripción..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="filter-group">
          <FaFilter />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
          >
            <option value="all">Todos los estados</option>
            <option value="true">Activos</option>
            <option value="false">Inactivos</option>
          </select>
        </div>
      </div>

      {/* Coupons Table */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando cupones...</p>
        </div>
      ) : coupons.length === 0 ? (
        <div className="empty-state">
          <FaPlus className="empty-icon" />
          <h3>No hay cupones</h3>
          <p>Crea tu primer cupón para empezar</p>
          <button className="btn-primary" onClick={handleCreate}>
            Crear Cupón
          </button>
        </div>
      ) : (
        <>
          <div className="table-container">
            <table className="coupons-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Descripción</th>
                  <th>Descuento</th>
                  <th>Usos</th>
                  <th>Validez</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((coupon) => (
                  <tr key={coupon.id}>
                    <td>
                      <div className="code-cell">
                        <span className="coupon-code">{coupon.code}</span>
                        <button
                          className="btn-icon"
                          onClick={() => copyCode(coupon.code)}
                          title="Copiar código"
                        >
                          <FaCopy />
                        </button>
                      </div>
                    </td>
                    <td className="description-cell">{coupon.description}</td>
                    <td>
                      <span className="discount-badge">
                        {formatDiscount(coupon)}
                      </span>
                      {coupon.minPurchase > 0 && (
                        <small className="text-muted">
                          Min: ${coupon.minPurchase}
                        </small>
                      )}
                    </td>
                    <td>
                      <div className="usage-cell">
                        <span>{coupon.usedCount || 0}</span>
                        {coupon.usageLimit && (
                          <span className="text-muted"> / {coupon.usageLimit}</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="date-cell">
                        <small>
                          {formatDate(coupon.startDate)} - {formatDate(coupon.endDate)}
                        </small>
                      </div>
                    </td>
                    <td>{getStatusBadge(coupon)}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-icon btn-stats"
                          onClick={() => handleViewStats(coupon.id)}
                          title="Ver estadísticas"
                        >
                          <FaChartBar />
                        </button>
                        <button
                          className="btn-icon btn-edit"
                          onClick={() => handleEdit(coupon)}
                          title="Editar"
                        >
                          <FaEdit />
                        </button>
                        <button
                          className={`btn-icon ${coupon.isActive ? 'btn-toggle-on' : 'btn-toggle-off'}`}
                          onClick={() => handleToggleStatus(coupon.id)}
                          title={coupon.isActive ? 'Desactivar' : 'Activar'}
                        >
                          {coupon.isActive ? <FaToggleOn /> : <FaToggleOff />}
                        </button>
                        <button
                          className="btn-icon btn-delete"
                          onClick={() => handleDelete(coupon.id)}
                          title="Eliminar"
                        >
                          <FaTrash />
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
              <span>
                Página {currentPage} de {totalPages}
              </span>
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
        <CouponForm
          coupon={selectedCoupon}
          onClose={handleFormClose}
        />
      )}

      {showStats && (
        <CouponStats
          couponId={selectedCouponId}
          onClose={handleStatsClose}
        />
      )}
    </div>
  );
};

export default CouponManagement;

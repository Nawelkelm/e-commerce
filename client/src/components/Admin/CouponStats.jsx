import React, { useState, useEffect } from 'react';
import { FaTimes, FaUsers, FaDollarSign, FaChartLine, FaPercentage } from 'react-icons/fa';
import '../../styles/Admin/CouponStats.css';

const CouponStats = ({ couponId, onClose }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [couponId]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/coupons/${couponId}/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.coupon) {
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDiscount = (coupon) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}% OFF`;
    } else if (coupon.discountType === 'fixed') {
      return `$${coupon.discountValue} OFF`;
    } else {
      return 'Envío Gratis';
    }
  };

  if (loading) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content stats-modal" onClick={(e) => e.stopPropagation()}>
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Cargando estadísticas...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content stats-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Estadísticas del Cupón</h2>
            <p className="coupon-code-title">{stats.coupon.code}</p>
          </div>
          <button className="btn-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          {/* Coupon Info */}
          <div className="stats-section">
            <div className="coupon-info-card">
              <h3>{stats.coupon.description}</h3>
              <div className="coupon-details">
                <span className="discount-badge">{formatDiscount(stats.coupon)}</span>
                {stats.coupon.minPurchase > 0 && (
                  <span className="detail-item">Mínimo: ${stats.coupon.minPurchase}</span>
                )}
                {stats.coupon.maxDiscount && (
                  <span className="detail-item">Máx. descuento: ${stats.coupon.maxDiscount}</span>
                )}
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                <FaChartLine />
              </div>
              <div className="stat-content">
                <h4>Total de Usos</h4>
                <p className="stat-value">{stats.stats.totalUses}</p>
                {stats.coupon.usageLimit && (
                  <small className="stat-detail">
                    de {stats.coupon.usageLimit} disponibles
                  </small>
                )}
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                <FaUsers />
              </div>
              <div className="stat-content">
                <h4>Usuarios Únicos</h4>
                <p className="stat-value">{stats.stats.uniqueUsers}</p>
                <small className="stat-detail">clientes diferentes</small>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
                <FaDollarSign />
              </div>
              <div className="stat-content">
                <h4>Descuento Total</h4>
                <p className="stat-value">${stats.stats.totalDiscount.toFixed(2)}</p>
                <small className="stat-detail">ahorrado por clientes</small>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
                <FaPercentage />
              </div>
              <div className="stat-content">
                <h4>Descuento Promedio</h4>
                <p className="stat-value">${stats.stats.averageDiscount.toFixed(2)}</p>
                <small className="stat-detail">por uso</small>
              </div>
            </div>
          </div>

          {/* Usage Rate */}
          {stats.coupon.usageLimit && (
            <div className="stats-section">
              <h3>Tasa de Uso</h3>
              <div className="progress-bar-container">
                <div 
                  className="progress-bar"
                  style={{ width: `${stats.stats.usageRate}%` }}
                >
                  <span className="progress-label">{stats.stats.usageRate.toFixed(1)}%</span>
                </div>
              </div>
              <p className="progress-detail">
                {stats.stats.totalUses} de {stats.coupon.usageLimit} usos completados
              </p>
            </div>
          )}

          {/* Recent Usages */}
          {stats.recentUsages && stats.recentUsages.length > 0 && (
            <div className="stats-section">
              <h3>Usos Recientes</h3>
              <div className="usages-table-container">
                <table className="usages-table">
                  <thead>
                    <tr>
                      <th>Usuario</th>
                      <th>Orden</th>
                      <th>Descuento</th>
                      <th>Fecha</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentUsages.map((usage, index) => (
                      <tr key={index}>
                        <td>
                          {usage.User ? (
                            <div>
                              <div className="user-name">{usage.User.name}</div>
                              <div className="user-email">{usage.User.email}</div>
                            </div>
                          ) : (
                            <span className="text-muted">Usuario no disponible</span>
                          )}
                        </td>
                        <td>
                          {usage.Order ? (
                            <div>
                              <div className="order-id">#{usage.Order.id}</div>
                              <div className="order-total">${parseFloat(usage.Order.total).toFixed(2)}</div>
                            </div>
                          ) : (
                            <span className="text-muted">N/A</span>
                          )}
                        </td>
                        <td>
                          <span className="discount-amount">
                            ${parseFloat(usage.discountApplied).toFixed(2)}
                          </span>
                        </td>
                        <td>
                          <span className="usage-date">
                            {formatDate(usage.usedAt)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {stats.recentUsages && stats.recentUsages.length === 0 && (
            <div className="empty-state">
              <p>Este cupón aún no ha sido utilizado</p>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CouponStats;

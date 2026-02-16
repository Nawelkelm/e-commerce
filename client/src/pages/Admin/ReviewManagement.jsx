import React, { useState, useEffect } from 'react';
import { 
  CheckIcon, 
  XMarkIcon, 
  ChatBubbleLeftRightIcon,
  TrashIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import StarRating from '../../components/StarRating';
import './ReviewManagement.css';

const ReviewManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [filters, setFilters] = useState({ status: '', productId: '' });
  const [selectedReview, setSelectedReview] = useState(null);
  const [adminResponse, setAdminResponse] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchReviews();
  }, [pagination.page, filters]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: 20
      });

      if (filters.status) {
        params.append('status', filters.status);
      }
      if (filters.productId) {
        params.append('productId', filters.productId);
      }

      const response = await fetch(`/api/reviews?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews);
        setPagination(prev => ({
          ...prev,
          total: data.pagination.total,
          pages: data.pagination.pages
        }));
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (reviewId) => {
    if (!confirm('¿Aprobar esta reseña?')) return;

    try {
      const response = await fetch(`/api/reviews/${reviewId}/approve`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Reseña aprobada exitosamente');
        fetchReviews();
      } else {
        alert('Error al aprobar la reseña');
      }
    } catch (error) {
      console.error('Error approving review:', error);
      alert('Error al aprobar la reseña');
    }
  };

  const handleDelete = async (reviewId) => {
    if (!confirm('¿Eliminar esta reseña permanentemente?')) return;

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        alert('Reseña eliminada exitosamente');
        fetchReviews();
      } else {
        alert('Error al eliminar la reseña');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Error al eliminar la reseña');
    }
  };

  const handleAddResponse = async (reviewId) => {
    if (!adminResponse.trim()) {
      alert('Por favor ingresa una respuesta');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/reviews/${reviewId}/response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ response: adminResponse })
      });

      if (response.ok) {
        alert('Respuesta agregada exitosamente');
        setAdminResponse('');
        setSelectedReview(null);
        fetchReviews();
      } else {
        alert('Error al agregar respuesta');
      }
    } catch (error) {
      console.error('Error adding response:', error);
      alert('Error al agregar respuesta');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (isApproved) => {
    if (isApproved) {
      return <span className="status-badge approved">Aprobada</span>;
    }
    return <span className="status-badge pending">Pendiente</span>;
  };

  if (loading && reviews.length === 0) {
    return <div className="loading">Cargando reseñas...</div>;
  }

  return (
    <div className="review-management">
      <div className="header">
        <h1>Gestión de Reseñas</h1>
        <p className="subtitle">Administra las reseñas de tus productos</p>
      </div>

      {/* Filters */}
      <div className="filters-section">
        <div className="filter-group">
          <FunnelIcon className="filter-icon" />
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="filter-select"
          >
            <option value="">Todas las reseñas</option>
            <option value="pending">Pendientes de aprobación</option>
            <option value="approved">Aprobadas</option>
          </select>
        </div>

        <div className="stats">
          <div className="stat-item">
            <span className="stat-label">Total:</span>
            <span className="stat-value">{pagination.total}</span>
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="empty-state">
          <p>No hay reseñas para mostrar</p>
        </div>
      ) : (
        <div className="reviews-grid">
          {reviews.map((review) => (
            <div key={review.id} className="review-card-admin">
              <div className="review-card-header">
                <div className="review-product-info">
                  {review.Product?.images?.[0] && (
                    <img
                      src={review.Product.images[0]}
                      alt={review.Product.name}
                      className="product-thumbnail"
                    />
                  )}
                  <div>
                    <h3 className="product-name">{review.Product?.name || 'Producto'}</h3>
                    <p className="product-sku">SKU: {review.Product?.sku}</p>
                  </div>
                </div>
                {getStatusBadge(review.isApproved)}
              </div>

              <div className="review-user-info">
                <div>
                  <strong>{review.User?.name || 'Usuario'}</strong>
                  {review.isVerifiedPurchase && (
                    <span className="verified-badge">✓ Compra verificada</span>
                  )}
                </div>
                <span className="review-date">{formatDate(review.createdAt)}</span>
              </div>

              <div className="review-rating-row">
                <StarRating rating={review.rating} size="small" />
              </div>

              {review.title && (
                <h4 className="review-title-admin">{review.title}</h4>
              )}

              <p className="review-comment-admin">{review.comment}</p>

              {review.images && review.images.length > 0 && (
                <div className="review-images-admin">
                  {review.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`Review ${index + 1}`}
                      className="review-image-admin"
                    />
                  ))}
                </div>
              )}

              {review.adminResponse && (
                <div className="admin-response-display">
                  <strong>Tu respuesta:</strong>
                  <p>{review.adminResponse}</p>
                  <small>{formatDate(review.adminRespondedAt)}</small>
                </div>
              )}

              <div className="review-stats-row">
                <span>👍 {review.helpfulCount}</span>
                <span>👎 {review.notHelpfulCount}</span>
              </div>

              <div className="review-actions-admin">
                {!review.isApproved && (
                  <button
                    onClick={() => handleApprove(review.id)}
                    className="action-button approve"
                  >
                    <CheckIcon className="action-icon" />
                    Aprobar
                  </button>
                )}

                <button
                  onClick={() => {
                    setSelectedReview(review.id);
                    setAdminResponse(review.adminResponse || '');
                  }}
                  className="action-button respond"
                >
                  <ChatBubbleLeftRightIcon className="action-icon" />
                  {review.adminResponse ? 'Editar' : 'Responder'}
                </button>

                <button
                  onClick={() => handleDelete(review.id)}
                  className="action-button delete"
                >
                  <TrashIcon className="action-icon" />
                  Eliminar
                </button>
              </div>

              {/* Response Form */}
              {selectedReview === review.id && (
                <div className="response-form">
                  <textarea
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    placeholder="Escribe tu respuesta..."
                    rows={4}
                    className="response-textarea"
                  />
                  <div className="response-form-actions">
                    <button
                      onClick={() => {
                        setSelectedReview(null);
                        setAdminResponse('');
                      }}
                      className="cancel-response"
                      disabled={submitting}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => handleAddResponse(review.id)}
                      className="submit-response"
                      disabled={submitting}
                    >
                      {submitting ? 'Enviando...' : 'Enviar Respuesta'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination-admin">
          <button
            disabled={pagination.page === 1}
            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
            className="pagination-button-admin"
          >
            Anterior
          </button>
          <span className="pagination-info-admin">
            Página {pagination.page} de {pagination.pages}
          </span>
          <button
            disabled={pagination.page === pagination.pages}
            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
            className="pagination-button-admin"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewManagement;


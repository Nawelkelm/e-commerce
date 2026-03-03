import React, { useState, useEffect } from 'react';
import { 
  UserCircleIcon, 
  CheckBadgeIcon,
  HandThumbUpIcon,
  HandThumbDownIcon
} from '@heroicons/react/24/outline';
import { HandThumbUpIcon as HandThumbUpSolid } from '@heroicons/react/24/solid';
import StarRating from './StarRating';
import './ReviewList.css';

const ReviewList = ({ productId }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1 });
  const [filters, setFilters] = useState({
    rating: null,
    sortBy: 'recent'
  });

  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchReviews();
  }, [productId, filters, pagination.page]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: 10,
        sortBy: filters.sortBy
      });

      if (filters.rating) {
        params.append('rating', filters.rating);
      }

      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(
        `/api/products/${productId}/reviews?${params}`,
        { headers }
      );

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

  const handleVote = async (reviewId, isHelpful) => {
    if (!token) {
      alert('Debes iniciar sesión para votar');
      return;
    }

    try {
      const response = await fetch(`/api/reviews/${reviewId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isHelpful })
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update the review in the list
        setReviews(reviews.map(review => 
          review.id === reviewId 
            ? {
                ...review,
                helpfulCount: data.helpfulCount,
                notHelpfulCount: data.notHelpfulCount,
                userVote: data.userVote
              }
            : review
        ));
      }
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return <div className="reviews-loading">Cargando reseñas...</div>;
  }

  if (reviews.length === 0) {
    return (
      <div className="reviews-empty">
        <p>Aún no hay reseñas para este producto.</p>
        <p className="text-sm text-gray-500">¡Sé el primero en dejar una reseña!</p>
      </div>
    );
  }

  return (
    <div className="review-list-container">
      {/* Filters */}
      <div className="review-filters">
        <div className="filter-group">
          <label>Filtrar por calificación:</label>
          <select 
            value={filters.rating || ''} 
            onChange={(e) => setFilters({ ...filters, rating: e.target.value || null })}
          >
            <option value="">Todas</option>
            <option value="5">5 estrellas</option>
            <option value="4">4 estrellas</option>
            <option value="3">3 estrellas</option>
            <option value="2">2 estrellas</option>
            <option value="1">1 estrella</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Ordenar por:</label>
          <select 
            value={filters.sortBy} 
            onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
          >
            <option value="recent">Más recientes</option>
            <option value="helpful">Más útiles</option>
            <option value="rating">Mejor valoradas</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div className="reviews-list">
        {reviews.map((review) => (
          <div key={review.id} className="review-card">
            <div className="review-header">
              <div className="review-user">
                <UserCircleIcon className="user-icon" />
                <div>
                  <div className="user-name">
                    {review.User?.name || 'Usuario'}
                    {review.isVerifiedPurchase && (
                      <CheckBadgeIcon className="verified-badge" title="Compra verificada" />
                    )}
                  </div>
                  <div className="review-date">{formatDate(review.createdAt)}</div>
                </div>
              </div>
              <StarRating rating={review.rating} size="small" />
            </div>

            {review.title && <h4 className="review-title">{review.title}</h4>}

            <p className="review-comment">{review.comment}</p>

            {review.images && review.images.length > 0 && (
              <div className="review-images">
                {review.images.map((image, index) => (
                  <img 
                    key={index} 
                    src={image} 
                    alt={`Review ${index + 1}`} 
                    className="review-image"
                  />
                ))}
              </div>
            )}

            {/* Admin Response */}
            {review.adminResponse && (
              <div className="admin-response">
                <div className="admin-response-header">
                  <strong>Respuesta del vendedor</strong>
                  <span className="admin-response-date">
                    {formatDate(review.adminRespondedAt)}
                  </span>
                </div>
                <p>{review.adminResponse}</p>
              </div>
            )}

            {/* Helpful Votes */}
            <div className="review-actions">
              <span className="helpful-label">¿Te resultó útil esta reseña?</span>
              <div className="vote-buttons">
                <button
                  className={`vote-button ${review.userVote === true ? 'active' : ''}`}
                  onClick={() => handleVote(review.id, true)}
                  disabled={!token}
                >
                  {review.userVote === true ? (
                    <HandThumbUpSolid className="vote-icon" />
                  ) : (
                    <HandThumbUpIcon className="vote-icon" />
                  )}
                  <span>Sí ({review.helpfulCount})</span>
                </button>
                <button
                  className={`vote-button ${review.userVote === false ? 'active' : ''}`}
                  onClick={() => handleVote(review.id, false)}
                  disabled={!token}
                >
                  <HandThumbDownIcon className="vote-icon" />
                  <span>No ({review.notHelpfulCount})</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="review-pagination">
          <button
            disabled={pagination.page === 1}
            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
            className="pagination-button"
          >
            Anterior
          </button>
          <span className="pagination-info">
            Página {pagination.page} de {pagination.pages}
          </span>
          <button
            disabled={pagination.page === pagination.pages}
            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
            className="pagination-button"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewList;

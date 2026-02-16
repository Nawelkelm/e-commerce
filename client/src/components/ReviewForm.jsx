import React, { useState } from 'react';
import { CheckBadgeIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import StarRating from './StarRating';
import './ReviewForm.css';

const ReviewForm = ({ productId, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    rating: 0,
    title: '',
    comment: '',
    images: []
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState([]);

  const token = localStorage.getItem('token');

  const validate = () => {
    const newErrors = {};

    if (formData.rating === 0) {
      newErrors.rating = 'Por favor selecciona una calificación';
    }

    if (!formData.comment.trim()) {
      newErrors.comment = 'El comentario es obligatorio';
    } else if (formData.comment.trim().length < 10) {
      newErrors.comment = 'El comentario debe tener al menos 10 caracteres';
    }

    if (formData.title && formData.title.length > 200) {
      newErrors.title = 'El título no puede tener más de 200 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length + imagePreview.length > 5) {
      alert('Puedes subir máximo 5 imágenes');
      return;
    }

    // Create preview URLs
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreview([...imagePreview, ...newPreviews]);

    // Store files for upload (in real app, upload to server or cloud storage)
    // For now, we'll just store the preview URLs
    setFormData({
      ...formData,
      images: [...formData.images, ...newPreviews]
    });
  };

  const removeImage = (index) => {
    const newPreviews = imagePreview.filter((_, i) => i !== index);
    const newImages = formData.images.filter((_, i) => i !== index);
    
    setImagePreview(newPreviews);
    setFormData({
      ...formData,
      images: newImages
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`http://localhost:5000/api/products/${productId}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || 'Reseña enviada exitosamente');
        
        // Reset form
        setFormData({
          rating: 0,
          title: '',
          comment: '',
          images: []
        });
        setImagePreview([]);
        setErrors({});

        if (onSuccess) {
          onSuccess();
        }
      } else {
        alert(data.message || 'Error al enviar la reseña');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Error al enviar la reseña. Por favor intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="review-form-login-message">
        <p>Debes iniciar sesión para dejar una reseña</p>
        <button 
          onClick={() => window.location.href = '/login'} 
          className="login-button"
        >
          Iniciar Sesión
        </button>
      </div>
    );
  }

  return (
    <div className="review-form-container">
      <h3 className="review-form-title">Escribe tu reseña</h3>
      
      <form onSubmit={handleSubmit} className="review-form">
        {/* Rating */}
        <div className="form-group">
          <label className="form-label">
            Calificación <span className="required">*</span>
          </label>
          <StarRating
            rating={formData.rating}
            interactive={true}
            onChange={(rating) => setFormData({ ...formData, rating })}
            size="large"
          />
          {errors.rating && <span className="error-message">{errors.rating}</span>}
        </div>

        {/* Title */}
        <div className="form-group">
          <label className="form-label">Título (opcional)</label>
          <input
            type="text"
            className="form-input"
            placeholder="Resume tu experiencia en pocas palabras"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            maxLength={200}
          />
          <span className="char-count">{formData.title.length}/200</span>
          {errors.title && <span className="error-message">{errors.title}</span>}
        </div>

        {/* Comment */}
        <div className="form-group">
          <label className="form-label">
            Tu opinión <span className="required">*</span>
          </label>
          <textarea
            className="form-textarea"
            placeholder="Cuéntanos sobre tu experiencia con este producto..."
            value={formData.comment}
            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
            rows={5}
            required
          />
          <span className="char-count">
            {formData.comment.length} caracteres (mínimo 10)
          </span>
          {errors.comment && <span className="error-message">{errors.comment}</span>}
        </div>

        {/* Images */}
        <div className="form-group">
          <label className="form-label">Imágenes (opcional)</label>
          <p className="form-hint">Puedes agregar hasta 5 imágenes</p>
          
          {imagePreview.length < 5 && (
            <label className="image-upload-button">
              <PhotoIcon className="upload-icon" />
              <span>Agregar imágenes</span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="image-input"
              />
            </label>
          )}

          {imagePreview.length > 0 && (
            <div className="image-preview-grid">
              {imagePreview.map((preview, index) => (
                <div key={index} className="image-preview-item">
                  <img src={preview} alt={`Preview ${index + 1}`} />
                  <button
                    type="button"
                    className="remove-image-button"
                    onClick={() => removeImage(index)}
                  >
                    <XMarkIcon className="remove-icon" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Message */}
        <div className="info-message">
          <CheckBadgeIcon className="info-icon" />
          <p>
            Tu reseña será revisada por nuestro equipo antes de ser publicada. 
            Esto nos ayuda a mantener la calidad de las opiniones.
          </p>
        </div>

        {/* Buttons */}
        <div className="form-actions">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="cancel-button"
              disabled={submitting}
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            className="submit-button"
            disabled={submitting}
          >
            {submitting ? 'Enviando...' : 'Enviar Reseña'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm;

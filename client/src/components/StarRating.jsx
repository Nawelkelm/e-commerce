import React, { useState } from 'react';
import { StarIcon as StarIconOutline } from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import './StarRating.css';

const StarRating = ({ 
  rating = 0, 
  maxRating = 5, 
  size = 'medium', 
  interactive = false, 
  onChange = null,
  showCount = false,
  reviewCount = 0
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleClick = (value) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };

  const handleMouseEnter = (value) => {
    if (interactive) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  const getStarValue = (index) => {
    const currentRating = hoverRating || rating;
    
    if (currentRating >= index) {
      return 'full';
    } else if (currentRating > index - 1) {
      return 'half';
    }
    return 'empty';
  };

  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6',
    xlarge: 'w-8 h-8'
  };

  return (
    <div className="star-rating-container">
      <div className={`star-rating ${interactive ? 'interactive' : ''}`}>
        {[...Array(maxRating)].map((_, index) => {
          const starValue = index + 1;
          const starType = getStarValue(starValue);

          return (
            <div
              key={index}
              className={`star-wrapper ${sizeClasses[size]}`}
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
              onMouseLeave={handleMouseLeave}
            >
              {starType === 'full' && (
                <StarIconSolid className={`star star-filled ${sizeClasses[size]}`} />
              )}
              {starType === 'half' && (
                <div className="star-half-wrapper">
                  <StarIconSolid className={`star star-half ${sizeClasses[size]}`} />
                  <StarIconOutline className={`star star-outline ${sizeClasses[size]}`} />
                </div>
              )}
              {starType === 'empty' && (
                <StarIconOutline className={`star star-empty ${sizeClasses[size]}`} />
              )}
            </div>
          );
        })}
      </div>
      
      {showCount && reviewCount > 0 && (
        <span className="review-count">
          ({reviewCount} {reviewCount === 1 ? 'reseña' : 'reseñas'})
        </span>
      )}
      
      {interactive && hoverRating > 0 && (
        <span className="rating-hint">
          {hoverRating} de {maxRating}
        </span>
      )}
    </div>
  );
};

export default StarRating;

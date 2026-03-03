import React, { useState } from 'react';
import { FaTag, FaTimes, FaCheckCircle } from 'react-icons/fa';
import '../styles/CouponInput.css';

const CouponInput = ({ cartTotal, cartItems = [], onCouponApplied, onCouponRemoved }) => {
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setError('Por favor ingresa un código de cupón');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          code: couponCode,
          cartTotal,
          cartItems: cartItems.map(item => ({
            productId: item.productId || item.id,
            quantity: item.quantity,
            price: item.price
          }))
        })
      });

      const data = await response.json();

      if (data.success) {
        setAppliedCoupon(data.coupon);
        setCouponCode('');
        setError('');
        if (onCouponApplied) {
          onCouponApplied(data.coupon);
        }
      } else {
        setError(data.message || 'Cupón inválido');
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      setError('Error al aplicar el cupón. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setError('');
    if (onCouponRemoved) {
      onCouponRemoved();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleApplyCoupon();
    }
  };

  return (
    <div className="coupon-input-container">
      <div className="coupon-header">
        <FaTag className="coupon-icon" />
        <h3>¿Tienes un cupón de descuento?</h3>
      </div>

      {!appliedCoupon ? (
        <div className="coupon-form">
          <div className="input-group">
            <input
              type="text"
              className="coupon-input"
              placeholder="Ingresa tu código"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
            <button
              className="apply-coupon-btn"
              onClick={handleApplyCoupon}
              disabled={loading || !couponCode.trim()}
            >
              {loading ? 'Validando...' : 'Aplicar'}
            </button>
          </div>

          {error && (
            <div className="coupon-error">
              <FaTimes className="error-icon" />
              {error}
            </div>
          )}
        </div>
      ) : (
        <div className="coupon-applied">
          <div className="applied-info">
            <FaCheckCircle className="success-icon" />
            <div className="applied-details">
              <span className="applied-code">{appliedCoupon.code}</span>
              <span className="applied-description">{appliedCoupon.description}</span>
              <span className="applied-discount">
                Descuento: 
                {appliedCoupon.discountType === 'percentage' 
                  ? ` ${appliedCoupon.discountValue}%`
                  : ` $${appliedCoupon.discountValue}`
                }
                {appliedCoupon.discountType === 'freeShipping' && ' Envío gratis'}
              </span>
            </div>
          </div>
          <button
            className="remove-coupon-btn"
            onClick={handleRemoveCoupon}
            title="Quitar cupón"
          >
            <FaTimes />
          </button>
        </div>
      )}
    </div>
  );
};

export default CouponInput;

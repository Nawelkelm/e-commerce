import React, { useState, useEffect } from 'react';
import { FaTag, FaCopy, FaCheckCircle } from 'react-icons/fa';
import '../styles/CouponBanner.css';

const CouponBanner = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);
  const [settings, setSettings] = useState({
    couponBannerEnabled: true,
    couponBannerTitle: '¡Ofertas Especiales!',
    couponBannerSubtitle: 'Aprovecha estos cupones de descuento',
    couponBannerMaxCoupons: 3
  });

  useEffect(() => {
    fetchSettings();
    fetchPublicCoupons();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/home-settings');
      const data = await response.json();
      if (data) {
        setSettings({
          couponBannerEnabled: data.couponBannerEnabled !== undefined ? data.couponBannerEnabled : true,
          couponBannerTitle: data.couponBannerTitle || '¡Ofertas Especiales!',
          couponBannerSubtitle: data.couponBannerSubtitle || 'Aprovecha estos cupones de descuento',
          couponBannerMaxCoupons: data.couponBannerMaxCoupons || 3
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchPublicCoupons = async () => {
    try {
      const response = await fetch('/api/coupons/public');
      const data = await response.json();
      setCoupons(data.coupons || []);
    } catch (error) {
      console.error('Error fetching coupons:', error);
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDiscount = (coupon) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}% OFF`;
    } else if (coupon.discountType === 'fixed') {
      return `$${coupon.discountValue} OFF`;
    } else if (coupon.discountType === 'freeShipping') {
      return 'ENVÍO GRATIS';
    }
  };

  const formatEndDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="coupon-banner-loading">
        <div className="spinner"></div>
      </div>
    );
  }

  // No mostrar si está deshabilitado en settings
  if (!settings.couponBannerEnabled) {
    return null;
  }

  if (coupons.length === 0) {
    return null;
  }

  // Limitar cupones según la configuración
  const displayedCoupons = coupons.slice(0, settings.couponBannerMaxCoupons);

  return (
    <div className="coupon-banner">
      <div className="coupon-banner-header">
        <FaTag className="banner-icon" />
        <h2>{settings.couponBannerTitle}</h2>
        <p>{settings.couponBannerSubtitle}</p>
      </div>
      
      <div className="coupon-cards">
        {displayedCoupons.map((coupon) => (
          <div key={coupon.id} className="coupon-card">
            <div className="coupon-card-header">
              <span className="discount-badge">{formatDiscount(coupon)}</span>
            </div>
            
            <div className="coupon-card-body">
              <p className="coupon-description">{coupon.description}</p>
              
              {coupon.minPurchase > 0 && (
                <p className="coupon-condition">
                  Compra mínima: ${coupon.minPurchase}
                </p>
              )}
              
              {coupon.maxDiscount && coupon.discountType === 'percentage' && (
                <p className="coupon-condition">
                  Descuento máximo: ${coupon.maxDiscount}
                </p>
              )}
              
              <p className="coupon-expiry">
                Válido hasta: {formatEndDate(coupon.endDate)}
              </p>
            </div>
            
            <div className="coupon-card-footer">
              <div className="coupon-code-display">
                <span className="code-label">Código:</span>
                <span className="code-value">{coupon.code}</span>
              </div>
              
              <button
                className={`copy-btn ${copiedCode === coupon.code ? 'copied' : ''}`}
                onClick={() => copyToClipboard(coupon.code)}
              >
                {copiedCode === coupon.code ? (
                  <>
                    <FaCheckCircle /> Copiado
                  </>
                ) : (
                  <>
                    <FaCopy /> Copiar
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CouponBanner;

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  TagIcon, 
  ClockIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
  SparklesIcon,
  GiftIcon
} from '@heroicons/react/24/outline';
import { Helmet } from 'react-helmet-async';
import './CouponsPage.css';

const CouponsPage = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    fetchPublicCoupons();
  }, []);

  const fetchPublicCoupons = async () => {
    try {
      const response = await fetch('/api/coupons/public');
      if (response.ok) {
        const data = await response.json();
        setCoupons(data.coupons || []);
      }
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDiscountText = (coupon) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}% OFF`;
    }
    return `$${coupon.discountValue} OFF`;
  };

  if (loading) {
    return (
      <div className="coupons-page">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Cargando ofertas...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Ofertas y Cupones - TiendaKit</title>
        <meta name="description" content="Descubre nuestros cupones de descuento y ofertas especiales. Ahorra en tus compras." />
      </Helmet>

      <div className="coupons-page">
        {/* Hero Section */}
        <div className="coupons-hero">
          <div className="hero-content">
            <div className="hero-icon">
              <GiftIcon className="icon-large" />
            </div>
            <h1>Ofertas Especiales</h1>
            <p>Aprovecha nuestros cupones de descuento exclusivos</p>
          </div>
        </div>

        <div className="coupons-container">
          {coupons.length === 0 ? (
            <div className="no-coupons">
              <TagIcon className="empty-icon" />
              <h2>No hay cupones disponibles en este momento</h2>
              <p>Vuelve pronto para descubrir nuevas ofertas</p>
              <Link to="/productos" className="browse-button">
                <SparklesIcon className="button-icon" />
                Explorar Productos
              </Link>
            </div>
          ) : (
            <div className="coupons-grid">
              {coupons.map((coupon) => (
                <div key={coupon.id} className="coupon-card">
                  <div className="coupon-header">
                    <div className="discount-badge">
                      {getDiscountText(coupon)}
                    </div>
                    {coupon.isActive ? (
                      <CheckCircleIcon className="status-icon active" />
                    ) : (
                      <XCircleIcon className="status-icon inactive" />
                    )}
                  </div>

                  <div className="coupon-body">
                    <h3>{coupon.name}</h3>
                    <p className="coupon-description">{coupon.description}</p>

                    {/* Coupon Code */}
                    <div className="coupon-code-section">
                      <div className="code-display">
                        <TagIcon className="code-icon" />
                        <code className="code-text">{coupon.code}</code>
                      </div>
                      <button
                        onClick={() => copyToClipboard(coupon.code)}
                        className={`copy-button ${copiedCode === coupon.code ? 'copied' : ''}`}
                      >
                        {copiedCode === coupon.code ? '✓ Copiado' : 'Copiar'}
                      </button>
                    </div>

                    {/* Coupon Details */}
                    <div className="coupon-details">
                      {coupon.minPurchaseAmount && (
                        <div className="detail-item">
                          <span className="detail-label">Compra mínima:</span>
                          <span className="detail-value">${coupon.minPurchaseAmount}</span>
                        </div>
                      )}

                      {coupon.maxDiscountAmount && coupon.discountType === 'percentage' && (
                        <div className="detail-item">
                          <span className="detail-label">Descuento máximo:</span>
                          <span className="detail-value">${coupon.maxDiscountAmount}</span>
                        </div>
                      )}

                      {coupon.usageLimit && (
                        <div className="detail-item">
                          <span className="detail-label">Usos disponibles:</span>
                          <span className="detail-value">
                            {coupon.usageLimit - (coupon.usageCount || 0)} restantes
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Expiry Date */}
                    {coupon.expiresAt && (
                      <div className="expiry-info">
                        <ClockIcon className="clock-icon" />
                        <span>Válido hasta {formatDate(coupon.expiresAt)}</span>
                      </div>
                    )}
                  </div>

                  <div className="coupon-footer">
                    <Link to="/productos" className="shop-now-button">
                      Comprar Ahora
                      <ArrowRightIcon className="arrow-icon" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* How to Use Section */}
          <div className="how-to-use-section">
            <h2>¿Cómo usar los cupones?</h2>
            <div className="steps-grid">
              <div className="step-card">
                <div className="step-number">1</div>
                <h3>Copia el código</h3>
                <p>Haz clic en "Copiar" para guardar el código del cupón</p>
              </div>
              <div className="step-card">
                <div className="step-number">2</div>
                <h3>Compra productos</h3>
                <p>Agrega los productos que desees a tu carrito</p>
              </div>
              <div className="step-card">
                <div className="step-number">3</div>
                <h3>Aplica el cupón</h3>
                <p>En el checkout, pega el código en el campo de cupón</p>
              </div>
              <div className="step-card">
                <div className="step-number">4</div>
                <h3>¡Ahorra dinero!</h3>
                <p>Disfruta tu descuento y completa tu compra</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CouponsPage;

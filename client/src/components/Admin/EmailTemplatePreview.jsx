import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import './EmailTemplatePreview.css';

const EmailTemplatePreview = ({ template, onClose }) => {
  const [activeTab, setActiveTab] = useState('preview');

  const getTestData = (type) => {
    const baseData = {
      customerName: 'Juan Pérez',
      loginUrl: 'https://www.tu-dominio.com/login',
      shopUrl: 'https://www.tu-dominio.com/products',
      supportEmail: 'soporte@tienda.com'
    };

    switch (type) {
      case 'order_confirmation':
        return {
          ...baseData,
          orderNumber: 'ORD-2024-001',
          orderDate: new Date().toLocaleDateString('es-ES'),
          orderTotal: '$1,250.00',
          orderItems: `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">Producto de Ejemplo</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">2</td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$500.00</td>
            </tr>
            <tr>
              <td style="padding: 10px;">Otro Producto</td>
              <td style="padding: 10px; text-align: center;">1</td>
              <td style="padding: 10px; text-align: right;">$250.00</td>
            </tr>
          `,
          shippingAddress: 'Calle Falsa 123, Ciudad, País',
          trackingUrl: 'https://www.tu-dominio.com/orders/track'
        };

      case 'order_shipped':
        return {
          ...baseData,
          orderNumber: 'ORD-2024-001',
          trackingNumber: 'TRACK123456789',
          trackingUrl: 'https://www.tu-dominio.com/orders/track',
          estimatedDelivery: '5-7 días hábiles'
        };

      case 'order_delivered':
        return {
          ...baseData,
          orderNumber: 'ORD-2024-001',
          deliveryDate: new Date().toLocaleDateString('es-ES'),
          reviewUrl: 'https://www.tu-dominio.com/orders/review'
        };

      case 'abandoned_cart':
        return {
          ...baseData,
          cartItems: `
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">
                <img src="https://via.placeholder.com/60" alt="Producto" style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px;">
              </td>
              <td style="padding: 10px; border-bottom: 1px solid #eee;">
                <strong>Producto en tu Carrito</strong><br>
                <small>Descripción del producto</small>
              </td>
              <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$500.00</td>
            </tr>
          `,
          cartTotal: '$500.00',
          couponCode: 'VUELVE10',
          discountAmount: '10%',
          checkoutUrl: 'https://www.tu-dominio.com/cart'
        };

      case 'welcome':
        return baseData;

      case 'password_reset':
        return {
          ...baseData,
          resetUrl: 'https://www.tu-dominio.com/reset-password?token=example123',
          expiryTime: '1 hora'
        };

      case 'promotional':
        return {
          ...baseData,
          promoTitle: '¡Oferta Especial!',
          promoDescription: 'Aprovecha hasta 50% de descuento en productos seleccionados',
          promoImage: 'https://via.placeholder.com/600x300',
          couponCode: 'PROMO50',
          promoUrl: 'https://www.tu-dominio.com/promo',
          expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES')
        };

      case 'custom_notification':
        return {
          ...baseData,
          message: 'Este es un mensaje de notificación personalizado',
          actionText: 'Ver Detalles',
          actionUrl: 'https://www.tu-dominio.com'
        };

      default:
        return baseData;
    }
  };

  const replaceVariables = (content, variables) => {
    if (!content) return '';
    
    let result = content;
    const testData = getTestData(template.type);

    // Replace all variables with test data
    Object.keys(testData).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      result = result.replace(regex, testData[key]);
    });

    // Replace any remaining variables with placeholder
    result = result.replace(/{{(\w+)}}/g, '<span style="background: #ffeb3b; padding: 2px 4px; border-radius: 3px;">[$1]</span>');

    return result;
  };

  const getPreviewHtml = () => {
    return replaceVariables(template.htmlContent, template.variables);
  };

  const getPreviewText = () => {
    return replaceVariables(template.textContent, template.variables);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content preview-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>{template.name}</h2>
            <p className="template-subject">{template.subject}</p>
          </div>
          <button onClick={onClose} className="close-button">
            <XMarkIcon className="icon" />
          </button>
        </div>

        <div className="preview-tabs">
          <button
            className={`tab ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            Vista Previa
          </button>
          <button
            className={`tab ${activeTab === 'html' ? 'active' : ''}`}
            onClick={() => setActiveTab('html')}
          >
            Código HTML
          </button>
          <button
            className={`tab ${activeTab === 'text' ? 'active' : ''}`}
            onClick={() => setActiveTab('text')}
          >
            Texto Plano
          </button>
          <button
            className={`tab ${activeTab === 'variables' ? 'active' : ''}`}
            onClick={() => setActiveTab('variables')}
          >
            Variables ({template.variables?.length || 0})
          </button>
        </div>

        <div className="preview-content">
          {activeTab === 'preview' && (
            <div className="preview-iframe-container">
              <div className="preview-notice">
                <strong>Nota:</strong> Esta es una vista previa con datos de ejemplo.
                Las variables resaltadas en amarillo no tienen datos de prueba disponibles.
              </div>
              <iframe
                srcDoc={getPreviewHtml()}
                title="Email Preview"
                className="preview-iframe"
                sandbox="allow-same-origin"
              />
            </div>
          )}

          {activeTab === 'html' && (
            <div className="code-view">
              <pre>
                <code>{template.htmlContent}</code>
              </pre>
            </div>
          )}

          {activeTab === 'text' && (
            <div className="text-view">
              {template.textContent ? (
                <pre>{getPreviewText()}</pre>
              ) : (
                <p className="no-content">No se ha definido contenido de texto plano</p>
              )}
            </div>
          )}

          {activeTab === 'variables' && (
            <div className="variables-view">
              {template.variables && template.variables.length > 0 ? (
                <div className="variables-list">
                  <table>
                    <thead>
                      <tr>
                        <th>Variable</th>
                        <th>Uso en Plantilla</th>
                        <th>Dato de Prueba</th>
                      </tr>
                    </thead>
                    <tbody>
                      {template.variables.map(variable => {
                        const testData = getTestData(template.type);
                        return (
                          <tr key={variable}>
                            <td>
                              <code>{`{{${variable}}}`}</code>
                            </td>
                            <td className="usage-cell">
                              {template.htmlContent.includes(`{{${variable}}}`) ? (
                                <span className="badge badge-green">Usado en HTML</span>
                              ) : null}
                              {template.textContent?.includes(`{{${variable}}}`) ? (
                                <span className="badge badge-blue">Usado en Texto</span>
                              ) : null}
                              {template.subject.includes(`{{${variable}}}`) ? (
                                <span className="badge badge-purple">Usado en Asunto</span>
                              ) : null}
                            </td>
                            <td>
                              {testData[variable] ? (
                                <span className="test-data">{testData[variable]}</span>
                              ) : (
                                <span className="no-test-data">Sin datos de prueba</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="no-content">No hay variables definidas</p>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-primary">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailTemplatePreview;

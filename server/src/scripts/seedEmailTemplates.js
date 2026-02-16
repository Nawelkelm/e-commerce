const EmailTemplate = require('../models/EmailTemplate');

const emailTemplates = [
  {
    name: 'order_confirmation',
    subject: 'Confirmación de Pedido #{{orderNumber}}',
    type: 'order_confirmation',
    variables: ['customerName', 'orderNumber', 'orderDate', 'orderTotal', 'orderItems', 'shippingAddress', 'trackingUrl'],
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmación de Pedido</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: bold;">¡Gracias por tu compra!</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Tu pedido ha sido confirmado</p>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Hola {{customerName}},</h2>
              <p style="color: #666; line-height: 1.6; margin: 0 0 20px 0; font-size: 16px;">
                Hemos recibido tu pedido y lo estamos procesando. Te enviaremos una notificación cuando sea enviado.
              </p>
              
              <!-- Order Details -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 2px solid #667eea; border-radius: 8px; margin: 20px 0; overflow: hidden;">
                <tr>
                  <td style="background-color: #f8f9ff; padding: 15px; border-bottom: 1px solid #e0e0e0;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="color: #333; font-weight: bold;">Número de Pedido:</td>
                        <td style="color: #667eea; font-weight: bold; text-align: right;">{{orderNumber}}</td>
                      </tr>
                      <tr>
                        <td style="color: #333; padding-top: 10px;">Fecha:</td>
                        <td style="color: #666; text-align: right; padding-top: 10px;">{{orderDate}}</td>
                      </tr>
                      <tr>
                        <td style="color: #333; font-weight: bold; padding-top: 10px; font-size: 18px;">Total:</td>
                        <td style="color: #667eea; font-weight: bold; text-align: right; padding-top: 10px; font-size: 18px;">{{orderTotal}}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              <!-- Order Items -->
              <h3 style="color: #333; margin: 30px 0 15px 0; font-size: 20px;">Productos:</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                <thead>
                  <tr style="background-color: #f8f9fa;">
                    <th style="padding: 12px; text-align: left; color: #333; font-weight: bold; border-bottom: 2px solid #e0e0e0;">Producto</th>
                    <th style="padding: 12px; text-align: center; color: #333; font-weight: bold; border-bottom: 2px solid #e0e0e0;">Cant.</th>
                    <th style="padding: 12px; text-align: right; color: #333; font-weight: bold; border-bottom: 2px solid #e0e0e0;">Precio</th>
                    <th style="padding: 12px; text-align: right; color: #333; font-weight: bold; border-bottom: 2px solid #e0e0e0;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {{orderItems}}
                </tbody>
              </table>
              
              <!-- Shipping Address -->
              <h3 style="color: #333; margin: 30px 0 15px 0; font-size: 20px;">Dirección de Envío:</h3>
              <p style="color: #666; background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 0 0 30px 0; border-left: 4px solid #667eea;">
                {{shippingAddress}}
              </p>
              
              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="{{trackingUrl}}" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px;">Rastrear mi Pedido</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="color: #999; margin: 0; font-size: 14px;">¿Necesitas ayuda? Contáctanos en soporte@ejemplo.com</p>
              <p style="color: #999; margin: 10px 0 0 0; font-size: 12px;">© 2025 E-Commerce. Todos los derechos reservados.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    textContent: `Hola {{customerName}},\n\n¡Gracias por tu compra! Tu pedido #{{orderNumber}} ha sido confirmado.\n\nFecha: {{orderDate}}\nTotal: {{orderTotal}}\n\nDirección de envío: {{shippingAddress}}\n\nRastrear pedido: {{trackingUrl}}\n\nGracias por tu confianza.`,
    isActive: true
  },
  
  {
    name: 'order_shipped',
    subject: '¡Tu pedido #{{orderNumber}} ha sido enviado! 📦',
    type: 'order_shipped',
    variables: ['customerName', 'orderNumber', 'trackingNumber', 'estimatedDelivery', 'trackingUrl'],
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 32px;">📦 ¡En Camino!</h1>
              <p style="color: #ffffff; margin: 10px 0 0 0; font-size: 16px;">Tu pedido ya está en ruta</p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333; margin: 0 0 20px 0;">Hola {{customerName}},</h2>
              <p style="color: #666; line-height: 1.6; font-size: 16px;">
                ¡Buenas noticias! Tu pedido <strong>#{{orderNumber}}</strong> ha sido enviado y está en camino a tu dirección.
              </p>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #f8f9ff 0%, #e8fff5 100%); border-radius: 10px; padding: 25px; margin: 30px 0;">
                <tr>
                  <td>
                    <p style="margin: 0 0 15px 0; color: #666; font-size: 14px;">Número de Rastreo:</p>
                    <p style="margin: 0 0 20px 0; color: #11998e; font-size: 24px; font-weight: bold; font-family: monospace;">{{trackingNumber}}</p>
                    <p style="margin: 0 0 5px 0; color: #666; font-size: 14px;">Fecha estimada de entrega:</p>
                    <p style="margin: 0; color: #333; font-size: 18px; font-weight: bold;">{{estimatedDelivery}}</p>
                  </td>
                </tr>
              </table>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="{{trackingUrl}}" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: #ffffff; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px;">Rastrear Envío</a>
                  </td>
                </tr>
              </table>
              
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; border-radius: 4px; margin: 30px 0;">
                <p style="margin: 0; color: #856404; font-size: 14px;"><strong>💡 Tip:</strong> Mantén este email para rastrear tu paquete en cualquier momento.</p>
              </div>
            </td>
          </tr>
          
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="color: #999; margin: 0; font-size: 14px;">¿Algún problema? Contáctanos</p>
              <p style="color: #999; margin: 10px 0 0 0; font-size: 12px;">© 2025 E-Commerce</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    textContent: `Hola {{customerName}},\n\n¡Tu pedido #{{orderNumber}} ha sido enviado!\n\nNúmero de rastreo: {{trackingNumber}}\nEntrega estimada: {{estimatedDelivery}}\n\nRastrear: {{trackingUrl}}`,
    isActive: true
  },
  
  {
    name: 'order_delivered',
    subject: '✅ Tu pedido #{{orderNumber}} ha sido entregado',
    type: 'order_delivered',
    variables: ['customerName', 'orderNumber', 'deliveryDate', 'reviewUrl'],
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 50px 30px; text-align: center;">
              <div style="font-size: 60px; margin-bottom: 10px;">✅</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 32px;">¡Entregado!</h1>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              <h2 style="color: #333; margin: 0 0 20px 0;">Hola {{customerName}},</h2>
              <p style="color: #666; line-height: 1.6; font-size: 16px; margin: 0 0 30px 0;">
                Tu pedido <strong>#{{orderNumber}}</strong> ha sido entregado exitosamente el <strong>{{deliveryDate}}</strong>.
              </p>
              
              <div style="background: linear-gradient(135deg, #fff5f5 0%, #ffe5f0 100%); border-radius: 15px; padding: 30px; margin: 30px 0;">
                <p style="font-size: 24px; margin: 0 0 10px 0;">⭐⭐⭐⭐⭐</p>
                <h3 style="color: #333; margin: 0 0 15px 0; font-size: 22px;">¿Qué te pareció tu compra?</h3>
                <p style="color: #666; margin: 0 0 25px 0; font-size: 15px;">Tu opinión nos ayuda a mejorar y ayuda a otros clientes a decidir.</p>
                <a href="{{reviewUrl}}" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #ffffff; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px;">Dejar una Reseña</a>
              </div>
              
              <p style="color: #999; font-size: 14px; margin: 30px 0 0 0;">
                ¡Gracias por confiar en nosotros! Esperamos verte pronto nuevamente.
              </p>
            </td>
          </tr>
          
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="color: #999; margin: 0; font-size: 12px;">© 2025 E-Commerce</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    textContent: `Hola {{customerName}},\n\n¡Tu pedido #{{orderNumber}} ha sido entregado!\n\nFecha de entrega: {{deliveryDate}}\n\n¿Qué te pareció? Deja una reseña: {{reviewUrl}}\n\n¡Gracias!`,
    isActive: true
  },
  
  {
    name: 'abandoned_cart',
    subject: '🛒 ¡No te olvides de tus productos! + Cupón especial',
    type: 'abandoned_cart',
    variables: ['customerName', 'cartTotal', 'cartItems', 'cartUrl', 'couponCode'],
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 40px 30px; text-align: center;">
              <div style="font-size: 50px; margin-bottom: 10px;">🛒</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 28px; text-shadow: 2px 2px 4px rgba(0,0,0,0.2);">¡Te extrañamos!</h1>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333; margin: 0 0 20px 0;">Hola {{customerName}},</h2>
              <p style="color: #666; line-height: 1.6; font-size: 16px;">
                Notamos que dejaste algunos productos en tu carrito. ¡No te preocupes! Los guardamos para ti.
              </p>
              
              <h3 style="color: #333; margin: 30px 0 15px 0; font-size: 20px;">Productos en tu carrito:</h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; margin-bottom: 20px;">
                <tbody>
                  {{cartItems}}
                </tbody>
              </table>
              
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="text-align: right; padding: 15px; background-color: #f8f9fa; border-radius: 8px;">
                    <span style="color: #666; font-size: 16px;">Total: </span>
                    <span style="color: #fa709a; font-size: 24px; font-weight: bold;">{{cartTotal}}</span>
                  </td>
                </tr>
              </table>
              
              <div style="background: linear-gradient(135deg, #fff5e6 0%, #ffe0e0 100%); border-radius: 15px; padding: 25px; margin: 30px 0; text-align: center;">
                <p style="font-size: 20px; margin: 0 0 10px 0;">🎁 ¡Regalo Especial!</p>
                <p style="color: #666; margin: 0 0 15px 0; font-size: 14px;">Usa este cupón para obtener un descuento:</p>
                <div style="background-color: #ffffff; border: 2px dashed #fa709a; border-radius: 8px; padding: 15px; margin: 15px 0;">
                  <p style="margin: 0; color: #fa709a; font-size: 28px; font-weight: bold; font-family: monospace;">{{couponCode}}</p>
                </div>
                <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">* Válido por tiempo limitado</p>
              </div>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="{{cartUrl}}" style="display: inline-block; padding: 18px 50px; background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: #ffffff; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 18px; box-shadow: 0 4px 15px rgba(250, 112, 154, 0.4);">Completar mi Compra</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="color: #999; margin: 0; font-size: 12px;">© 2025 E-Commerce</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    textContent: `Hola {{customerName}},\n\nDejaste productos en tu carrito por un total de {{cartTotal}}.\n\n¡Usa el cupón {{couponCode}} para obtener un descuento!\n\nCompleta tu compra: {{cartUrl}}`,
    isActive: true
  },
  
  {
    name: 'welcome',
    subject: '¡Bienvenido a E-Commerce! 🎉',
    type: 'welcome',
    variables: ['customerName', 'loginUrl', 'shopUrl', 'supportEmail'],
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 50px 30px; text-align: center;">
              <div style="font-size: 60px; margin-bottom: 15px;">🎉</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 36px; font-weight: bold;">¡Bienvenido!</h1>
              <p style="color: #ffffff; margin: 15px 0 0 0; font-size: 18px; opacity: 0.9;">Estamos emocionados de tenerte aquí</p>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333; margin: 0 0 20px 0; font-size: 24px;">Hola {{customerName}},</h2>
              <p style="color: #666; line-height: 1.8; font-size: 16px; margin: 0 0 30px 0;">
                ¡Gracias por unirte a nuestra comunidad! Ahora tienes acceso a miles de productos, ofertas exclusivas y mucho más.
              </p>
              
              <h3 style="color: #333; margin: 30px 0 20px 0; font-size: 20px;">¿Qué puedes hacer ahora?</h3>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 30px 0;">
                <tr>
                  <td style="padding: 20px; background: linear-gradient(135deg, #f8f9ff 0%, #f0f0ff 100%); border-radius: 10px; margin-bottom: 15px;">
                    <p style="margin: 0; font-size: 24px;">🛍️</p>
                    <h4 style="color: #333; margin: 10px 0 5px 0; font-size: 18px;">Explora nuestro catálogo</h4>
                    <p style="color: #666; margin: 0; font-size: 14px;">Miles de productos esperándote</p>
                  </td>
                </tr>
              </table>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 15px 0;">
                <tr>
                  <td style="padding: 20px; background: linear-gradient(135deg, #fff8f0 0%, #fff0f0 100%); border-radius: 10px;">
                    <p style="margin: 0; font-size: 24px;">❤️</p>
                    <h4 style="color: #333; margin: 10px 0 5px 0; font-size: 18px;">Crea tu lista de favoritos</h4>
                    <p style="color: #666; margin: 0; font-size: 14px;">Guarda tus productos preferidos</p>
                  </td>
                </tr>
              </table>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 30px 0;">
                <tr>
                  <td style="padding: 20px; background: linear-gradient(135deg, #f0fff8 0%, #f0f8ff 100%); border-radius: 10px;">
                    <p style="margin: 0; font-size: 24px;">📦</p>
                    <h4 style="color: #333; margin: 10px 0 5px 0; font-size: 18px;">Rastrea tus pedidos</h4>
                    <p style="color: #666; margin: 0; font-size: 14px;">Sigue tus compras en tiempo real</p>
                  </td>
                </tr>
              </table>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="{{shopUrl}}" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; margin-right: 10px;">Empezar a Comprar</a>
                  </td>
                </tr>
              </table>
              
              <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; border-radius: 4px; margin: 30px 0;">
                <p style="margin: 0 0 10px 0; color: #333; font-weight: bold;">💡 ¿Necesitas ayuda?</p>
                <p style="margin: 0; color: #666; font-size: 14px;">Nuestro equipo está disponible en <a href="mailto:{{supportEmail}}" style="color: #667eea; text-decoration: none;">{{supportEmail}}</a></p>
              </div>
            </td>
          </tr>
          
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="color: #999; margin: 0; font-size: 14px;">¡Gracias por elegir E-Commerce!</p>
              <p style="color: #999; margin: 10px 0 0 0; font-size: 12px;">© 2025 E-Commerce. Todos los derechos reservados.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    textContent: `¡Bienvenido {{customerName}}!\n\n¡Gracias por unirte a E-Commerce!\n\nAhora puedes:\n- Explorar productos\n- Crear listas de favoritos\n- Rastrear pedidos\n\nEmpezar a comprar: {{shopUrl}}\nSoporte: {{supportEmail}}`,
    isActive: true
  },
  
  {
    name: 'password_reset',
    subject: 'Restablece tu contraseña - E-Commerce',
    type: 'password_reset',
    variables: ['customerName', 'resetUrl', 'expiryTime'],
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); padding: 40px 30px; text-align: center;">
              <div style="font-size: 50px; margin-bottom: 10px;">🔐</div>
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Restablecer Contraseña</h1>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333; margin: 0 0 20px 0;">Hola {{customerName}},</h2>
              <p style="color: #666; line-height: 1.6; font-size: 16px; margin: 0 0 30px 0;">
                Recibimos una solicitud para restablecer la contraseña de tu cuenta. Si no fuiste tú, puedes ignorar este email de forma segura.
              </p>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="{{resetUrl}}" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%); color: #ffffff; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px;">Restablecer Contraseña</a>
                  </td>
                </tr>
              </table>
              
              <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; border-radius: 4px; margin: 30px 0;">
                <p style="margin: 0 0 10px 0; color: #856404; font-weight: bold;">⏰ Importante:</p>
                <p style="margin: 0; color: #856404; font-size: 14px;">Este enlace expirará en <strong>{{expiryTime}}</strong>. Si necesitas más tiempo, solicita un nuevo enlace de restablecimiento.</p>
              </div>
              
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 30px 0;">
                <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Si el botón no funciona, copia y pega este enlace en tu navegador:</p>
                <p style="margin: 0; color: #667eea; font-size: 12px; word-break: break-all;">{{resetUrl}}</p>
              </div>
              
              <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; margin-top: 30px;">
                <p style="margin: 0; color: #999; font-size: 14px;">
                  <strong>Consejos de seguridad:</strong><br>
                  • Nunca compartas tu contraseña con nadie<br>
                  • Usa una contraseña única y fuerte<br>
                  • Habilita la autenticación de dos factores si está disponible
                </p>
              </div>
            </td>
          </tr>
          
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="color: #999; margin: 0; font-size: 14px;">Este es un email automático, por favor no respondas.</p>
              <p style="color: #999; margin: 10px 0 0 0; font-size: 12px;">© 2025 E-Commerce</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    textContent: `Hola {{customerName}},\n\nRecibimos una solicitud para restablecer tu contraseña.\n\nRestablecer: {{resetUrl}}\n\nEste enlace expirará en {{expiryTime}}.\n\nSi no solicitaste esto, ignora este email.`,
    isActive: true
  },
  
  {
    name: 'promotional',
    subject: '🎁 {{promoTitle}} - ¡No te lo pierdas!',
    type: 'promotional',
    variables: ['customerName', 'promoTitle', 'promoDescription', 'promoImage', 'couponCode', 'shopUrl'],
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 0;">
              <img src="{{promoImage}}" alt="Promoción" style="width: 100%; height: auto; display: block;">
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px 30px; text-align: center;">
              <h1 style="color: #333; margin: 0 0 20px 0; font-size: 32px; font-weight: bold;">{{promoTitle}}</h1>
              <p style="color: #666; line-height: 1.8; font-size: 18px; margin: 0 0 30px 0;">
                {{promoDescription}}
              </p>
              
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 15px; padding: 30px; margin: 30px 0;">
                <p style="color: #ffffff; margin: 0 0 15px 0; font-size: 16px; opacity: 0.9;">Usa este código en tu compra:</p>
                <div style="background-color: #ffffff; border-radius: 10px; padding: 20px; margin: 15px 0;">
                  <p style="margin: 0; color: #667eea; font-size: 36px; font-weight: bold; font-family: monospace; letter-spacing: 3px;">{{couponCode}}</p>
                </div>
                <p style="color: #ffffff; margin: 15px 0 0 0; font-size: 14px; opacity: 0.8;">🎉 ¡Oferta por tiempo limitado! 🎉</p>
              </div>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="{{shopUrl}}" style="display: inline-block; padding: 20px 60px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 18px; box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);">Comprar Ahora</a>
                  </td>
                </tr>
              </table>
              
              <p style="color: #999; font-size: 12px; margin: 30px 0 0 0; font-style: italic;">
                * Términos y condiciones aplican. Válido hasta agotar existencias.
              </p>
            </td>
          </tr>
          
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="color: #999; margin: 0; font-size: 12px;">© 2025 E-Commerce. Todos los derechos reservados.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    textContent: `Hola {{customerName}},\n\n{{promoTitle}}\n\n{{promoDescription}}\n\nCódigo: {{couponCode}}\n\nComprar ahora: {{shopUrl}}`,
    isActive: true
  },
  
  {
    name: 'custom_notification',
    subject: '{{subject}}',
    type: 'custom',
    variables: ['customerName', 'message', 'actionUrl', 'actionText'],
    htmlContent: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 28px;">E-Commerce</h1>
            </td>
          </tr>
          
          <tr>
            <td style="padding: 40px 30px;">
              <h2 style="color: #333; margin: 0 0 20px 0;">Hola {{customerName}},</h2>
              <div style="color: #666; line-height: 1.8; font-size: 16px; margin: 0 0 30px 0;">
                {{message}}
              </div>
              
              <table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="{{actionUrl}}" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px;">{{actionText}}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          
          <tr>
            <td style="background-color: #f8f9fa; padding: 30px; text-align: center; border-top: 1px solid #e0e0e0;">
              <p style="color: #999; margin: 0; font-size: 12px;">© 2025 E-Commerce</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    textContent: `Hola {{customerName}},\n\n{{message}}\n\n{{actionText}}: {{actionUrl}}`,
    isActive: true
  }
];

const seedEmailTemplates = async () => {
  try {
    console.log('🌱 Seeding email templates...');
    
    for (const templateData of emailTemplates) {
      const [template, created] = await EmailTemplate.findOrCreate({
        where: { name: templateData.name },
        defaults: templateData
      });
      
      if (created) {
        console.log(`✅ Created template: ${templateData.name}`);
      } else {
        console.log(`ℹ️  Template already exists: ${templateData.name}`);
      }
    }
    
    console.log('✨ Email templates seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding email templates:', error);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  const { sequelize } = require('../config/database');
  
  sequelize.authenticate()
    .then(() => seedEmailTemplates())
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch(error => {
      console.error('Error:', error);
      process.exit(1);
    });
}

module.exports = { seedEmailTemplates, emailTemplates };

const nodemailer = require('nodemailer');
const logger = require('../config/logger');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async sendPasswordResetEmail(email, resetToken) {
    try {
      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
      
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Password Reset - E-commerce',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset Request</h2>
            <p>You have requested to reset your password. Click the button below to proceed:</p>
            <a href="${resetUrl}" style="display: inline-block; background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
            <p>If you didn't request this, please ignore this email.</p>
            <p>This link will expire in 1 hour.</p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Password reset email sent to: ${email}`);
    } catch (error) {
      logger.error('Error sending password reset email:', error);
      throw error;
    }
  }

  async sendVerificationEmail(user, verificationToken) {
    try {
      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
      
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'E-Commerce'}" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Verifica tu cuenta - E-Commerce',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 20px; text-align: center; }
              .header h1 { color: white; margin: 0; font-size: 28px; }
              .content { padding: 40px 30px; }
              .content h2 { color: #667eea; margin-top: 0; }
              .button { display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white !important; text-decoration: none; border-radius: 50px; font-weight: bold; margin: 20px 0; }
              .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
              .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>¡Bienvenido a E-Commerce!</h1>
              </div>
              <div class="content">
                <h2>Hola ${user.firstName},</h2>
                <p>Gracias por registrarte en nuestra tienda. Para completar tu registro y activar tu cuenta, necesitamos verificar tu dirección de email.</p>
                
                <p>Haz clic en el botón de abajo para verificar tu cuenta:</p>
                
                <div style="text-align: center;">
                  <a href="${verificationUrl}" class="button">Verificar mi cuenta</a>
                </div>
                
                <div class="warning">
                  <strong>⚠️ Importante:</strong> Este enlace expirará en 24 horas. Si no verificas tu cuenta dentro de este período, deberás solicitar un nuevo enlace de verificación.
                </div>
                
                <p>Si no creaste una cuenta en nuestra tienda, puedes ignorar este email de forma segura.</p>
                
                <p>Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:</p>
                <p style="word-break: break-all; color: #667eea;">${verificationUrl}</p>
              </div>
              <div class="footer">
                <p>© ${new Date().getFullYear()} E-Commerce. Todos los derechos reservados.</p>
                <p>Este es un email automático, por favor no respondas a este mensaje.</p>
              </div>
            </div>
          </body>
          </html>
        `,
        text: `
          Hola ${user.firstName},
          
          Gracias por registrarte en E-Commerce. Para completar tu registro, verifica tu email haciendo clic en el siguiente enlace:
          
          ${verificationUrl}
          
          Este enlace expirará en 24 horas.
          
          Si no creaste una cuenta, ignora este email.
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email de verificación enviado a ${user.email}`, { messageId: info.messageId });
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error('Error al enviar email de verificación:', error);
      throw error;
    }
  }

  async sendWelcomeEmail(user) {
    try {
      const mailOptions = {
        from: `"${process.env.EMAIL_FROM_NAME || 'E-Commerce'}" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: '¡Cuenta verificada! Bienvenido a E-Commerce',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
              .content { background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white !important; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🎉 ¡Tu cuenta está activa!</h1>
              </div>
              <div class="content">
                <h2>¡Hola ${user.firstName}!</h2>
                <p>Tu email ha sido verificado exitosamente. ¡Ya puedes disfrutar de todas las funciones de nuestra tienda!</p>
                
                <p><strong>¿Qué puedes hacer ahora?</strong></p>
                <ul>
                  <li>🛍️ Explorar nuestros productos</li>
                  <li>❤️ Guardar tus favoritos</li>
                  <li>🛒 Realizar compras</li>
                  <li>📦 Rastrear tus pedidos</li>
                </ul>
                
                <div style="text-align: center;">
                  <a href="${process.env.FRONTEND_URL}/productos" class="button">Ver productos</a>
                </div>
                
                <p>Gracias por unirte a nuestra comunidad.</p>
              </div>
            </div>
          </body>
          </html>
        `
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Email de bienvenida enviado a ${user.email}`);
    } catch (error) {
      logger.error('Error al enviar email de bienvenida:', error);
    }
  }

  async sendOrderConfirmationEmail(email, orderData) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `Order Confirmation #${orderData.orderNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Order Confirmation</h2>
            <p>Thank you for your order! Here are the details:</p>
            <div style="border: 1px solid #ddd; padding: 20px; margin: 20px 0;">
              <h3>Order #${orderData.orderNumber}</h3>
              <p><strong>Total:</strong> $${orderData.total}</p>
              <p><strong>Status:</strong> ${orderData.status}</p>
              <p><strong>Estimated Delivery:</strong> ${orderData.estimatedDelivery}</p>
            </div>
            <p>You can track your order status in your account dashboard.</p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      logger.info(`Order confirmation email sent to: ${email}`);
    } catch (error) {
      logger.error('Error sending order confirmation email:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();
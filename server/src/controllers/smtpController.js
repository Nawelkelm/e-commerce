const SmtpSettings = require('../models/SmtpSettings');
const nodemailer = require('nodemailer');
const logger = require('../config/logger');

// Get SMTP settings
exports.getSettings = async (req, res) => {
  try {
    let settings = await SmtpSettings.findOne({
      order: [['createdAt', 'DESC']]
    });

    if (!settings) {
      // Create default settings
      settings = await SmtpSettings.create({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        fromName: 'Mi Tienda',
        fromEmail: 'noreply@example.com',
        isActive: false,
        provider: 'gmail'
      });
    }

    // Don't send password to frontend
    const settingsData = settings.toJSON();
    delete settingsData.password;

    res.json(settingsData);
  } catch (error) {
    logger.error('Get SMTP settings error:', error);
    res.status(500).json({ message: 'Error al obtener configuración SMTP' });
  }
};

// Update SMTP settings
exports.updateSettings = async (req, res) => {
  try {
    const {
      host,
      port,
      secure,
      user,
      password,
      fromName,
      fromEmail,
      isActive,
      testEmail,
      provider
    } = req.body;

    let settings = await SmtpSettings.findOne({
      order: [['createdAt', 'DESC']]
    });

    if (!settings) {
      // Create new settings
      settings = await SmtpSettings.create({
        host,
        port,
        secure,
        user,
        password,
        fromName,
        fromEmail,
        isActive,
        testEmail,
        provider
      });
    } else {
      // Update existing settings
      const updateData = {
        host,
        port,
        secure,
        user,
        fromName,
        fromEmail,
        isActive,
        testEmail,
        provider
      };

      // Only update password if provided
      if (password && password.trim() !== '') {
        updateData.password = password;
      }

      await settings.update(updateData);
    }

    const settingsData = settings.toJSON();
    delete settingsData.password;

    logger.info('SMTP settings updated by admin');
    res.json({ 
      message: 'Configuración SMTP actualizada exitosamente',
      settings: settingsData
    });
  } catch (error) {
    logger.error('Update SMTP settings error:', error);
    res.status(500).json({ message: 'Error al actualizar configuración SMTP' });
  }
};

// Test SMTP connection
exports.testConnection = async (req, res) => {
  try {
    const { testEmail } = req.body;

    if (!testEmail) {
      return res.status(400).json({ message: 'Email de prueba requerido' });
    }

    const settings = await SmtpSettings.findOne({
      order: [['createdAt', 'DESC']]
    });

    if (!settings) {
      return res.status(404).json({ message: 'Configuración SMTP no encontrada' });
    }

    // Create transporter with current settings
    const transporter = nodemailer.createTransporter({
      host: settings.host,
      port: settings.port,
      secure: settings.secure,
      auth: settings.user && settings.password ? {
        user: settings.user,
        pass: settings.password
      } : undefined
    });

    // Verify connection
    await transporter.verify();

    // Send test email
    await transporter.sendMail({
      from: `"${settings.fromName}" <${settings.fromEmail}>`,
      to: testEmail,
      subject: 'Prueba de Configuración SMTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #667eea;">✅ Configuración SMTP Exitosa</h2>
          <p>Este es un email de prueba para verificar que tu configuración SMTP está funcionando correctamente.</p>
          <div style="background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <strong>Detalles de la configuración:</strong><br>
            Host: ${settings.host}<br>
            Puerto: ${settings.port}<br>
            Seguro: ${settings.secure ? 'Sí (SSL/TLS)' : 'No (STARTTLS)'}<br>
            Proveedor: ${settings.provider}
          </div>
          <p style="color: #666; font-size: 14px;">
            Si recibiste este email, tu servidor SMTP está configurado correctamente y listo para enviar emails.
          </p>
        </div>
      `,
      text: `✅ Configuración SMTP Exitosa\n\nEste es un email de prueba para verificar que tu configuración SMTP está funcionando correctamente.\n\nDetalles: Host: ${settings.host}, Puerto: ${settings.port}`
    });

    // Update test status
    await settings.update({
      lastTestedAt: new Date(),
      testStatus: 'success',
      testError: null,
      testEmail
    });

    logger.info(`SMTP test successful, email sent to ${testEmail}`);
    res.json({ 
      message: 'Email de prueba enviado exitosamente',
      success: true
    });
  } catch (error) {
    logger.error('SMTP test error:', error);

    // Update test status with error
    const settings = await SmtpSettings.findOne({
      order: [['createdAt', 'DESC']]
    });

    if (settings) {
      await settings.update({
        lastTestedAt: new Date(),
        testStatus: 'failed',
        testError: error.message
      });
    }

    res.status(500).json({ 
      message: 'Error al enviar email de prueba',
      error: error.message,
      success: false
    });
  }
};

// Get provider presets
exports.getProviderPresets = async (req, res) => {
  const presets = {
    gmail: {
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      instructions: 'Para Gmail, activa la verificación en 2 pasos y genera una contraseña de aplicación en https://myaccount.google.com/apppasswords'
    },
    outlook: {
      host: 'smtp-mail.outlook.com',
      port: 587,
      secure: false,
      instructions: 'Usa tu email y contraseña de Outlook/Hotmail'
    },
    sendgrid: {
      host: 'smtp.sendgrid.net',
      port: 587,
      secure: false,
      instructions: 'Usuario: "apikey", Contraseña: Tu API Key de SendGrid'
    },
    mailgun: {
      host: 'smtp.mailgun.org',
      port: 587,
      secure: false,
      instructions: 'Usa las credenciales SMTP de tu dominio en Mailgun'
    },
    custom: {
      host: '',
      port: 587,
      secure: false,
      instructions: 'Configura manualmente tu servidor SMTP'
    }
  };

  res.json(presets);
};

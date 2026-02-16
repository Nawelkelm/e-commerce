const nodemailer = require('nodemailer');
const EmailTemplate = require('../models/EmailTemplate');
const EmailLog = require('../models/EmailLog');
const SmtpSettings = require('../models/SmtpSettings');
const Queue = require('bull');
const logger = require('../config/logger');

// Create email queue using Redis
const emailQueue = new Queue('email', {
  redis: {
    host: process.env.REDIS_HOST || 'redis',
    port: process.env.REDIS_PORT || 6379
  }
});

// Create reusable transporter with dynamic SMTP settings
const createTransporter = async () => {
  try {
    // Try to get SMTP settings from database
    const settings = await SmtpSettings.findOne({
      where: { isActive: true },
      order: [['createdAt', 'DESC']]
    });

    if (settings && settings.user && settings.password) {
      // Use database configuration
      logger.info('Using SMTP configuration from database');
      return nodemailer.createTransporter({
        host: settings.host,
        port: settings.port,
        secure: settings.secure,
        auth: {
          user: settings.user,
          pass: settings.password
        }
      });
    }

    // Fallback to environment variables
    logger.info('Using SMTP configuration from environment variables');
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || process.env.EMAIL_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASS || process.env.EMAIL_PASSWORD
      }
    });
  } catch (error) {
    logger.warn('Error loading SMTP settings, using environment variables:', error.message);
    // Fallback to environment variables
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || process.env.EMAIL_PORT || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASS || process.env.EMAIL_PASSWORD
      }
    });
  }
};

// Variable substitution function
const replaceVariables = (content, variables) => {
  if (!content || !variables) return content;
  
  let result = content;
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, variables[key] || '');
  });
  
  return result;
};

// Send email function
const sendEmail = async ({
  to,
  subject,
  html,
  text,
  templateId = null,
  orderId = null,
  userId = null,
  metadata = {}
}) => {
  let emailLog = null;
  
  try {
    // Create email log entry
    emailLog = await EmailLog.create({
      templateId,
      recipientEmail: to,
      recipientName: metadata.recipientName || null,
      subject,
      status: 'pending',
      orderId,
      userId,
      metadata
    });

    // Send email
    const transporter = await createTransporter();
    
    // Get FROM settings
    let fromName = process.env.EMAIL_FROM_NAME || 'E-Commerce';
    let fromEmail = process.env.EMAIL_FROM_ADDRESS || process.env.SMTP_USER || process.env.EMAIL_USER;
    
    try {
      const settings = await SmtpSettings.findOne({
        where: { isActive: true },
        order: [['createdAt', 'DESC']]
      });
      
      if (settings) {
        fromName = settings.fromName || fromName;
        fromEmail = settings.fromEmail || fromEmail;
      }
    } catch (err) {
      logger.warn('Could not load FROM settings:', err.message);
    }

    const info = await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to,
      subject,
      text,
      html
    });

    // Update log on success
    await emailLog.update({
      status: 'sent',
      sentAt: new Date()
    });

    logger.info(`Email sent successfully to ${to}`);

    return {
      success: true,
      messageId: info.messageId,
      logId: emailLog.id
    };

  } catch (error) {
    // Update log on failure
    if (emailLog) {
      await emailLog.update({
        status: 'failed',
        errorMessage: error.message
      });
    }

    logger.error('Error sending email:', error);
    throw error;
  }
};

// Send email from template
const sendTemplateEmail = async ({
  templateName,
  to,
  variables = {},
  orderId = null,
  userId = null,
  metadata = {}
}) => {
  try {
    // Find template
    const template = await EmailTemplate.findOne({
      where: {
        name: templateName,
        isActive: true
      }
    });

    if (!template) {
      throw new Error(`Template "${templateName}" not found or inactive`);
    }

    // Replace variables in subject and content
    const subject = replaceVariables(template.subject, variables);
    const html = replaceVariables(template.htmlContent, variables);
    const text = template.textContent ? replaceVariables(template.textContent, variables) : null;

    // Send email
    return await sendEmail({
      to,
      subject,
      html,
      text,
      templateId: template.id,
      orderId,
      userId,
      metadata: {
        ...metadata,
        templateName,
        variables
      }
    });

  } catch (error) {
    logger.error('Error sending template email:', error);
    throw error;
  }
};

// Queue email for later sending
const queueEmail = async (emailData, options = {}) => {
  try {
    const job = await emailQueue.add(emailData, {
      attempts: options.attempts || 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      },
      delay: options.delay || 0,
      removeOnComplete: true,
      removeOnFail: false
    });

    logger.info(`Email queued with job ID: ${job.id}`);

    return {
      success: true,
      jobId: job.id
    };

  } catch (error) {
    logger.error('Error queueing email:', error);
    throw error;
  }
};

// Process email queue
emailQueue.process(async (job) => {
  const { templateName, to, variables, orderId, userId, metadata } = job.data;
  
  if (templateName) {
    return await sendTemplateEmail({
      templateName,
      to,
      variables,
      orderId,
      userId,
      metadata
    });
  } else {
    return await sendEmail(job.data);
  }
});

// Queue event handlers
emailQueue.on('completed', (job, result) => {
  logger.info(`Email job ${job.id} completed successfully`);
});

emailQueue.on('failed', (job, error) => {
  logger.error(`Email job ${job.id} failed:`, error.message);
});

module.exports = {
  emailQueue,
  createTransporter,
  replaceVariables,
  sendEmail,
  sendTemplateEmail,
  queueEmail
};

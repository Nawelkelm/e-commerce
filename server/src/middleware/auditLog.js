const AuditLog = require('../models/AuditLog');
const logger = require('../config/logger');

/**
 * Middleware to log all important actions
 */
const auditLog = (action, resourceType) => {
  return async (req, res, next) => {
    const originalSend = res.send;

    res.send = function (data) {
      // Log the action after response
      const logData = {
        userId: req.user?.id || null,
        action,
        resourceType,
        resourceId: req.params.id || req.body?.id || null,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        status: res.statusCode >= 200 && res.statusCode < 300 ? 'success' : 'failure'
      };

      // For UPDATE actions, include old and new values
      if (action === 'UPDATE' && req.body) {
        logData.newValues = sanitizeSensitiveData(req.body);
      }

      // For CREATE actions, include new values
      if (action === 'CREATE' && req.body) {
        logData.newValues = sanitizeSensitiveData(req.body);
      }

      // Log errors
      if (res.statusCode >= 400) {
        try {
          const responseData = JSON.parse(data);
          logData.errorMessage = responseData.message || 'Unknown error';
        } catch (e) {
          // If not JSON, skip
        }
      }

      // Save to database asynchronously
      AuditLog.create(logData).catch(err => {
        logger.error('Failed to create audit log:', err);
      });

      // Call original send
      originalSend.call(this, data);
    };

    next();
  };
};

/**
 * Remove sensitive fields from logged data
 */
const sanitizeSensitiveData = (data) => {
  if (!data) return null;
  
  const sanitized = { ...data };
  const sensitiveFields = ['password', 'token', 'refreshToken', 'verificationToken', 'resetToken'];
  
  sensitiveFields.forEach(field => {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]';
    }
  });
  
  return sanitized;
};

/**
 * Log failed login attempts
 */
const logFailedLogin = async (email, ipAddress, userAgent, reason) => {
  try {
    await AuditLog.create({
      userId: null,
      action: 'LOGIN_FAILED',
      resourceType: 'User',
      resourceId: email,
      ipAddress,
      userAgent,
      status: 'failure',
      errorMessage: reason
    });
  } catch (error) {
    logger.error('Failed to log failed login:', error);
  }
};

module.exports = { auditLog, logFailedLogin };

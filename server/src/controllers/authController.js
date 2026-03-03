const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const { User } = require('../models');
const RefreshToken = require('../models/RefreshToken');
const AuditLog = require('../models/AuditLog');
const emailService = require('../services/emailService');
const logger = require('../config/logger');
const { logFailedLogin } = require('../middleware/auditLog');

// Generate Access JWT token
const generateAccessToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// Generate Refresh JWT token
const generateRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  });
};

// Store refresh token in database
const storeRefreshToken = async (userId, token, ipAddress, userAgent) => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

  await RefreshToken.create({
    userId,
    token,
    expiresAt,
    ipAddress,
    userAgent
  });
};

// Register new user
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { firstName, lastName, email, password, phone } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Ya existe un usuario con este email' });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // Create user (not verified)
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      role: 'customer',
      emailVerified: false,
      verificationToken,
      verificationTokenExpires
    });

    // Send verification email
    try {
      await emailService.sendVerificationEmail(user, verificationToken);
    } catch (emailError) {
      logger.error('Error sending verification email:', emailError);
      // Continue even if email fails - user can request resend
    }

    // Remove password from response
    const userResponse = { ...user.toJSON() };
    delete userResponse.password;
    delete userResponse.verificationToken;

    logger.info(`New user registered (pending verification): ${email}`);

    res.status(201).json({
      message: 'Usuario registrado exitosamente. Por favor verifica tu email para activar tu cuenta.',
      user: userResponse,
      emailSent: true
    });
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      await logFailedLogin(email, ipAddress, userAgent, 'Usuario no encontrado');
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      await logFailedLogin(email, ipAddress, userAgent, 'Email no verificado');
      return res.status(403).json({ 
        message: 'Por favor verifica tu email antes de iniciar sesión',
        emailVerified: false,
        email: user.email
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await logFailedLogin(email, ipAddress, userAgent, 'Contraseña incorrecta');
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Check if user is active
    if (!user.isActive) {
      await logFailedLogin(email, ipAddress, userAgent, 'Cuenta desactivada');
      return res.status(403).json({ message: 'Cuenta desactivada. Contacta al soporte.' });
    }

    // Update last login
    await user.update({ lastLoginAt: new Date() });

    // Generate tokens
    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // Store refresh token
    await storeRefreshToken(user.id, refreshToken, ipAddress, userAgent);

    // Log successful login
    await AuditLog.create({
      userId: user.id,
      action: 'LOGIN',
      resourceType: 'User',
      resourceId: user.id,
      ipAddress,
      userAgent,
      status: 'success'
    });

    // Remove sensitive data from response
    const userResponse = { ...user.toJSON() };
    delete userResponse.password;
    delete userResponse.verificationToken;

    logger.info(`User logged in: ${email}`);

    res.json({
      message: 'Inicio de sesión exitoso',
      token: accessToken,
      refreshToken,
      user: userResponse
    });
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      firstName, 
      lastName, 
      phone, 
      address,
      shippingAddress,
      billingAddress
    } = req.body;
    
    logger.info('Update profile request:', { 
      userId: req.user.id, 
      hasShipping: !!shippingAddress,
      hasBilling: !!billingAddress 
    });
    
    // Construir objeto de actualización solo con campos proporcionados
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (shippingAddress !== undefined) updateData.shippingAddress = shippingAddress;
    if (billingAddress !== undefined) updateData.billingAddress = billingAddress;
    
    await User.update(
      updateData,
      { where: { id: req.user.id } }
    );

    const updatedUser = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found after update' });
    }

    logger.info('Profile updated successfully for user:', req.user.id);

    res.json({
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    logger.error('Error stack:', error.stack);
    res.status(500).json({ 
      message: 'Server error', 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const user = await User.findByPk(req.user.id);

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await User.update(
      { password: hashedNewPassword },
      { where: { id: req.user.id } }
    );

    logger.info(`Password changed for user: ${user.email}`);

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    logger.error('Change password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if user exists or not
      return res.json({ message: 'If the email exists, a reset link has been sent' });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { id: user.id, type: 'password-reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Send reset email
    await emailService.sendPasswordResetEmail(user.email, resetToken);

    logger.info(`Password reset requested for: ${email}`);

    res.json({ message: 'If the email exists, a reset link has been sent' });
  } catch (error) {
    logger.error('Forgot password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, newPassword } = req.body;

    // Verify reset token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.type !== 'password-reset') {
      return res.status(400).json({ message: 'Invalid reset token' });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await User.update(
      { password: hashedPassword },
      { where: { id: decoded.id } }
    );

    logger.info(`Password reset completed for user ID: ${decoded.id}`);

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ message: 'Reset token has expired' });
    }
    logger.error('Reset password error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Verify email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Find user with this verification token
    const user = await User.findOne({ 
      where: { 
        verificationToken: token
      } 
    });

    if (!user) {
      return res.status(400).json({ message: 'Token de verificación inválido o expirado' });
    }

    // Check if token has expired
    if (new Date() > user.verificationTokenExpires) {
      return res.status(400).json({ 
        message: 'El token de verificación ha expirado. Por favor solicita uno nuevo.',
        expired: true
      });
    }

    // Check if already verified
    if (user.emailVerified) {
      return res.status(200).json({ 
        message: 'Email ya verificado',
        alreadyVerified: true
      });
    }

    // Update user
    await user.update({
      emailVerified: true,
      verificationToken: null,
      verificationTokenExpires: null
    });

    // Send welcome email
    try {
      await emailService.sendWelcomeEmail(user);
    } catch (emailError) {
      logger.error('Error sending welcome email:', emailError);
    }

    logger.info(`Email verified for user: ${user.email}`);

    res.json({ 
      message: '¡Email verificado exitosamente! Ya puedes iniciar sesión.',
      verified: true
    });
  } catch (error) {
    logger.error('Verify email error:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Resend verification email
const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    // Find user
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // Check if already verified
    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email ya verificado' });
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    // Update user
    await user.update({
      verificationToken,
      verificationTokenExpires
    });

    // Send verification email
    await emailService.sendVerificationEmail(user, verificationToken);

    logger.info(`Verification email resent to: ${email}`);

    res.json({ 
      message: 'Email de verificación enviado. Por favor revisa tu bandeja de entrada.',
      emailSent: true
    });
  } catch (error) {
    logger.error('Resend verification email error:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Refresh access token using refresh token
const refreshAccessToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token requerido' });
    }

    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({ message: 'Refresh token inválido o expirado' });
    }

    // Find refresh token in database
    const storedToken = await RefreshToken.findOne({
      where: { token: refreshToken, isRevoked: false }
    });

    if (!storedToken) {
      return res.status(401).json({ message: 'Refresh token no válido' });
    }

    // Check if expired
    if (new Date() > storedToken.expiresAt) {
      await storedToken.update({ isRevoked: true });
      return res.status(401).json({ message: 'Refresh token expirado' });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(decoded.id);

    logger.info(`Access token refreshed for user: ${decoded.id}`);

    res.json({
      token: newAccessToken,
      message: 'Token renovado exitosamente'
    });
  } catch (error) {
    logger.error('Refresh token error:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// Logout and revoke refresh token
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      // Revoke the refresh token
      await RefreshToken.update(
        { isRevoked: true },
        { where: { token: refreshToken } }
      );
    }

    // Log logout
    if (req.user) {
      await AuditLog.create({
        userId: req.user.id,
        action: 'LOGOUT',
        resourceType: 'User',
        resourceId: req.user.id,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent'),
        status: 'success'
      });
    }

    logger.info(`User logged out: ${req.user?.email || 'unknown'}`);

    res.json({ message: 'Sesión cerrada exitosamente' });
  } catch (error) {
    logger.error('Logout error:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  refreshAccessToken,
  logout
};
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const auth = async (req, res, next) => {
  try {
    console.log('=== AUTH MIDDLEWARE ===');
    console.log('Request URL:', req.url);
    console.log('Authorization header:', req.header('Authorization'));
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      console.log('No token provided');
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    console.log('Token to verify:', token.substring(0, 50) + '...');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token decoded:', decoded);
    
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      console.log('User not found for id:', decoded.id);
      return res.status(401).json({ message: 'Invalid token.' });
    }

    console.log('User found:', { id: user.id, email: user.email, role: user.role });
    req.user = user;
    next();
  } catch (error) {
    console.error('AUTH ERROR:', error.message);
    res.status(401).json({ message: 'Invalid token.' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    console.log('=== ADMIN AUTH MIDDLEWARE ===');
    await auth(req, res, () => {
      console.log('Auth passed, checking role:', req.user?.role);
      if (req.user.role !== 'admin') {
        console.log('User is not admin, denying access');
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
      }
      console.log('Admin check passed, proceeding to controller');
      next();
    });
  } catch (error) {
    console.error('ADMIN AUTH ERROR:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { auth, adminAuth };
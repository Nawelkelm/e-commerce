const { User, Role, Permission } = require('../models');
const logger = require('../config/logger');

// Cache for user permissions (in production, use Redis)
const permissionCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const clearUserPermissionCache = (userId) => {
  permissionCache.delete(userId);
};

const getUserPermissions = async (userId) => {
  // Check cache first
  const cached = permissionCache.get(userId);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.permissions;
  }

  try {
    let user;
    let permissions = [];

    // Try full query with role and permissions
    try {
      user = await User.findByPk(userId, {
        include: {
          model: Role,
          as: 'userRole',
          include: {
            model: Permission,
            through: { attributes: [] }
          }
        }
      });
    } catch (includeError) {
      logger.warn('Error loading role/permissions associations, falling back to basic user query:', includeError.message);
      // Fallback: load user without associations
      user = await User.findByPk(userId);
    }

    if (!user) {
      return [];
    }
    
    if (user?.userRole?.Permissions && user.userRole.Permissions.length > 0) {
      permissions = user.userRole.Permissions.map(p => p.name);
    } else if (user?.role === 'admin') {
      // Fallback to legacy role system - admin has all permissions
      permissions = ['*']; // Wildcard for all permissions
    } else if (user?.role === 'customer') {
      // Basic customer permissions
      permissions = ['profile.read', 'profile.update', 'orders.read'];
    }

    // Cache the result
    permissionCache.set(userId, {
      permissions,
      timestamp: Date.now()
    });

    return permissions;
  } catch (error) {
    logger.error('Error fetching user permissions:', error);
    
    // Last resort fallback - try to get basic user info
    try {
      const basicUser = await User.findByPk(userId, { attributes: ['id', 'role'] });
      if (basicUser?.role === 'admin') {
        return ['*'];
      }
    } catch (e) {
      logger.error('Critical: Cannot even fetch basic user info:', e.message);
    }
    return [];
  }
};

const hasPermission = (userPermissions, requiredPermission) => {
  // Admin wildcard check
  if (userPermissions.includes('*')) {
    return true;
  }
  
  // Direct permission match
  if (userPermissions.includes(requiredPermission)) {
    return true;
  }
  
  // Check for wildcard permissions (e.g., 'users.*' covers 'users.create', 'users.read', etc.)
  const parts = requiredPermission.split('.');
  for (let i = parts.length - 1; i > 0; i--) {
    const wildcardPermission = parts.slice(0, i).join('.') + '.*';
    if (userPermissions.includes(wildcardPermission)) {
      return true;
    }
  }
  
  return false;
};

const requirePermission = (permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const userPermissions = await getUserPermissions(req.user.id);
      
      if (hasPermission(userPermissions, permission)) {
        return next();
      }

      logger.warn(`Permission denied for user ${req.user.id}: required ${permission}, has ${userPermissions.join(', ')}`);
      return res.status(403).json({ 
        message: 'Permission denied',
        required: permission,
        permissions: userPermissions
      });
    } catch (error) {
      logger.error('Permission check error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};

const requireAnyPermission = (permissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const userPermissions = await getUserPermissions(req.user.id);
      
      for (const permission of permissions) {
        if (hasPermission(userPermissions, permission)) {
          return next();
        }
      }

      logger.warn(`Permission denied for user ${req.user.id}: required any of ${permissions.join(', ')}, has ${userPermissions.join(', ')}`);
      return res.status(403).json({ 
        message: 'Permission denied',
        required: permissions,
        permissions: userPermissions
      });
    } catch (error) {
      logger.error('Permission check error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};

const requireAllPermissions = (permissions) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const userPermissions = await getUserPermissions(req.user.id);
      
      for (const permission of permissions) {
        if (!hasPermission(userPermissions, permission)) {
          logger.warn(`Permission denied for user ${req.user.id}: missing ${permission}`);
          return res.status(403).json({ 
            message: 'Permission denied',
            required: permissions,
            missing: permission,
            permissions: userPermissions
          });
        }
      }

      return next();
    } catch (error) {
      logger.error('Permission check error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
};

// Utility function to check permissions without middleware
const checkUserPermission = async (userId, permission) => {
  try {
    const userPermissions = await getUserPermissions(userId);
    return hasPermission(userPermissions, permission);
  } catch (error) {
    logger.error('Error checking user permission:', error);
    return false;
  }
};

module.exports = {
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  checkUserPermission,
  getUserPermissions,
  clearUserPermissionCache,
  hasPermission
};
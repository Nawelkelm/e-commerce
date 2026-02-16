const { validationResult } = require('express-validator');
const { Role, Permission, RolePermission, User } = require('../models');
const logger = require('../config/logger');
const { clearUserPermissionCache } = require('../middleware/permissions');
const { Op } = require('sequelize');

// Get all roles with permissions
const getRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({
      include: {
        model: Permission,
        through: { attributes: [] }
      },
      order: [['createdAt', 'DESC']]
    });

    res.json(roles);
  } catch (error) {
    logger.error('Get roles error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single role with permissions
const getRole = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findByPk(id, {
      include: [
        {
          model: Permission,
          through: { attributes: [] }
        },
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email'],
          limit: 10
        }
      ]
    });

    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Get user count for this role
    const userCount = await User.count({ where: { roleId: id } });

    res.json({
      ...role.toJSON(),
      userCount
    });
  } catch (error) {
    logger.error('Get role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new role
const createRole = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, displayName, description, permissions = [] } = req.body;

    // Check if role name exists
    const existingRole = await Role.findOne({ where: { name } });
    if (existingRole) {
      return res.status(400).json({ message: 'Role name already exists' });
    }

    // Create role
    const role = await Role.create({
      name,
      displayName,
      description
    });

    // Add permissions if provided
    if (permissions.length > 0) {
      const validPermissions = await Permission.findAll({
        where: { id: { [Op.in]: permissions } }
      });

      await role.setPermissions(validPermissions);
    }

    // Fetch role with permissions for response
    const roleWithPermissions = await Role.findByPk(role.id, {
      include: {
        model: Permission,
        through: { attributes: [] }
      }
    });

    logger.info(`Role created: ${name} by admin ${req.user.id}`);
    res.status(201).json({
      message: 'Role created successfully',
      role: roleWithPermissions
    });
  } catch (error) {
    logger.error('Create role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update role
const updateRole = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, displayName, description, permissions = [] } = req.body;

    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Prevent updating system roles
    if (role.isSystemRole) {
      return res.status(400).json({ message: 'Cannot update system roles' });
    }

    // Check if name is changing and if it already exists
    if (name !== role.name) {
      const existingRole = await Role.findOne({ 
        where: { 
          name, 
          id: { [Op.ne]: id } 
        } 
      });
      if (existingRole) {
        return res.status(400).json({ message: 'Role name already exists' });
      }
    }

    // Update role
    await role.update({ name, displayName, description });

    // Update permissions
    const validPermissions = await Permission.findAll({
      where: { id: { [Op.in]: permissions } }
    });
    await role.setPermissions(validPermissions);

    // Clear permission cache for all users with this role
    const usersWithRole = await User.findAll({
      where: { roleId: id },
      attributes: ['id']
    });
    usersWithRole.forEach(user => clearUserPermissionCache(user.id));

    // Fetch updated role with permissions
    const updatedRole = await Role.findByPk(id, {
      include: {
        model: Permission,
        through: { attributes: [] }
      }
    });

    logger.info(`Role updated: ${id} by admin ${req.user.id}`);
    res.json({
      message: 'Role updated successfully',
      role: updatedRole
    });
  } catch (error) {
    logger.error('Update role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete role
const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Prevent deleting system roles
    if (role.isSystemRole) {
      return res.status(400).json({ message: 'Cannot delete system roles' });
    }

    // Check if role is being used by users
    const userCount = await User.count({ where: { roleId: id } });
    if (userCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete role. ${userCount} users are currently assigned to this role.`,
        userCount
      });
    }

    await role.destroy();

    logger.info(`Role deleted: ${id} by admin ${req.user.id}`);
    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    logger.error('Delete role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all permissions grouped by category
const getPermissions = async (req, res) => {
  try {
    const permissions = await Permission.findAll({
      order: [['category', 'ASC'], ['displayName', 'ASC']]
    });

    // Group permissions by category
    const groupedPermissions = permissions.reduce((acc, permission) => {
      const category = permission.category;
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(permission);
      return acc;
    }, {});

    res.json(groupedPermissions);
  } catch (error) {
    logger.error('Get permissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new permission
const createPermission = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, resource, action, displayName, description, category } = req.body;

    // Check if permission exists
    const existingPermission = await Permission.findOne({ where: { name } });
    if (existingPermission) {
      return res.status(400).json({ message: 'Permission already exists' });
    }

    const permission = await Permission.create({
      name,
      resource,
      action,
      displayName,
      description,
      category
    });

    logger.info(`Permission created: ${name} by admin ${req.user.id}`);
    res.status(201).json({
      message: 'Permission created successfully',
      permission
    });
  } catch (error) {
    logger.error('Create permission error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Assign role to user
const assignUserRole = async (req, res) => {
  try {
    const { userId, roleId } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(404).json({ message: 'Role not found' });
    }

    // Update user role
    await user.update({ roleId });

    // Clear user permission cache
    clearUserPermissionCache(userId);

    logger.info(`Role ${roleId} assigned to user ${userId} by admin ${req.user.id}`);
    res.json({ message: 'Role assigned successfully' });
  } catch (error) {
    logger.error('Assign user role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get user permissions
const getUserPermissions = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId, {
      include: {
        model: Role,
        as: 'userRole',
        include: {
          model: Permission,
          through: { attributes: [] }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let permissions = [];
    if (user.userRole?.Permissions) {
      permissions = user.userRole.Permissions;
    }

    res.json({
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        userRole: user.userRole
      },
      permissions
    });
  } catch (error) {
    logger.error('Get user permissions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getRoles,
  getRole,
  createRole,
  updateRole,
  deleteRole,
  getPermissions,
  createPermission,
  assignUserRole,
  getUserPermissions
};
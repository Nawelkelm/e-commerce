const { sequelize, Role, Permission, User } = require('../models');
const logger = require('../config/logger');

const defaultPermissions = [
  // User Management
  { name: 'users.read', resource: 'users', action: 'read', displayName: 'Ver Usuarios', description: 'Permite ver la lista de usuarios y sus detalles', category: 'user_management' },
  { name: 'users.create', resource: 'users', action: 'create', displayName: 'Crear Usuarios', description: 'Permite crear nuevos usuarios', category: 'user_management' },
  { name: 'users.update', resource: 'users', action: 'update', displayName: 'Editar Usuarios', description: 'Permite modificar información de usuarios existentes', category: 'user_management' },
  { name: 'users.delete', resource: 'users', action: 'delete', displayName: 'Eliminar Usuarios', description: 'Permite desactivar/eliminar usuarios', category: 'user_management' },
  { name: 'users.*', resource: 'users', action: '*', displayName: 'Gestión Completa de Usuarios', description: 'Acceso completo a la gestión de usuarios', category: 'user_management' },

  // Product Management
  { name: 'products.read', resource: 'products', action: 'read', displayName: 'Ver Productos', description: 'Permite ver productos y su información', category: 'product_management' },
  { name: 'products.create', resource: 'products', action: 'create', displayName: 'Crear Productos', description: 'Permite crear nuevos productos', category: 'product_management' },
  { name: 'products.update', resource: 'products', action: 'update', displayName: 'Editar Productos', description: 'Permite modificar productos existentes', category: 'product_management' },
  { name: 'products.delete', resource: 'products', action: 'delete', displayName: 'Eliminar Productos', description: 'Permite eliminar productos', category: 'product_management' },
  { name: 'products.stock', resource: 'products', action: 'stock', displayName: 'Gestionar Inventario', description: 'Permite actualizar stock de productos', category: 'product_management' },
  { name: 'products.*', resource: 'products', action: '*', displayName: 'Gestión Completa de Productos', description: 'Acceso completo a la gestión de productos', category: 'product_management' },

  // Order Management
  { name: 'orders.read', resource: 'orders', action: 'read', displayName: 'Ver Pedidos', description: 'Permite ver pedidos y su información', category: 'order_management' },
  { name: 'orders.update', resource: 'orders', action: 'update', displayName: 'Actualizar Pedidos', description: 'Permite cambiar estado de pedidos y añadir notas', category: 'order_management' },
  { name: 'orders.process', resource: 'orders', action: 'process', displayName: 'Procesar Pedidos', description: 'Permite procesar pedidos y gestionar envíos', category: 'order_management' },
  { name: 'orders.*', resource: 'orders', action: '*', displayName: 'Gestión Completa de Pedidos', description: 'Acceso completo a la gestión de pedidos', category: 'order_management' },

  // Category Management
  { name: 'categories.read', resource: 'categories', action: 'read', displayName: 'Ver Categorías', description: 'Permite ver categorías de productos', category: 'product_management' },
  { name: 'categories.create', resource: 'categories', action: 'create', displayName: 'Crear Categorías', description: 'Permite crear nuevas categorías', category: 'product_management' },
  { name: 'categories.update', resource: 'categories', action: 'update', displayName: 'Editar Categorías', description: 'Permite modificar categorías existentes', category: 'product_management' },
  { name: 'categories.delete', resource: 'categories', action: 'delete', displayName: 'Eliminar Categorías', description: 'Permite eliminar categorías', category: 'product_management' },

  // Analytics and Reports
  { name: 'analytics.read', resource: 'analytics', action: 'read', displayName: 'Ver Analíticas', description: 'Permite ver reportes y analíticas de ventas', category: 'analytics' },
  { name: 'analytics.export', resource: 'analytics', action: 'export', displayName: 'Exportar Reportes', description: 'Permite exportar reportes y datos', category: 'analytics' },

  // Role Management
  { name: 'roles.read', resource: 'roles', action: 'read', displayName: 'Ver Roles', description: 'Permite ver roles y permisos', category: 'system_management' },
  { name: 'roles.create', resource: 'roles', action: 'create', displayName: 'Crear Roles', description: 'Permite crear nuevos roles', category: 'system_management' },
  { name: 'roles.update', resource: 'roles', action: 'update', displayName: 'Editar Roles', description: 'Permite modificar roles y asignar permisos', category: 'system_management' },
  { name: 'roles.delete', resource: 'roles', action: 'delete', displayName: 'Eliminar Roles', description: 'Permite eliminar roles personalizados', category: 'system_management' },
  { name: 'roles.assign', resource: 'roles', action: 'assign', displayName: 'Asignar Roles', description: 'Permite asignar roles a usuarios', category: 'system_management' },

  // Settings Management
  { name: 'settings.read', resource: 'settings', action: 'read', displayName: 'Ver Configuración', description: 'Permite ver configuración del sistema', category: 'system_management' },
  { name: 'settings.update', resource: 'settings', action: 'update', displayName: 'Modificar Configuración', description: 'Permite modificar configuración del sistema', category: 'system_management' },

  // Profile Management
  { name: 'profile.read', resource: 'profile', action: 'read', displayName: 'Ver Perfil', description: 'Permite ver su propio perfil', category: 'profile' },
  { name: 'profile.update', resource: 'profile', action: 'update', displayName: 'Editar Perfil', description: 'Permite editar su propio perfil', category: 'profile' }
];

const defaultRoles = [
  {
    name: 'super_admin',
    displayName: 'Super Administrador',
    description: 'Acceso completo al sistema, no puede ser eliminado',
    isSystemRole: true,
    permissions: ['*'] // Special permission for full access
  },
  {
    name: 'admin',
    displayName: 'Administrador',
    description: 'Acceso completo a gestión de productos, pedidos y usuarios',
    isSystemRole: true,
    permissions: [
      'users.*', 'products.*', 'orders.*', 'categories.*', 
      'analytics.read', 'analytics.export', 'settings.read'
    ]
  },
  {
    name: 'manager',
    displayName: 'Gerente',
    description: 'Gestión de productos, pedidos y visualización de analíticas',
    isSystemRole: false,
    permissions: [
      'users.read', 'products.*', 'orders.*', 'categories.*', 
      'analytics.read'
    ]
  },
  {
    name: 'operator',
    displayName: 'Operador',
    description: 'Gestión básica de pedidos y productos',
    isSystemRole: false,
    permissions: [
      'products.read', 'products.update', 'products.stock',
      'orders.read', 'orders.update', 'categories.read'
    ]
  },
  {
    name: 'viewer',
    displayName: 'Visualizador',
    description: 'Solo lectura del sistema',
    isSystemRole: false,
    permissions: [
      'users.read', 'products.read', 'orders.read', 
      'categories.read', 'analytics.read'
    ]
  },
  {
    name: 'customer',
    displayName: 'Cliente',
    description: 'Rol básico para clientes del e-commerce',
    isSystemRole: true,
    permissions: [
      'profile.read', 'profile.update', 'orders.read'
    ]
  }
];

const initializeRolesAndPermissions = async () => {
  const transaction = await sequelize.transaction();
  
  try {
    logger.info('Initializing roles and permissions...');

    // Create permissions
    for (const permissionData of defaultPermissions) {
      const [permission, created] = await Permission.findOrCreate({
        where: { name: permissionData.name },
        defaults: permissionData,
        transaction
      });
      
      if (created) {
        logger.info(`Created permission: ${permission.name}`);
      }
    }

    // Create special "all permissions" permission
    const [allPermission] = await Permission.findOrCreate({
      where: { name: '*' },
      defaults: {
        name: '*',
        resource: '*',
        action: '*',
        displayName: 'Todos los Permisos',
        description: 'Acceso completo a todas las funcionalidades del sistema',
        category: 'system_management'
      },
      transaction
    });

    // Create roles and assign permissions
    for (const roleData of defaultRoles) {
      const { permissions: rolePermissions, ...roleInfo } = roleData;
      
      const [role, created] = await Role.findOrCreate({
        where: { name: roleData.name },
        defaults: roleInfo,
        transaction
      });

      // Always ensure correct permissions are assigned (idempotent)
      {
        // Find permissions to assign
        let permissionsToAssign = [];
        
        if (rolePermissions.includes('*')) {
          permissionsToAssign = [allPermission];
        } else {
          permissionsToAssign = await Permission.findAll({
            where: { name: { [sequelize.Sequelize.Op.in]: rolePermissions } },
            transaction
          });
        }

        // Get current permissions
        const currentPermissions = await role.getPermissions({ transaction });
        const currentNames = currentPermissions.map(p => p.name).sort();
        const targetNames = permissionsToAssign.map(p => p.name).sort();
        
        // Only update if permissions differ
        if (JSON.stringify(currentNames) !== JSON.stringify(targetNames)) {
          await role.setPermissions(permissionsToAssign, { transaction });
          logger.info(`${created ? 'Created' : 'Updated'} role: ${role.name} with ${permissionsToAssign.length} permissions`);
        } else if (created) {
          logger.info(`Created role: ${role.name} with ${permissionsToAssign.length} permissions`);
        }
      }
    }

    await transaction.commit();
    logger.info('Roles and permissions initialized successfully');
    
    return true;
  } catch (error) {
    await transaction.rollback();
    logger.error('Error initializing roles and permissions:', error);
    throw error;
  }
};

// Function to assign super admin role to existing admin users
const assignSuperAdminRole = async () => {
  try {
    const superAdminRole = await Role.findOne({ where: { name: 'super_admin' } });
    if (!superAdminRole) {
      logger.warn('Super admin role not found');
      return;
    }

    // Find admin users without advanced roles
    const adminUsers = await User.findAll({
      where: {
        role: 'admin',
        roleId: null
      }
    });

    for (const user of adminUsers) {
      await user.update({ roleId: superAdminRole.id });
      logger.info(`Assigned super admin role to user: ${user.email}`);
    }

    // Assign customer role to customer users
    const customerRole = await Role.findOne({ where: { name: 'customer' } });
    if (customerRole) {
      const customerUsers = await User.findAll({
        where: {
          role: 'customer',
          roleId: null
        }
      });

      for (const user of customerUsers) {
        await user.update({ roleId: customerRole.id });
        logger.info(`Assigned customer role to user: ${user.email}`);
      }
    }

  } catch (error) {
    logger.error('Error assigning super admin roles:', error);
    throw error;
  }
};

module.exports = {
  initializeRolesAndPermissions,
  assignSuperAdminRole,
  defaultPermissions,
  defaultRoles
};
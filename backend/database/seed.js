const sequelize = require('./connection');
const { Company, Branch, SystemModule, Role, User, UserProfile } = require('../models');
const { hashPassword } = require('../utils/password');

const seed = async () => {
  try {
    console.log('Conectando a la base de datos...');
    await sequelize.authenticate();

    console.log('Creando empresa por defecto...');
    const company = await Company.create({
      name: 'Mi Empresa',
      nit: '123456789',
      address: 'Dirección Principal',
      phone: '+57 300 123 4567',
      email: 'info@miempresa.com',
      is_active: true
    });

    console.log('Creando sucursal por defecto...');
    const branch = await Branch.create({
      company_id: company.id,
      name: 'Sucursal Principal',
      code: 'SUC001',
      address: 'Dirección de Sucursal',
      phone: '+57 300 123 4568',
      is_active: true
    });

    console.log('Creando módulos del sistema...');
    const modules = await SystemModule.bulkCreate([
      { code: 'security', name: 'Seguridad', description: 'Gestión de usuarios, roles y permisos', icon: 'shield', order_index: 1, is_active: true },
      { code: 'inventory', name: 'Inventario', description: 'Gestión de productos e inventario', icon: 'package', order_index: 2, is_active: false },
      { code: 'sales', name: 'Ventas', description: 'Gestión de ventas y facturación', icon: 'shopping-cart', order_index: 3, is_active: false },
      { code: 'purchases', name: 'Compras', description: 'Gestión de compras y proveedores', icon: 'truck', order_index: 4, is_active: false },
      { code: 'accounting', name: 'Contabilidad', description: 'Gestión contable y financiera', icon: 'calculator', order_index: 5, is_active: false },
      { code: 'reports', name: 'Reportes', description: 'Reportes y análisis', icon: 'bar-chart', order_index: 6, is_active: false }
    ]);

    console.log('Creando rol de administrador...');
    const adminRole = await Role.create({
      company_id: company.id,
      name: 'Administrador',
      description: 'Acceso total al sistema',
      permissions: {
        security: ['create', 'read', 'update', 'delete', 'configure'],
        inventory: ['create', 'read', 'update', 'delete', 'configure'],
        sales: ['create', 'read', 'update', 'delete', 'configure'],
        purchases: ['create', 'read', 'update', 'delete', 'configure'],
        accounting: ['create', 'read', 'update', 'delete', 'configure'],
        reports: ['read', 'configure']
      },
      is_active: true
    });

    console.log('Creando rol de usuario estándar...');
    const userRole = await Role.create({
      company_id: company.id,
      name: 'Usuario',
      description: 'Acceso básico al sistema',
      permissions: {
        security: ['read'],
        inventory: ['read', 'update'],
        sales: ['create', 'read', 'update'],
        purchases: ['read'],
        accounting: ['read'],
        reports: ['read']
      },
      is_active: true
    });

    console.log('Creando usuario administrador...');
    const adminPassword = await hashPassword('admin123');
    const adminUser = await User.create({
      company_id: company.id,
      branch_id: branch.id,
      role_id: adminRole.id,
      email: 'admin@miempresa.com',
      password_hash: adminPassword,
      is_active: true
    });

    await UserProfile.create({
      user_id: adminUser.id,
      first_name: 'Administrador',
      last_name: 'Sistema',
      phone: '+57 300 123 4567'
    });

    console.log('Seed completado exitosamente');
    console.log('=========================');
    console.log('Usuario admin: admin@miempresa.com');
    console.log('Contraseña: admin123');
    console.log('=========================');

    process.exit(0);
  } catch (error) {
    console.error('Error en seed:', error);
    process.exit(1);
  }
};

seed();
const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');
const SystemModule = require('../models/SystemModule');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token no proporcionado' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }

    if (decoded.type === 'refresh') {
      return res.status(401).json({ error: 'Usar token de acceso, no refresh' });
    }

    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password_hash'] },
      include: [{ model: Role, as: 'role' }]
    });

    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'Usuario no encontrado o inactivo' });
    }

    req.user = user;
    req.userId = decoded.id;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Error en autenticación' });
  }
};

const checkModule = (moduleCode) => {
  return async (req, res, next) => {
    try {
      const module = await SystemModule.findOne({ where: { code: moduleCode } });
      
      if (!module) {
        return res.status(404).json({ error: `Módulo ${moduleCode} no existe` });
      }

      if (!module.is_active) {
        return res.status(403).json({ error: `Módulo ${moduleCode} está desactivado` });
      }

      req.module = module;
      next();
    } catch (error) {
      console.error('Module check error:', error);
      res.status(500).json({ error: 'Error verificando módulo' });
    }
  };
};

const checkPermission = (moduleCode, permission) => {
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.role || !req.user.role.permissions) {
        return res.status(403).json({ error: 'Sin permisos' });
      }

      const permissions = req.user.role.permissions[moduleCode] || [];
      
      if (!permissions.includes(permission) && !permissions.includes('*')) {
        return res.status(403).json({ error: `Sin permiso: ${permission} en ${moduleCode}` });
      }

      next();
    } catch (error) {
      console.error('Permission check error:', error);
      res.status(500).json({ error: 'Error verificando permisos' });
    }
  };
};

const Role = require('../models/Role');

module.exports = {
  authenticate,
  checkModule,
  checkPermission
};
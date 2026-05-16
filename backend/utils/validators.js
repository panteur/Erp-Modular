const { body } = require('express-validator');

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 1 })
    .withMessage('Contraseña requerida')
];

const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Contraseña mínimo 6 caracteres'),
  body('first_name')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('last_name')
    .optional()
    .trim()
    .isLength({ max: 100 })
];

const userValidation = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  body('first_name')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('last_name')
    .optional()
    .trim()
    .isLength({ max: 100 }),
  body('phone')
    .optional()
    .trim()
    .isLength({ max: 20 }),
  body('role_id')
    .isInt({ min: 1 })
    .withMessage('Rol requerido'),
  body('company_id')
    .optional()
    .isInt({ min: 1 }),
  body('branch_id')
    .optional()
    .isInt({ min: 1 })
];

const roleValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Nombre requerido (1-100 caracteres)'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 255 }),
  body('permissions')
    .optional()
    .isJSON()
    .withMessage('Permisos debe ser JSON válido'),
  body('company_id')
    .isInt({ min: 1 })
    .withMessage('Empresa requerida')
];

const changePasswordValidation = [
  body('current_password')
    .isLength({ min: 1 })
    .withMessage('Contraseña actual requerida'),
  body('new_password')
    .isLength({ min: 6 })
    .withMessage('Nueva contraseña mínimo 6 caracteres')
];

const forgotPasswordValidation = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail()
];

const resetPasswordValidation = [
  body('token')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Token requerido'),
  body('new_password')
    .isLength({ min: 6 })
    .withMessage('Nueva contraseña mínimo 6 caracteres')
];

module.exports = {
  loginValidation,
  registerValidation,
  userValidation,
  roleValidation,
  changePasswordValidation,
  forgotPasswordValidation,
  resetPasswordValidation
};
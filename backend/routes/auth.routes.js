const express = require('express');
const router = express.Router();
const { loginValidation } = require('../utils/validators');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const authController = require('../controllers/auth.controller');

router.post('/login', loginValidation, validate, authController.login);
router.post('/logout', authenticate, authController.logout);
router.post('/refresh', authController.refresh);
router.get('/me', authenticate, authController.me);

module.exports = router;
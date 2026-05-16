const express = require('express');
const router = express.Router();
const { userValidation, changePasswordValidation } = require('../utils/validators');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const userController = require('../controllers/user.controller');

router.use(authenticate);

router.get('/', userController.getAll);
router.get('/:id', userController.getById);
router.post('/', userValidation, validate, userController.create);
router.put('/:id', userController.update);
router.put('/:id/password', changePasswordValidation, validate, userController.changePassword);
router.post('/:id/send-reset-password', userController.sendResetPassword);
router.delete('/:id', userController.remove);

module.exports = router;
const express = require('express');
const router = express.Router();
const { roleValidation } = require('../utils/validators');
const { validate } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const roleController = require('../controllers/role.controller');

router.use(authenticate);

router.get('/', roleController.getAll);
router.get('/:id', roleController.getById);
router.post('/', roleValidation, validate, roleController.create);
router.put('/:id', roleController.update);
router.delete('/:id', roleController.remove);

module.exports = router;
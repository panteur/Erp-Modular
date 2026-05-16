const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const moduleController = require('../controllers/module.controller');

router.get('/', moduleController.getAll);
router.get('/:id', moduleController.getById);
router.put('/:id/toggle', authenticate, moduleController.toggle);
router.get('/company/:companyId', authenticate, moduleController.getByCompany);

module.exports = router;
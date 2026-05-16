const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const companyController = require('../controllers/company.controller');

router.get('/', companyController.getAll);
router.get('/:id', authenticate, companyController.getById);
router.put('/:id', authenticate, companyController.update);

module.exports = router;
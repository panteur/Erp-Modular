const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const categoryController = require('../controllers/category.controller');
const itemController = require('../controllers/item.controller');
const inventoryController = require('../controllers/inventory.controller');

router.use(authenticate);

router.get('/categories', categoryController.getAll);
router.get('/categories/parents', categoryController.getParents);
router.get('/categories/:id', categoryController.getById);
router.post('/categories', categoryController.create);
router.put('/categories/:id', categoryController.update);
router.delete('/categories/:id', categoryController.remove);

router.get('/items', itemController.getAll);
router.get('/items/:id', itemController.getById);
router.post('/items', itemController.create);
router.put('/items/:id', itemController.update);
router.delete('/items/:id', itemController.remove);

router.get('/stock', inventoryController.getAll);
router.get('/stock/item/:itemId', inventoryController.getByItem);
router.post('/stock/adjust', inventoryController.adjust);

module.exports = router;

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const branchController = require('../controllers/branch.controller');

router.use(authenticate);

router.get('/', branchController.getAll);
router.get('/:id', branchController.getById);
router.post('/', branchController.create);
router.put('/:id', branchController.update);
router.delete('/:id', branchController.remove);

module.exports = router;
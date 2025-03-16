const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { authMiddleware, roleMiddleware } = require('../middlewares/authMiddleware');

// Публичные маршруты
router.get('/', categoryController.getAllCategories);
router.get('/:id', categoryController.getCategoryById);

// Маршруты только для кладовщика
router.post('/', authMiddleware, roleMiddleware(['storekeeper']), categoryController.createCategory);
router.put('/:id', authMiddleware, roleMiddleware(['storekeeper']), categoryController.updateCategory);
router.delete('/:id', authMiddleware, roleMiddleware(['storekeeper']), categoryController.deleteCategory);

module.exports = router; 
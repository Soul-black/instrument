const express = require('express');
const router = express.Router();
const toolController = require('../controllers/toolController');
const { authMiddleware, roleMiddleware } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// Получение списка всех инструментов
router.get('/', toolController.getAllTools);

// Получение списка выданных инструментов
router.get('/issued', toolController.getIssuedTools);

// Получение информации об одном инструменте
router.get('/:id', toolController.getToolById);

// Создание нового инструмента (только для кладовщика)
router.post('/', 
  authMiddleware,
  roleMiddleware(['storekeeper']),
  upload.single('image'),
  toolController.createTool
);

// Обновление информации об инструменте (только для кладовщика)
router.patch('/:id', 
  authMiddleware,
  roleMiddleware(['storekeeper']),
  upload.single('image'),
  toolController.updateTool
);

// Удаление инструмента (только для кладовщика)
router.delete('/:id', 
  authMiddleware,
  roleMiddleware(['storekeeper']),
  toolController.deleteTool
);

module.exports = router; 
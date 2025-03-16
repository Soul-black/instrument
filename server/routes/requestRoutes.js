const express = require('express');
const router = express.Router();
const {
  getRequests,
  createRequest,
  processRequest,
  returnTool,
  createBatchRequest,
  getUserRequests,
  getBorrowedTools,
  initiateToolReturn
} = require('../controllers/requestController');
const { authMiddleware, roleMiddleware } = require('../middlewares/authMiddleware');

// Получение списка заявок
router.get('/', authMiddleware, getRequests);

// Создание новой заявки (только для работников)
router.post('/', authMiddleware, roleMiddleware(['worker']), createRequest);

// Создание групповой заявки (только для работников)
router.post('/batch', authMiddleware, roleMiddleware(['worker']), createBatchRequest);

// Получение заявок текущего пользователя
router.get('/user', authMiddleware, getUserRequests);

// Получение взятых инструментов
router.get('/borrowed', authMiddleware, getBorrowedTools);

// Обработка заявки (только для кладовщика)
router.patch('/:id/process', authMiddleware, roleMiddleware(['storekeeper']), processRequest);

// Инициация возврата инструмента (только для работника)
router.post('/:id/return', authMiddleware, roleMiddleware(['worker']), initiateToolReturn);

// Подтверждение возврата инструмента (только для кладовщика)
router.patch('/:id/return', authMiddleware, roleMiddleware(['storekeeper']), returnTool);

module.exports = router; 
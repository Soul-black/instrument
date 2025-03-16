const express = require('express');
const router = express.Router();
const { 
  getNotifications, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification 
} = require('../controllers/notificationController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Получение уведомлений
router.get('/', authMiddleware, getNotifications);

// Отметка уведомления как прочитанного
router.patch('/:id/read', authMiddleware, markAsRead);

// Отметка всех уведомлений как прочитанных
router.patch('/read-all', authMiddleware, markAllAsRead);

// Удаление уведомления
router.delete('/:id', authMiddleware, deleteNotification);

module.exports = router; 
const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const toolRoutes = require('./toolRoutes');
const requestRoutes = require('./requestRoutes');
const notificationRoutes = require('./notificationRoutes');
const categoryRoutes = require('./categoryRoutes');

// Маршруты аутентификации
router.use('/auth', authRoutes);

// Маршруты для работы с инструментами
router.use('/tools', toolRoutes);

// Маршруты для работы с заявками
router.use('/requests', requestRoutes);

// Маршруты для работы с уведомлениями
router.use('/notifications', notificationRoutes);

// Маршруты для работы с категориями
router.use('/categories', categoryRoutes);

module.exports = router; 
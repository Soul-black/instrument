const express = require('express');
const router = express.Router();
const { login, register, getProfile } = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/authMiddleware');

// Публичные маршруты
router.post('/login', login);
router.post('/register', register);

// Защищенные маршруты
router.get('/profile', authMiddleware, getProfile);

module.exports = router; 
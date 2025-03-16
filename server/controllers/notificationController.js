const { Notification, User } = require('../models');
const { Op } = require('sequelize');

// Получение уведомлений для текущего пользователя
const getNotifications = async (req, res) => {
  try {
    let where = {};
    
    if (req.user.role === 'worker') {
      // Для работников показываем только их личные уведомления
      where = { userId: req.user.id };
    } else if (req.user.role === 'storekeeper') {
      // Для кладовщиков показываем только общие уведомления (userId = null)
      where = { userId: null };
    }

    const notifications = await Notification.findAll({
      where,
      order: [['createdAt', 'DESC']],
      limit: 50, // Ограничиваем количество уведомлений
    });

    res.json(notifications);
  } catch (error) {
    console.error('Error getting notifications:', error);
    res.status(500).json({ message: 'Ошибка при получении уведомлений' });
  }
};

// Отметка уведомления как прочитанного
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByPk(id);

    if (!notification) {
      return res.status(404).json({ message: 'Уведомление не найдено' });
    }

    // Проверяем, что уведомление принадлежит пользователю или является общим для кладовщиков
    if (notification.userId !== req.user.id && 
        !(notification.userId === null && req.user.role === 'storekeeper')) {
      return res.status(403).json({ message: 'Нет доступа к этому уведомлению' });
    }

    notification.isRead = true;
    await notification.save();

    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Ошибка при обновлении уведомления' });
  }
};

// Отметка всех уведомлений пользователя как прочитанных
const markAllAsRead = async (req, res) => {
  try {
    const where = {
      [Op.or]: [
        { userId: req.user.id },
        req.user.role === 'storekeeper' ? { userId: null } : { id: null },
      ],
      isRead: false,
    };

    await Notification.update(
      { isRead: true },
      { where }
    );

    res.json({ message: 'Все уведомления отмечены как прочитанные' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Ошибка при обновлении уведомлений' });
  }
};

// Удаление уведомления
const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByPk(id);

    if (!notification) {
      return res.status(404).json({ message: 'Уведомление не найдено' });
    }

    // Проверяем, что уведомление принадлежит пользователю или является общим для кладовщиков
    if (notification.userId !== req.user.id && 
        !(notification.userId === null && req.user.role === 'storekeeper')) {
      return res.status(403).json({ message: 'Нет доступа к этому уведомлению' });
    }

    await notification.destroy();
    res.json({ message: 'Уведомление удалено' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Ошибка при удалении уведомления' });
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
}; 
import api from './api';

export const notificationsApi = {
  // Получение уведомлений
  getNotifications: () => api.get('/notifications'),

  // Отметка уведомления как прочитанного
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),

  // Отметка всех уведомлений как прочитанных
  markAllAsRead: () => api.patch('/notifications/read-all'),

  // Удаление уведомления
  deleteNotification: (id) => api.delete(`/notifications/${id}`),
}; 
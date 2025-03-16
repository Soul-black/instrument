import axios from 'axios';

const API_URL = 'http://localhost:5002/api';

// Создаем инстанс axios с базовой конфигурацией
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем перехватчик для установки токена
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export const requestsApi = {
  // Получение списка заявок с фильтрацией
  getRequests: (filters = {}) => {
    const queryParams = new URLSearchParams(filters).toString();
    return axiosInstance.get(`/requests${queryParams ? `?${queryParams}` : ''}`);
  },

  // Создание новой заявки
  createRequest: (data) => {
    return axiosInstance.post('/requests', data);
  },

  // Обработка заявки (для кладовщика)
  processRequest: (requestId, data) => {
    return axiosInstance.patch(`/requests/${requestId}/process`, data);
  },

  // Инициация возврата инструмента (для работника)
  returnTool: (requestId, data) => {
    return axiosInstance.post(`/requests/${requestId}/return`, data);
  },

  // Подтверждение возврата инструмента (для кладовщика)
  confirmReturn: (requestId, data) => {
    return axiosInstance.patch(`/requests/${requestId}/return`, data);
  },

  // Получение взятых инструментов
  getBorrowedTools: () => {
    return axiosInstance.get('/requests/borrowed');
  },

  // Получение истории заявок пользователя
  getUserHistory: () => {
    return axiosInstance.get('/requests/history');
  },

  // Получение статистики по заявкам (для кладовщика)
  getStatistics: () => {
    return axiosInstance.get('/requests/statistics');
  },
};

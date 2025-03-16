import api from './api';

export const toolsApi = {
  // Получение списка всех инструментов с пагинацией и фильтрацией
  getAllTools: (params = {}) => {
    const {
      page = 1,
      limit = 10,
      search = '',
      status = '',
      categoryId = null,
      sortBy = 'name',
      sortOrder = 'ASC'
    } = params;

    const queryParams = new URLSearchParams();
    
    // Добавляем обязательные параметры
    queryParams.append('page', page);
    queryParams.append('limit', limit);
    queryParams.append('sortBy', sortBy);
    queryParams.append('sortOrder', sortOrder);
    
    // Добавляем опциональные параметры только если они не пустые и не 'all'
    if (search) queryParams.append('search', search);
    if (status && status !== 'all') queryParams.append('status', status);
    if (categoryId && categoryId !== 'all') {
      queryParams.append('categoryId', categoryId);
      console.log('Adding categoryId to query:', categoryId);
    }

    const url = `/tools?${queryParams}`;
    console.log('Making request to:', url);
    return api.get(url);
  },

  // Получение информации об одном инструменте
  getToolById: (id) => api.get(`/tools/${id}`),

  // Создание нового инструмента (только для кладовщика)
  createTool: (toolData) => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };
    return api.post('/tools', toolData, config);
  },

  // Получение списка выданных инструментов
  getIssuedTools: () => api.get('/tools/issued'),

  // Обновление информации об инструменте (только для кладовщика)
  updateTool: (id, toolData) => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    };
    return api.patch(`/tools/${id}`, toolData, config);
  },

  // Удаление инструмента (только для кладовщика)
  deleteTool: (id) => api.delete(`/tools/${id}`),

  // Новые методы для работы с категориями
  getAllCategories: () => api.get('/categories'),
  getCategoryById: (id) => api.get(`/categories/${id}`),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
  getToolsByCategory: (categoryId) => api.get(`/tools`, { 
    params: { 
      categoryId,
      limit: 100,
      sortBy: 'name',
      sortOrder: 'ASC'
    } 
  }),

  // Методы для работы с заявками на инструменты
  createToolRequest: (requestData) => api.post('/requests', requestData),
  getToolRequests: () => api.get('/requests'),
  updateToolRequest: (id, data) => api.put(`/requests/${id}`, data),
  deleteToolRequest: (id) => api.delete(`/requests/${id}`)
}; 
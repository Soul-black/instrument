import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { toolsApi } from '../services/toolsService';
import { requestsApi } from '../services/requestsService';

// Временные моковые данные
const mockPendingRequests = [
  {
    id: 1,
    toolName: 'Дрель ударная Bosch GSB 13 RE',
    userName: 'Иванов Иван',
    department: 'Цех №1',
    requestDate: '2024-03-15T10:30:00',
    status: 'pending',
    priority: 'high',
    duration: '2 дня',
  },
  {
    id: 2,
    toolName: 'Набор отверток Kraftform Kompakt 60',
    userName: 'Петров Петр',
    department: 'Цех №2',
    requestDate: '2024-03-15T11:15:00',
    status: 'pending',
    priority: 'medium',
    duration: '1 день',
  },
  {
    id: 3,
    toolName: 'Лазерный уровень Bosch GLL 3-80',
    userName: 'Сидоров Алексей',
    department: 'Цех №3',
    requestDate: '2024-03-15T12:00:00',
    status: 'pending',
    priority: 'low',
    duration: '3 дня',
  },
];

export const useDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState({
    tools: [],
    pendingRequests: [],
    statistics: {
      totalTools: 0,
      availableTools: 0,
      inUseTools: 0,
      maintenanceTools: 0,
    },
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        // Получаем все инструменты
        const toolsResponse = await toolsApi.getAllTools();
        const tools = toolsResponse.data;

        // Получаем все заявки
        const requestsResponse = await requestsApi.getRequests();
        const requests = requestsResponse.data;

        // Считаем статистику
        const statistics = {
          totalTools: tools.length,
          availableTools: tools.filter(tool => 
            tool.status === 'active' && tool.availableQuantity > 0
          ).length,
          inUseTools: tools.filter(tool => 
            tool.availableQuantity < tool.totalQuantity
          ).length,
          maintenanceTools: tools.filter(tool => 
            tool.status === 'maintenance'
          ).length,
        };

        // Фильтруем ожидающие заявки
        const pendingRequests = requests.filter(request => 
          request.status === 'pending'
        );

        setData({
          tools,
          pendingRequests,
          statistics,
        });
      } catch (err) {
        setError('Ошибка при загрузке данных панели управления');
        console.error('Dashboard data fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const refreshData = async () => {
    try {
      setLoading(true);
      setError(null);

      const toolsResponse = await toolsApi.getAllTools();
      const requestsResponse = await requestsApi.getRequests();

      const tools = toolsResponse.data;
      const requests = requestsResponse.data;

      const statistics = {
        totalTools: tools.length,
        availableTools: tools.filter(tool => 
          tool.status === 'active' && tool.availableQuantity > 0
        ).length,
        inUseTools: tools.filter(tool => 
          tool.availableQuantity < tool.totalQuantity
        ).length,
        maintenanceTools: tools.filter(tool => 
          tool.status === 'maintenance'
        ).length,
      };

      const pendingRequests = requests.filter(request => 
        request.status === 'pending'
      );

      setData({
        tools,
        pendingRequests,
        statistics,
      });
    } catch (err) {
      setError('Ошибка при обновлении данных');
      console.error('Dashboard refresh error:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    refreshData,
  };
};

export default useDashboard; 
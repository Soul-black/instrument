import React from 'react';
import { Grid } from '@mui/material';
import {
  Build as BuildIcon,
  Engineering as EngineeringIcon,
  Warning as WarningIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import StatisticsCard from './StatisticsCard';
import { useDashboard } from '../../../hooks/useDashboard';

const StatisticsGrid = () => {
  const { data, loading, error } = useDashboard();

  const stats = [
    {
      title: 'Всего инструментов',
      value: data?.statistics?.totalTools || 0,
      icon: BuildIcon,
      color: 'primary',
      description: 'Общее количество инструментов на складе'
    },
    {
      title: 'В использовании',
      value: data?.statistics?.inUseTools || 0,
      icon: EngineeringIcon,
      color: 'info',
      description: 'Инструменты, выданные работникам'
    },
    {
      title: 'Требуют обслуживания',
      value: data?.statistics?.maintenanceTools || 0,
      icon: WarningIcon,
      color: 'warning',
      description: 'Инструменты, требующие ремонта или проверки'
    },
    {
      title: 'Ожидающие заявки',
      value: data?.pendingRequests?.length || 0,
      icon: AssignmentIcon,
      color: 'secondary',
      description: 'Необработанные заявки на инструменты'
    }
  ];

  if (error) {
    return null; // TODO: Добавить компонент ошибки
  }

  return (
    <Grid container spacing={3}>
      {stats.map((stat) => (
        <Grid item xs={12} sm={6} md={3} key={stat.title}>
          <StatisticsCard
            {...stat}
            loading={loading}
            onClick={() => {
              // TODO: Добавить обработку клика для детальной информации
              console.log(`Clicked on ${stat.title}`);
            }}
          />
        </Grid>
      ))}
    </Grid>
  );
};

export default StatisticsGrid; 
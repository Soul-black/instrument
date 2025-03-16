import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import WorkerDashboard from './WorkerDashboard';
import StorekeeperDashboard from './StorekeeperDashboard';

const Dashboard = () => {
  const { user } = useAuth();

  return user?.role === 'storekeeper' ? <StorekeeperDashboard /> : <WorkerDashboard />;
};

export default Dashboard; 
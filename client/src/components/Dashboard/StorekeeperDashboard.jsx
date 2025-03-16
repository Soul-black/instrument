import React from 'react';
import { Grid, Box } from '@mui/material';
import StatisticsGrid from './Statistics/StatisticsGrid';
import ActivityChart from './ActivityChart/ActivityChart';
import RequestList from './RequestList/RequestList';
import { useDashboard } from '../../hooks/useDashboard';

const StorekeeperDashboard = () => {
  const { data, loading, error, refreshData } = useDashboard();

  const handleApproveRequest = async (requestId) => {
    // TODO: Implement request approval
    console.log('Approving request:', requestId);
  };

  const handleRejectRequest = async (requestId) => {
    // TODO: Implement request rejection
    console.log('Rejecting request:', requestId);
  };

  const handleRequestInfo = (requestId) => {
    // TODO: Implement request info display
    console.log('Showing info for request:', requestId);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        {/* Statistics Section */}
        <Grid item xs={12}>
          <StatisticsGrid />
        </Grid>

        {/* Activity Chart */}
        <Grid item xs={12} md={8}>
          <ActivityChart />
        </Grid>

        {/* Pending Requests */}
        <Grid item xs={12} md={4}>
          <RequestList
            requests={data?.pendingRequests || []}
            loading={loading}
            error={error}
            onApprove={handleApproveRequest}
            onReject={handleRejectRequest}
            onInfo={handleRequestInfo}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default StorekeeperDashboard; 
import React from 'react';
import { Box, Card, Typography, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: theme.palette.background.paper,
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
  },
  cursor: 'pointer',
}));

const StatisticsCard = ({
  title,
  value,
  icon: Icon,
  color = 'primary',
  loading = false,
  onClick,
  description
}) => {
  return (
    <StyledCard
      onClick={onClick}
      role="button"
      tabIndex={0}
      aria-label={`${title}: ${value} ${description || ''}`}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.();
        }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 1,
          color: `${color}.main`,
        }}
      >
        {Icon && <Icon sx={{ fontSize: 40 }} />}
      </Box>

      <Typography
        variant="h4"
        component="div"
        sx={{
          mb: 1,
          color: `${color}.main`,
          fontWeight: 'bold',
          textAlign: 'center',
        }}
      >
        {loading ? <CircularProgress size={24} /> : value}
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ textAlign: 'center' }}
      >
        {title}
      </Typography>

      {description && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, textAlign: 'center' }}
        >
          {description}
        </Typography>
      )}
    </StyledCard>
  );
};

export default StatisticsCard; 
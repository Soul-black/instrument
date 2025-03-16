import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  IconButton,
  Tooltip,
  CardActions,
} from '@mui/material';
import {
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const statusColors = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
  completed: 'info',
};

const statusLabels = {
  pending: 'Ожидает',
  approved: 'Одобрено',
  rejected: 'Отклонено',
  completed: 'Завершено',
};

const RequestCard = ({
  request,
  onApprove,
  onReject,
  onInfo,
  showActions = true,
}) => {
  const {
    id,
    toolName,
    userName,
    status,
    requestDate,
    expectedReturnDate,
  } = request;

  const formattedRequestDate = new Date(requestDate).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  const formattedReturnDate = new Date(expectedReturnDate).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <StyledCard
      role="article"
      aria-label={`Заявка на ${toolName} от ${userName}`}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" component="h3" gutterBottom>
            {toolName}
          </Typography>
          <Chip
            label={statusLabels[status]}
            color={statusColors[status]}
            size="small"
          />
        </Box>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          Работник: {userName}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Дата заявки: {formattedRequestDate}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Планируемый возврат: {formattedReturnDate}
          </Typography>
        </Box>
      </CardContent>

      {showActions && status === 'pending' && (
        <CardActions sx={{ justifyContent: 'flex-end' }}>
          <Tooltip title="Подробнее">
            <IconButton
              onClick={() => onInfo(id)}
              aria-label="Подробная информация о заявке"
              size="small"
            >
              <InfoIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Одобрить">
            <IconButton
              onClick={() => onApprove(id)}
              aria-label="Одобрить заявку"
              color="success"
              size="small"
            >
              <ApproveIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Отклонить">
            <IconButton
              onClick={() => onReject(id)}
              aria-label="Отклонить заявку"
              color="error"
              size="small"
            >
              <RejectIcon />
            </IconButton>
          </Tooltip>
        </CardActions>
      )}
    </StyledCard>
  );
};

export default RequestCard; 
import React from 'react';
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Box,
  Tooltip,
  alpha,
  Button
} from '@mui/material';
import {
  AssignmentReturn as ReturnIcon,
  Warning as WarningIcon,
  ErrorOutline as ErrorIcon,
  AccessTime as TimeIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StatusChip = styled(Chip)(({ theme, status }) => ({
  backgroundColor: status === 'overdue' 
    ? alpha(theme.palette.error.main, 0.1)
    : status === 'nearDue'
      ? alpha(theme.palette.warning.main, 0.1)
      : 'transparent',
  color: status === 'overdue'
    ? theme.palette.error.main
    : status === 'nearDue'
      ? theme.palette.warning.main
      : theme.palette.text.primary,
  border: `1px solid ${
    status === 'overdue'
      ? theme.palette.error.main
      : status === 'nearDue'
        ? theme.palette.warning.main
        : 'transparent'
  }`,
  '& .MuiChip-icon': {
    color: 'inherit'
  }
}));

const ActionButton = ({ item, onClick, isWorkerView }) => {
  // Для работника
  if (isWorkerView) {
    // Если уже отправлена заявка на возврат
    if (item.status === 'returning') {
      return (
        <Chip
          label="Ожидает подтверждения"
          color="info"
          size="small"
          icon={<TimeIcon fontSize="small" />}
        />
      );
    }
    // Если можно вернуть
    return (
      <Button
        variant="outlined"
        size="small"
        startIcon={<ReturnIcon />}
        onClick={() => onClick(item)}
        color="primary"
        sx={{
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.05)'
          }
        }}
      >
        Вернуть инструмент
      </Button>
    );
  }

  // Для кладовщика
  if (item.status === 'returning') {
    return (
      <Button
        variant="contained"
        size="small"
        startIcon={<CheckCircleIcon />}
        onClick={() => onClick(item)}
        color="success"
        sx={{
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'scale(1.05)'
          }
        }}
      >
        Подтвердить возврат
      </Button>
    );
  }

  return null;
};

const IssuedToolsList = ({ 
  issuedTools, 
  loading, 
  error, 
  onReturn,
  showWorkerInfo = true,
  isWorkerView = false,
  hideActions = false
}) => {
  // Функция проверки просроченного возврата
  const isOverdue = (expectedReturnDate) => {
    return new Date(expectedReturnDate) < new Date();
  };

  // Функция проверки приближающегося срока возврата (3 дня)
  const isNearDue = (expectedReturnDate) => {
    const dueDate = new Date(expectedReturnDate);
    const today = new Date();
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays > 0;
  };

  // Функция форматирования даты
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <Paper sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Paper>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Paper>
    );
  }

  if (!issuedTools?.length) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          {isWorkerView ? 'Мои инструменты' : 'Выданные инструменты'}
        </Typography>
        <Alert severity="info">
          {isWorkerView ? 'У вас нет взятых инструментов' : 'Нет выданных инструментов'}
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" gutterBottom>
        {isWorkerView ? 'Мои инструменты' : 'Выданные инструменты'}
      </Typography>
      <List>
        {issuedTools.map((item) => {
          const isToolOverdue = isOverdue(item.expectedReturnDate);
          const isToolNearDue = isNearDue(item.expectedReturnDate);

          return (
            <ListItem
              key={item.id}
              divider
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                py: 2,
                backgroundColor: isToolOverdue 
                  ? alpha('#FFF3F3', 0.6)
                  : isToolNearDue 
                    ? alpha('#FFF9E7', 0.6)
                    : 'inherit',
                transition: 'background-color 0.2s ease-in-out',
                '&:hover': {
                  backgroundColor: isToolOverdue 
                    ? alpha('#FFF3F3', 0.8)
                    : isToolNearDue 
                      ? alpha('#FFF9E7', 0.8)
                      : alpha('#F5F5F5', 0.8)
                }
              }}
            >
              <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Box sx={{ flex: 1 }}>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {item.tool.name}
                        <StatusChip
                          icon={isToolOverdue ? <ErrorIcon fontSize="small" /> : <TimeIcon fontSize="small" />}
                          label={isToolOverdue ? 'Просрочен' : isToolNearDue ? 'Скоро возврат' : null}
                          size="small"
                          status={isToolOverdue ? 'overdue' : isToolNearDue ? 'nearDue' : 'normal'}
                          sx={{ ml: 1 }}
                        />
                        {item.status === 'returning' && !isWorkerView && (
                          <Chip
                            label="Запрошен возврат"
                            color="info"
                            size="small"
                            sx={{ ml: 1 }}
                          />
                        )}
                      </Box>
                    }
                    secondary={`Выдан: ${formatDate(item.approvalDate)}`}
                  />
                </Box>
                {!hideActions && (
                  <Box sx={{ ml: 2 }}>
                    <ActionButton
                      item={item}
                      onClick={onReturn}
                      isWorkerView={isWorkerView}
                    />
                  </Box>
                )}
              </Box>
              <Box sx={{ width: '100%', pl: 2 }}>
                {showWorkerInfo && (
                  <Typography variant="body2" color="text.secondary">
                    Работник: {item.user.fullName}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  Количество: {item.quantity} шт.
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{
                    color: isToolOverdue 
                      ? 'error.main'
                      : isToolNearDue 
                        ? 'warning.main'
                        : 'text.secondary',
                    fontWeight: isToolOverdue || isToolNearDue ? 500 : 400
                  }}
                >
                  Ожидаемый возврат: {formatDate(item.expectedReturnDate)}
                </Typography>
                {item.notes && (
                  <Typography variant="body2" color="text.secondary">
                    Примечания: {item.notes}
                  </Typography>
                )}
              </Box>
              {(isToolOverdue || isToolNearDue) && (
                <Box sx={{ width: '100%', mt: 1 }}>
                  <Alert 
                    severity={isToolOverdue ? 'error' : 'warning'}
                    variant="outlined"
                    sx={{
                      backgroundColor: 'transparent',
                      '& .MuiAlert-icon': {
                        opacity: 0.8
                      }
                    }}
                  >
                    {isToolOverdue 
                      ? 'Инструмент просрочен! Пожалуйста, верните его как можно скорее.' 
                      : 'Срок возврата инструмента скоро истекает.'}
                  </Alert>
                </Box>
              )}
            </ListItem>
          );
        })}
      </List>
    </Paper>
  );
};

export default IssuedToolsList; 
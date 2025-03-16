import React, { useCallback, useMemo, useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  Zoom,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  DialogContentText,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Build as BuildIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Block as BlockIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';

const API_URL = 'http://localhost:5002';

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const StatusChip = styled(Chip)(({ theme, status, availableQuantity }) => {
  const getStatusColor = () => {
    if (status === 'active' && availableQuantity === 0) {
      return theme.palette.warning.main;
    }
    switch (status) {
      case 'active':
        return theme.palette.success.main;
      case 'maintenance':
        return theme.palette.warning.main;
      case 'retired':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  return {
    backgroundColor: getStatusColor(),
    color: theme.palette.getContrastText(getStatusColor()),
    '& .MuiChip-icon': {
      color: 'inherit',
    },
  };
});

const getStatusIcon = (status, availableQuantity) => {
  if (status === 'active' && availableQuantity === 0) {
    return <WarningIcon />;
  }
  switch (status) {
    case 'active':
      return <CheckCircleIcon />;
    case 'maintenance':
      return <BuildIcon />;
    case 'retired':
      return <BlockIcon />;
    default:
      return <WarningIcon />;
  }
};

const getStatusText = (status, availableQuantity) => {
  if (status === 'active' && availableQuantity === 0) {
    return 'Нет в наличии';
  }
  switch (status) {
    case 'active':
      return 'Доступен';
    case 'maintenance':
      return 'На обслуживании';
    case 'retired':
      return 'Списан';
    default:
      return 'Неизвестно';
  }
};

const ToolCard = React.memo(
  ({ tool, onRequestClick, showRequestButton = true, onEditClick, onDeleteClick }) => {
    const [deleteDialog, setDeleteDialog] = useState(false);

    const handleRequestClick = useCallback(() => {
      onRequestClick?.(tool);
    }, [onRequestClick, tool]);

    const handleDeleteClick = () => {
      setDeleteDialog(true);
    };

    const handleConfirmDelete = () => {
      onDeleteClick(tool);
      setDeleteDialog(false);
    };

    const imageUrl = useMemo(() => {
      if (!tool.imageUrl) return '/images/default-tool.png';
      return tool.imageUrl.startsWith('http') ? tool.imageUrl : `${API_URL}${tool.imageUrl}`;
    }, [tool.imageUrl]);

    const statusIcon = useMemo(
      () => getStatusIcon(tool.status, tool.availableQuantity),
      [tool.status, tool.availableQuantity],
    );
    const statusText = useMemo(
      () => getStatusText(tool.status, tool.availableQuantity),
      [tool.status, tool.availableQuantity],
    );

    return (
      <Zoom in>
        <StyledCard variant="outlined" role="article" aria-label={`Инструмент: ${tool.name}`}>
          <CardMedia
            component="img"
            height="140"
            image={imageUrl}
            alt={tool.name}
            sx={{ objectFit: 'contain', bgcolor: 'background.default', p: 1 }}
          />
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                mb: 1,
              }}>
              <Typography variant="h6" component="h3" gutterBottom>
                {tool.name}
              </Typography>
              <StatusChip
                icon={statusIcon}
                label={statusText}
                size="small"
                status={tool.status}
                availableQuantity={tool.availableQuantity}
              />
              {tool.category && (
                <Chip
                  icon={<CategoryIcon />}
                  label={tool.category.name}
                  variant="outlined"
                  size="small"
                />
              )}
            </Box>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>
              {tool.description}
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="body2" color="text.secondary">
                  {tool.location && `Расположение: ${tool.location}`}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Всего: {tool.totalQuantity} шт. | Доступно: {tool.availableQuantity} шт.
                </Typography>
              </Box>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  mb: 1,
                }}>
                {/* <Typography variant="h6" component="h3" gutterBottom>
                {tool.name}
              </Typography> */}
                {/* <StatusChip
                icon={statusIcon}
                label={statusText}
                size="small"
                status={tool.status}
                availableQuantity={tool.availableQuantity}
              />
              {tool.category && (
                <Chip
                  icon={<CategoryIcon />}
                  label={tool.category.name}
                  variant="outlined"
                  size="small"
                />
              )} */}
                <Box>
                  {onEditClick && (
                    <IconButton size="small" onClick={() => onEditClick(tool)} sx={{ mr: 1 }}>
                      <EditIcon />
                    </IconButton>
                  )}
                  {onDeleteClick && (
                    <IconButton size="small" onClick={handleDeleteClick} color="error">
                      <DeleteIcon />
                    </IconButton>
                  )}
                </Box>
              </Box>

              {showRequestButton && tool.status === 'active' && tool.availableQuantity > 0 && (
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={handleRequestClick}
                  aria-label="Запросить инструмент">
                  Запросить
                </Button>
              )}
            </Box>
          </CardContent>

          {/* Диалог подтверждения удаления */}
          <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
            <DialogTitle>Подтверждение удаления</DialogTitle>
            <DialogContent>
              <DialogContentText>
                Вы действительно хотите удалить инструмент "{tool.name}"? Это действие нельзя будет
                отменить.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDeleteDialog(false)}>Отмена</Button>
              <Button onClick={handleConfirmDelete} color="error" variant="contained">
                Удалить
              </Button>
            </DialogActions>
          </Dialog>
        </StyledCard>
      </Zoom>
    );
  },
);

export default ToolCard;

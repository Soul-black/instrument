import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Grid,
  Divider,
} from '@mui/material';
import {
  Build as ToolIcon,
  LocationOn as LocationIcon,
  Category as CategoryIcon,
  Update as MaintenanceIcon,
} from '@mui/icons-material';

const statusColors = {
  active: 'success',
  maintenance: 'warning',
  retired: 'error',
};

const statusLabels = {
  active: 'Доступен',
  maintenance: 'На обслуживании',
  retired: 'Списан',
};

const InfoItem = ({ icon: Icon, label, value }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
    <Icon color="primary" />
    <Typography variant="body2" color="text.secondary">
      {label}:
    </Typography>
    <Typography variant="body1">{value}</Typography>
  </Box>
);

const ToolInfoModal = ({ open, onClose, tool, onRequestClick, showRequestButton = true }) => {
  if (!tool) return null;

  const {
    name,
    description,
    status,
    availableQuantity,
    totalQuantity,
    location,
    category,
    lastMaintenance,
  } = tool;

  const formattedMaintenanceDate = new Date(lastMaintenance).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="tool-info-dialog-title">
      <DialogTitle id="tool-info-dialog-title">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {name}
          <Chip label={statusLabels[status]} color={statusColors[status]} size="small" />
        </Box>
      </DialogTitle>

      <DialogContent>
        <Typography variant="body1" paragraph>
          {description}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <InfoItem
              icon={ToolIcon}
              label="Количество"
              value={`${availableQuantity} из ${totalQuantity} доступно`}
            />
          </Grid>
          <Grid item xs={12}>
            <InfoItem icon={LocationIcon} label="Расположение" value={location} />
          </Grid>
          <Grid item xs={12}>
            <InfoItem icon={CategoryIcon} label="Категория" value={category} />
          </Grid>
          <Grid item xs={12}>
            <InfoItem
              icon={MaintenanceIcon}
              label="Последнее обслуживание"
              value={formattedMaintenanceDate}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Закрыть</Button>
        {showRequestButton && status === 'active' && availableQuantity > 0 && (
          <Button
            onClick={() => {
              onRequestClick(tool.id);
              onClose();
            }}
            variant="contained"
            color="primary">
            Создать заявку
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ToolInfoModal;

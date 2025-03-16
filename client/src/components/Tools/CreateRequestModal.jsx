import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';

const CreateRequestModal = ({
  open,
  onClose,
  tool,
  onSubmit,
  loading = false,
}) => {
  const [formData, setFormData] = useState({
    quantity: 1,
    returnDate: null,
    notes: '',
  });
  const [error, setError] = useState(null);

  const handleChange = (field) => (event) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleDateChange = (date) => {
    setFormData((prev) => ({
      ...prev,
      returnDate: date,
    }));
  };

  const handleSubmit = () => {
    setError(null);

    // Валидация
    if (!formData.quantity || formData.quantity < 1) {
      setError('Укажите количество инструментов');
      return;
    }

    if (formData.quantity > tool.availableQuantity) {
      setError('Запрошенное количество превышает доступное');
      return;
    }

    if (!formData.returnDate) {
      setError('Укажите планируемую дату возврата');
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (formData.returnDate < today) {
      setError('Дата возврата не может быть в прошлом');
      return;
    }

    onSubmit({
      toolId: tool.id,
      quantity: parseInt(formData.quantity, 10),
      returnDate: formData.returnDate,
      notes: formData.notes
    });
  };

  if (!tool) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="create-request-dialog-title"
    >
      <DialogTitle id="create-request-dialog-title">
        Создание заявки на инструмент
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            {tool.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Доступно: {tool.availableQuantity} шт.
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <TextField
          fullWidth
          label="Количество"
          type="number"
          value={formData.quantity}
          onChange={handleChange('quantity')}
          InputProps={{ inputProps: { min: 1, max: tool.availableQuantity } }}
          sx={{ mb: 2 }}
        />

        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
          <DatePicker
            label="Планируемая дата возврата"
            value={formData.returnDate}
            onChange={handleDateChange}
            renderInput={(params) => (
              <TextField {...params} fullWidth sx={{ mb: 2 }} />
            )}
            minDate={new Date()}
          />
        </LocalizationProvider>

        <TextField
          fullWidth
          label="Примечания"
          multiline
          rows={3}
          value={formData.notes}
          onChange={handleChange('notes')}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Отмена
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          color="primary"
          disabled={loading}
        >
          {loading ? 'Создание...' : 'Создать заявку'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateRequestModal; 
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Button,
  IconButton,
  Typography,
  Input,
} from '@mui/material';
import { PhotoCamera, Save, Cancel } from '@mui/icons-material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import ruLocale from 'date-fns/locale/ru';

const ToolForm = ({ open, handleClose, tool, categories, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    imageUrl: '',
    totalQuantity: 1,
    availableQuantity: 1,
    status: 'active',
    lastMaintenance: null,
    location: '',
    categoryId: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    if (tool) {
      setFormData({
        name: tool.name || '',
        description: tool.description || '',
        imageUrl: tool.imageUrl || '',
        totalQuantity: tool.totalQuantity || 1,
        availableQuantity: tool.availableQuantity || 1,
        status: tool.status || 'active',
        lastMaintenance: tool.lastMaintenance ? new Date(tool.lastMaintenance) : null,
        location: tool.location || '',
        categoryId: tool.categoryId || '',
      });
    } else {
      // Сброс формы при создании нового инструмента
      setFormData({
        name: '',
        description: '',
        imageUrl: '',
        totalQuantity: 1,
        availableQuantity: 1,
        status: 'active',
        lastMaintenance: null,
        location: '',
        categoryId: '',
      });
    }
    setImageFile(null);
  }, [tool]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      // Создаем временный URL для предпросмотра
      const imageUrl = URL.createObjectURL(file);
      handleChange('imageUrl', imageUrl);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Название инструмента обязательно';
    }
    if (formData.totalQuantity < 1) {
      errors.totalQuantity = 'Общее количество должно быть больше 0';
    }
    if (formData.availableQuantity < 0) {
      errors.availableQuantity = 'Доступное количество не может быть отрицательным';
    }
    if (formData.availableQuantity > formData.totalQuantity) {
      errors.availableQuantity = 'Доступное количество не может превышать общее количество';
    }
    if (!formData.categoryId) {
      errors.categoryId = 'Выберите категорию инструмента';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      const submitData = new FormData();

      // Добавляем все поля формы
      Object.keys(formData).forEach((key) => {
        // Пропускаем imageUrl, так как отправляем сам файл
        if (key !== 'imageUrl' && formData[key] !== null) {
          submitData.append(key, formData[key]);
        }
      });

      // Добавляем файл изображения, если он есть
      if (imageFile) {
        submitData.append('image', imageFile);
      }

      console.log('Отправляемые данные:', {
        formData: Object.fromEntries(submitData.entries()),
        imageFile: imageFile,
      });

      await onSubmit(submitData);
      handleClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{tool ? 'Редактировать инструмент' : 'Новый инструмент'}</DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Название"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                error={!!formErrors.name}
                helperText={formErrors.name}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!formErrors.categoryId}>
                <InputLabel>Категория</InputLabel>
                <Select
                  value={formData.categoryId}
                  onChange={(e) => handleChange('categoryId', e.target.value)}
                  label="Категория">
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.id}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.categoryId && <FormHelperText>{formErrors.categoryId}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Описание"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                multiline
                rows={3}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Общее количество"
                type="number"
                value={formData.totalQuantity}
                onChange={(e) => handleChange('totalQuantity', parseInt(e.target.value))}
                error={!!formErrors.totalQuantity}
                helperText={formErrors.totalQuantity}
                InputProps={{ inputProps: { min: 1 } }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Доступное количество"
                type="number"
                value={formData.availableQuantity}
                onChange={(e) => handleChange('availableQuantity', parseInt(e.target.value))}
                error={!!formErrors.availableQuantity}
                helperText={formErrors.availableQuantity}
                InputProps={{ inputProps: { min: 0 } }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Статус</InputLabel>
                <Select
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value)}
                  label="Статус">
                  <MenuItem value="active">Доступен</MenuItem>
                  <MenuItem value="maintenance">На обслуживании</MenuItem>
                  <MenuItem value="retired">Списан</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* <Grid item xs={12} md={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ruLocale}>
                <DatePicker
                  label="Дата последнего обслуживания"
                  value={formData.lastMaintenance}
                  onChange={(date) => handleChange('lastMaintenance', date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid> */}

            {/* <Grid item xs={12}>
              <TextField
                fullWidth
                label="Местоположение"
                value={formData.location}
                onChange={(e) => handleChange('location', e.target.value)}
              />
            </Grid> */}

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button variant="outlined" component="label" startIcon={<PhotoCamera />}>
                  Загрузить изображение
                  <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                </Button>
                {formData.imageUrl && (
                  <Box sx={{ mt: 2 }}>
                    <img
                      src={formData.imageUrl}
                      alt="Предпросмотр"
                      style={{ maxWidth: '200px', maxHeight: '200px' }}
                    />
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} startIcon={<Cancel />}>
          Отмена
        </Button>
        <Button onClick={handleSubmit} variant="contained" color="primary" startIcon={<Save />}>
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ToolForm;

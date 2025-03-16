import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Alert,
  CircularProgress,
  Tooltip,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Icon,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Build as BuildIcon,
  Handyman as HandymanIcon,
  Construction as ConstructionIcon,
  Straighten as StraightenIcon,
  Hardware as HardwareIcon,
  ElectricalServices as ElectricalServicesIcon,
  Plumbing as PlumbingIcon,
  Carpenter as CarpenterIcon,
  Architecture as ArchitectureIcon,
  Healing as HealingIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { toolsApi } from '../../services/toolsService';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
}));

const IconPreview = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  marginBottom: theme.spacing(2),
}));

// Список доступных иконок с описаниями
const availableIcons = [
  { icon: 'build', label: 'Инструменты (общее)', component: BuildIcon },
  { icon: 'handyman', label: 'Ручной инструмент', component: HandymanIcon },
  { icon: 'construction', label: 'Строительные инструменты', component: ConstructionIcon },
  { icon: 'straighten', label: 'Измерительные инструменты', component: StraightenIcon },
  { icon: 'hardware', label: 'Оборудование', component: HardwareIcon },
  { icon: 'electrical_services', label: 'Электроинструменты', component: ElectricalServicesIcon },
  { icon: 'plumbing', label: 'Сантехнические инструменты', component: PlumbingIcon },
  { icon: 'carpenter', label: 'Столярные инструменты', component: CarpenterIcon },
  { icon: 'architecture', label: 'Чертежные инструменты', component: ArchitectureIcon },
  { icon: 'healing', label: 'Ремонтные инструменты', component: HealingIcon },
];

const CategoryManager = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
  });
  const [formErrors, setFormErrors] = useState({});

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const response = await toolsApi.getAllCategories();
      setCategories(response.data);
    } catch (err) {
      setError('Ошибка при загрузке категорий');
      console.error('Error fetching categories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenDialog = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        icon: category.icon || '',
      });
    } else {
      setEditingCategory(null);
      setFormData({
        name: '',
        description: '',
        icon: '',
      });
    }
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
    setFormData({
      name: '',
      description: '',
      icon: '',
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Название категории обязательно';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);
      if (editingCategory) {
        await toolsApi.updateCategory(editingCategory.id, formData);
      } else {
        await toolsApi.createCategory(formData);
      }
      await fetchCategories();
      handleCloseDialog();
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Ошибка при сохранении категории');
      }
      console.error('Error saving category:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (categoryId) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту категорию?')) {
      return;
    }

    try {
      setLoading(true);
      await toolsApi.deleteCategory(categoryId);
      await fetchCategories();
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Ошибка при удалении категории');
      }
      console.error('Error deleting category:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <StyledPaper>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h2">
          Управление категориями
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}>
          Добавить категорию
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : categories.length === 0 ? (
        <Alert severity="info">Категории не найдены</Alert>
      ) : (
        <List>
          {categories.map((category, index) => (
            <React.Fragment key={category.id}>
              {index > 0 && <Divider />}
              <ListItem
                secondaryAction={
                  <Box>
                    <Tooltip title="Редактировать">
                      <IconButton
                        edge="end"
                        aria-label="редактировать"
                        onClick={() => handleOpenDialog(category)}
                        sx={{ mr: 1 }}>
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Удалить">
                      <IconButton
                        edge="end"
                        aria-label="удалить"
                        onClick={() => handleDelete(category.id)}
                        disabled={category.toolsCount > 0}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <BuildIcon sx={{ color: 'action.active' }} />
                      {category.name}
                      <Chip
                        label={`${category.toolsCount} инструментов`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={category.description}
                />
              </ListItem>
            </React.Fragment>
          ))}
        </List>
      )}

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCategory ? 'Редактировать категорию' : 'Новая категория'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Название"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              error={!!formErrors.name}
              helperText={formErrors.name}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Описание"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
              sx={{ mb: 3 }}
            />

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel id="icon-select-label">Иконка категории</InputLabel>
              <Select
                labelId="icon-select-label"
                value={formData.icon || 'build'}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                label="Иконка категории">
                {availableIcons.map(({ icon, label, component: IconComponent }) => (
                  <MenuItem key={icon} value={icon}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <IconComponent color="primary" />
                      <Typography>{label}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <IconPreview>
                {React.createElement(
                  availableIcons.find((i) => i.icon === (formData.icon || 'build'))?.component ||
                    BuildIcon,
                  { sx: { fontSize: 32 } },
                )}
              </IconPreview>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Отмена</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Сохранить'}
          </Button>
        </DialogActions>
      </Dialog>
    </StyledPaper>
  );
};

export default CategoryManager;

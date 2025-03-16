import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  InputAdornment,
  Tabs,
  Tab,
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Search as SearchIcon,
  Category as CategoryIcon,
  Build as BuildIcon,
  Assignment as AssignmentIcon,
} from '@mui/icons-material';
import IssuedToolsList from '../../components/Dashboard/IssuedTools/IssuedToolsList';
import CategoryManager from '../../components/Categories/CategoryManager';
import ToolForm from '../../components/Tools/ToolForm';
import ToolList from '../../components/Tools/ToolList';
import { toolsApi } from '../../services/toolsService';
import { requestsApi } from '../../services/requestsService';

const StorekeeperDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [issuedTools, setIssuedTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [returnDialog, setReturnDialog] = useState({ open: false, item: null });
  const [returnNotes, setReturnNotes] = useState('');
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    severity: 'success',
  });
  const [workerFilter, setWorkerFilter] = useState('');
  const [toolFormOpen, setToolFormOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const fetchIssuedTools = async () => {
    try {
      setLoading(true);
      const response = await toolsApi.getIssuedTools();
      let filteredTools = response.data;

      if (workerFilter.trim()) {
        const searchTerm = workerFilter.toLowerCase().trim();
        filteredTools = filteredTools.filter((tool) =>
          tool.user.fullName.toLowerCase().includes(searchTerm),
        );
      }

      setIssuedTools(filteredTools);
    } catch (err) {
      console.error('Error fetching issued tools:', err);
      setError('Ошибка при загрузке списка выданных инструментов');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await toolsApi.getAllCategories();
      setCategories(response.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
      setError('Ошибка при загрузке категорий');
    }
  };

  useEffect(() => {
    if (activeTab === 0) {
      const timer = setTimeout(() => {
        fetchIssuedTools();
      }, 300);
      return () => clearTimeout(timer);
    } else if (activeTab === 1 || activeTab === 2) {
      fetchCategories();
    }
  }, [activeTab, workerFilter]);

  // Добавляем эффект для сброса выбранной категории при смене вкладки
  useEffect(() => {
    setSelectedCategory('all');
  }, [activeTab]);

  const handleReturn = (item) => {
    if (item.status === 'returning') {
      setReturnDialog({ open: true, item });
    }
  };

  const handleConfirmReturn = async () => {
    try {
      await requestsApi.confirmReturn(returnDialog.item.id, { notes: returnNotes });
      setReturnDialog({ open: false, item: null });
      setReturnNotes('');
      setNotification({
        show: true,
        message: 'Возврат инструмента подтвержден',
        severity: 'success',
      });
      fetchIssuedTools();
    } catch (err) {
      console.error('Error confirming tool return:', err);
      setNotification({
        show: true,
        message: 'Ошибка при подтверждении возврата инструмента',
        severity: 'error',
      });
    }
  };

  const handleWorkerFilterChange = (event) => {
    setWorkerFilter(event.target.value);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleCreateTool = () => {
    setSelectedTool(null);
    setToolFormOpen(true);
  };

  const handleEditTool = (tool) => {
    setSelectedTool(tool);
    setToolFormOpen(true);
  };

  const handleToolFormClose = () => {
    setToolFormOpen(false);
    setSelectedTool(null);
  };

  const handleToolFormSubmit = async (toolData) => {
    try {
      if (selectedTool) {
        await toolsApi.updateTool(selectedTool.id, toolData);
        setNotification({
          show: true,
          message: 'Инструмент успешно обновлен',
          severity: 'success',
        });
      } else {
        await toolsApi.createTool(toolData);
        setNotification({
          show: true,
          message: 'Инструмент успешно создан',
          severity: 'success',
        });
      }
      setToolFormOpen(false);
      // Обновляем список инструментов
      fetchCategories();
    } catch (err) {
      console.error('Error saving tool:', err);
      setNotification({
        show: true,
        message: 'Ошибка при сохранении инструмента',
        severity: 'error',
      });
    }
  };

  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab icon={<AssignmentIcon />} label="Выданные инструменты" />
          <Tab icon={<BuildIcon />} label="Управление инструментами" />
          <Tab icon={<CategoryIcon />} label="Управление категориями" />
        </Tabs>
      </Paper>

      <Box sx={{ p: 3 }}>
        {activeTab === 0 && (
          <>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
              }}>
              <Typography variant="h5" gutterBottom>
                Выданные инструменты
              </Typography>

              <TextField
                size="small"
                placeholder="Поиск по имени работника"
                value={workerFilter}
                onChange={handleWorkerFilterChange}
                sx={{ minWidth: 250 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            <IssuedToolsList
              issuedTools={issuedTools}
              loading={loading}
              error={error}
              onReturn={handleReturn}
              showWorkerInfo={true}
              isWorkerView={false}
              hideActions={false}
            />
          </>
        )}

        {activeTab === 1 && (
          <>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
              }}>
              <Typography variant="h5" gutterBottom>
                Управление инструментами
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Категория</InputLabel>
                  <Select
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    label="Категория">
                    <MenuItem value="all">Все категории</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<BuildIcon />}
                  onClick={handleCreateTool}>
                  Добавить инструмент
                </Button>
              </Box>
            </Box>
            <ToolList
              showRequestButton={false}
              onEditClick={handleEditTool}
              categoryId={selectedCategory}
            />
          </>
        )}

        {activeTab === 2 && (
          <>
            <Typography variant="h5" gutterBottom>
              Управление категориями
            </Typography>
            <CategoryManager />
          </>
        )}
      </Box>

      {/* Диалог подтверждения возврата */}
      <Dialog open={returnDialog.open} onClose={() => setReturnDialog({ open: false, item: null })}>
        <DialogTitle>Подтверждение возврата инструмента</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Пожалуйста, проверьте состояние инструмента перед подтверждением возврата.
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Примечания"
            value={returnNotes}
            onChange={(e) => setReturnNotes(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReturnDialog({ open: false, item: null })}>Отмена</Button>
          <Button onClick={handleConfirmReturn} variant="contained" color="primary">
            Подтвердить возврат
          </Button>
        </DialogActions>
      </Dialog>

      {/* Форма создания/редактирования инструмента */}
      <ToolForm
        open={toolFormOpen}
        handleClose={handleToolFormClose}
        tool={selectedTool}
        categories={categories}
        onSubmit={handleToolFormSubmit}
      />

      {/* Уведомление */}
      {notification.show && (
        <Alert
          severity={notification.severity}
          sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}
          onClose={() => setNotification({ ...notification, show: false })}>
          {notification.message}
        </Alert>
      )}
    </Box>
  );
};

export default StorekeeperDashboard;

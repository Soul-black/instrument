import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
} from '@mui/material';
import IssuedToolsList from '../../components/Dashboard/IssuedTools/IssuedToolsList';
import { requestsApi } from '../../services/requestsService';

const WorkerDashboard = () => {
  const [borrowedTools, setBorrowedTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [returnDialog, setReturnDialog] = useState({ open: false, item: null });
  const [returnNotes, setReturnNotes] = useState('');
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    severity: 'success',
  });

  const fetchBorrowedTools = async () => {
    try {
      setLoading(true);
      const response = await requestsApi.getBorrowedTools();
      setBorrowedTools(response.data);
    } catch (err) {
      console.error('Error fetching borrowed tools:', err);
      setError('Ошибка при загрузке взятых инструментов');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBorrowedTools();
  }, []);

  const handleReturn = (item) => {
    setReturnDialog({ open: true, item });
  };

  const handleConfirmReturn = async () => {
    try {
      await requestsApi.returnTool(returnDialog.item.id, { notes: returnNotes });
      setReturnDialog({ open: false, item: null });
      setReturnNotes('');
      setNotification({
        show: true,
        message: 'Возврат инструмента инициирован. Ожидайте подтверждения кладовщика.',
        severity: 'success',
      });
      fetchBorrowedTools();
    } catch (err) {
      console.error('Error returning tool:', err);
      setNotification({
        show: true,
        message: 'Ошибка при возврате инструмента',
        severity: 'error',
      });
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Взятые инструменты
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <IssuedToolsList
            issuedTools={borrowedTools}
            loading={loading}
            error={error}
            onReturn={handleReturn}
            showWorkerInfo={false}
            isWorkerView={true}
            hideActions={false}
          />
        </Grid>
      </Grid>

      {/* Диалог подтверждения возврата */}
      <Dialog open={returnDialog.open} onClose={() => setReturnDialog({ open: false, item: null })}>
        <DialogTitle>Подтверждение возврата инструмента</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            После подтверждения возврата кладовщик должен будет проверить состояние инструмента.
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

export default WorkerDashboard;

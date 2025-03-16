import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
} from '@mui/material';
import { useAuth } from '../../hooks/useAuth';
import axios from 'axios';

const API_URL = 'http://localhost:5002';

const Requests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const fetchRequests = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/requests`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      setRequests(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching requests:', err);
      setError('Ошибка при загрузке заявок');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleProcess = (request, status) => {
    setSelectedRequest({ ...request, processStatus: status });
    setDialogOpen(true);
  };

  const handleConfirmProcess = async () => {
    try {
      await axios.patch(
        `${API_URL}/api/requests/${selectedRequest.id}/process`,
        {
          status: selectedRequest.processStatus,
          notes: notes,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        },
      );

      setDialogOpen(false);
      setNotes('');
      setNotification({
        open: true,
        message: 'Заявка успешно обработана',
        severity: 'success',
      });
      fetchRequests();
    } catch (err) {
      console.error('Error processing request:', err);
      setNotification({
        open: true,
        message: 'Ошибка при обработке заявки',
        severity: 'error',
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'error';
      case 'completed':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Ожидает';
      case 'approved':
        return 'Одобрено';
      case 'rejected':
        return 'Отклонено';
      case 'completed':
        return 'Завершено';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Заявки на инструменты
      </Typography>

      {requests.length === 0 ? (
        <Alert severity="info">Нет активных заявок</Alert>
      ) : (
        <Grid container spacing={3}>
          {requests.map((request) => (
            <Grid item xs={12} md={6} key={request.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="h6">{request.tool?.name}</Typography>
                    <Chip
                      label={getStatusText(request.status)}
                      color={getStatusColor(request.status)}
                      size="small"
                    />
                  </Box>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Работник: {request.user?.fullName}
                  </Typography>

                  <Typography variant="body2" gutterBottom>
                    Количество: {request.quantity}
                  </Typography>

                  <Typography variant="body2" gutterBottom>
                    Дата заявки: {new Date(request.requestDate).toLocaleDateString('ru-RU')}
                  </Typography>

                  <Typography variant="body2" gutterBottom>
                    Планируемый возврат:{' '}
                    {new Date(request.expectedReturnDate).toLocaleDateString('ru-RU')}
                  </Typography>

                  {request.status === 'pending' && user?.role === 'storekeeper' && (
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <Button
                        variant="contained"
                        color="success"
                        onClick={() => handleProcess(request, 'approved')}>
                        Одобрить
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleProcess(request, 'rejected')}>
                        Отклонить
                      </Button>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>
          {selectedRequest?.processStatus === 'approved' ? 'Одобрение заявки' : 'Отклонение заявки'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={3}
            label="Комментарий"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Отмена</Button>
          <Button
            onClick={handleConfirmProcess}
            variant="contained"
            color={selectedRequest?.processStatus === 'approved' ? 'success' : 'error'}>
            Подтвердить
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={notification.open}
        autoHideDuration={3000}
        onClose={() => setNotification({ ...notification, open: false })}>
        <Alert
          onClose={() => setNotification({ ...notification, open: false })}
          severity={notification.severity}
          sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Requests;

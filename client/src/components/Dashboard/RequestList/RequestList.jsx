import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import RequestCard from './RequestCard';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  backgroundColor: theme.palette.background.paper,
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
}));

const ScrollableBox = styled(Box)({
  overflowY: 'auto',
  flex: 1,
  '&::-webkit-scrollbar': {
    width: '8px',
  },
  '&::-webkit-scrollbar-track': {
    background: 'rgba(0, 0, 0, 0.1)',
  },
  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(255, 255, 255, 0.2)',
    borderRadius: '4px',
  },
});

const RequestList = ({
  requests = [],
  loading = false,
  error = null,
  onApprove,
  onReject,
  onInfo,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRequests = requests.filter((request) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      request.toolName.toLowerCase().includes(searchLower) ||
      request.userName.toLowerCase().includes(searchLower)
    );
  });

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  return (
    <StyledPaper
      role="region"
      aria-label="Список ожидающих заявок"
    >
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" component="h2" gutterBottom>
          Ожидающие заявки
        </Typography>
        
        <TextField
          fullWidth
          size="small"
          placeholder="Поиск по названию инструмента или имени работника"
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : filteredRequests.length === 0 ? (
        <Alert severity="info">
          {searchQuery
            ? 'Заявки не найдены'
            : 'Нет ожидающих заявок'}
        </Alert>
      ) : (
        <ScrollableBox>
          {filteredRequests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onApprove={onApprove}
              onReject={onReject}
              onInfo={onInfo}
            />
          ))}
        </ScrollableBox>
      )}
    </StyledPaper>
  );
};

export default RequestList; 
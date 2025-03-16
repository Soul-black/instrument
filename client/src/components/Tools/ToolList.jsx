import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  InputAdornment,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
  Fade,
  Skeleton,
  Tabs,
  Tab,
  Chip,
  Divider,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import ToolCard from './ToolCard';
import { toolsApi } from '../../services/toolsService';

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

const FilterBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(2),
  [theme.breakpoints.down('sm')]: {
    flexDirection: 'column',
  },
}));

const LoadingSkeleton = React.memo(() => (
  <Box sx={{ mb: 2 }}>
    <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
  </Box>
));

const CategoryTabs = styled(Tabs)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '& .MuiTab-root': {
    minWidth: 'auto',
    padding: theme.spacing(1, 2),
  },
}));

const CategoryTab = styled(Tab)(({ theme }) => ({
  textTransform: 'none',
  minWidth: 0,
  '&.MuiTab-root': {
    padding: theme.spacing(1, 2),
  },
}));

const ToolList = React.memo(
  ({ onRequestClick, showRequestButton = true, onEditClick, categoryId = null }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [tools, setTools] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
      total: 0,
      totalPages: 0,
    });

    const fetchTools = useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        let response;
        let toolsData;

        if (categoryId && categoryId !== 'all') {
          // Получаем категорию вместе с инструментами
          response = await toolsApi.getCategoryById(categoryId);
          console.log('Category response:', response);
          toolsData = response.data?.tools || [];
        } else {
          const params = {
            page,
            limit,
            search: searchQuery,
            status: statusFilter !== 'all' ? statusFilter : undefined,
            sortBy: 'name',
            sortOrder: 'ASC',
          };
          response = await toolsApi.getAllTools(params);
          console.log('All tools response:', response);
          toolsData = Array.isArray(response.data) ? response.data : response.data?.tools || [];
        }

        setTools(toolsData);

        // Настраиваем пагинацию
        if (response.data?.pagination) {
          setPagination(response.data.pagination);
        } else {
          setPagination({
            total: toolsData.length,
            totalPages: Math.ceil(toolsData.length / limit),
            currentPage: page,
          });
        }
      } catch (err) {
        setError('Ошибка при загрузке инструментов');
        console.error('Error fetching tools:', err);
      } finally {
        setLoading(false);
      }
    }, [page, limit, searchQuery, statusFilter, categoryId]);

    // Сбрасываем страницу при изменении фильтров
    useEffect(() => {
      setPage(1);
    }, [searchQuery, statusFilter, categoryId]);

    // Загружаем инструменты при изменении параметров
    useEffect(() => {
      const timer = setTimeout(() => {
        fetchTools();
      }, 300);
      return () => clearTimeout(timer);
    }, [fetchTools]);

    const handleSearchChange = useCallback((event) => {
      setSearchQuery(event.target.value);
    }, []);

    const handleStatusChange = useCallback((event) => {
      setStatusFilter(event.target.value);
      setPage(1);
    }, []);

    const handlePageChange = useCallback((event, value) => {
      setPage(value);
    }, []);

    const handleDeleteTool = async (tool) => {
      try {
        await toolsApi.deleteTool(tool.id);
        // Обновляем список после удаления
        fetchTools();
      } catch (error) {
        console.error('Error deleting tool:', error);
        setError(error.response?.data?.message || 'Ошибка при удалении инструмента');
      }
    };

    const renderedTools = useMemo(
      () =>
        tools.map((tool) => (
          <ToolCard
            key={tool.id}
            tool={tool}
            onRequestClick={onRequestClick}
            showRequestButton={showRequestButton}
            onEditClick={onEditClick}
            onDeleteClick={handleDeleteTool}
          />
        )),
      [tools, onRequestClick, showRequestButton, onEditClick, handleDeleteTool],
    );

    return (
      <StyledPaper role="region" aria-label="Список инструментов">
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" component="h2" gutterBottom>
            Инструменты
          </Typography>

          <FilterBox>
            <TextField
              fullWidth
              size="small"
              placeholder="Поиск по названию или описанию"
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />

            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel id="status-filter-label">Статус</InputLabel>
              <Select
                labelId="status-filter-label"
                value={statusFilter}
                label="Статус"
                onChange={handleStatusChange}>
                <MenuItem value="all">Все</MenuItem>
                <MenuItem value="active">Доступные</MenuItem>
                <MenuItem value="maintenance">На обслуживании</MenuItem>
                <MenuItem value="retired">Списанные</MenuItem>
              </Select>
            </FormControl>
          </FilterBox>
        </Box>

        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : (
          <ScrollableBox>
            {loading ? (
              Array.from(new Array(limit)).map((_, index) => <LoadingSkeleton key={index} />)
            ) : tools.length === 0 ? (
              <Fade in>
                <Alert severity="info">
                  {searchQuery || statusFilter !== 'all'
                    ? 'Инструменты не найдены'
                    : 'Нет доступных инструментов'}
                </Alert>
              </Fade>
            ) : (
              <Fade in>
                <Box>{renderedTools}</Box>
              </Fade>
            )}

            {!loading && tools.length > 0 && (
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Pagination
                  count={pagination.totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </ScrollableBox>
        )}
      </StyledPaper>
    );
  },
);

export default ToolList;

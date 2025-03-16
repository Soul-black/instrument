import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Breadcrumbs,
  Link,
  Paper,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
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
  Search as SearchIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { toolsApi } from '../../services/toolsService';
import ToolCard from '../../components/Tools/ToolCard';
import CreateRequestModal from '../../components/Tools/CreateRequestModal';
import { useAuth } from '../../hooks/useAuth';

const CategoryIconWrapper = styled(Box)(({ theme }) => ({
  width: '48px',
  height: '48px',
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginRight: theme.spacing(2),
}));

// Карта соответствия названий иконок и компонентов
const iconComponents = {
  build: BuildIcon,
  handyman: HandymanIcon,
  construction: ConstructionIcon,
  straighten: StraightenIcon,
  hardware: HardwareIcon,
  electrical_services: ElectricalServicesIcon,
  plumbing: PlumbingIcon,
  carpenter: CarpenterIcon,
  architecture: ArchitectureIcon,
  healing: HealingIcon,
};

const CategoryTools = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [tools, setTools] = useState([]);
  const [filteredTools, setFilteredTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTool, setSelectedTool] = useState(null);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { user, role } = useAuth();

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        setLoading(true);
        const [categoryResponse, toolsResponse] = await Promise.all([
          toolsApi.getCategoryById(categoryId),
          toolsApi.getToolsByCategory(categoryId)
        ]);
        
        const filteredTools = toolsResponse.data.filter(tool => tool.categoryId === parseInt(categoryId));
        
        setCategory(categoryResponse.data);
        setTools(filteredTools);
        setFilteredTools(filteredTools);
      } catch (err) {
        console.error('Error fetching category data:', err);
        setError('Ошибка при загрузке данных категории');
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryData();
  }, [categoryId]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTools(tools);
    } else {
      const filtered = tools.filter(tool =>
        tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tool.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTools(filtered);
    }
  }, [searchQuery, tools]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleRequestClick = (tool) => {
    setSelectedTool(tool);
    setRequestModalOpen(true);
  };

  const handleRequestClose = () => {
    setSelectedTool(null);
    setRequestModalOpen(false);
  };

  const handleRequestSubmit = async (requestData) => {
    try {
      setLoading(true);
      await toolsApi.createToolRequest(requestData);
      setRequestModalOpen(false);
      // Обновляем список инструментов после успешного создания заявки
      const toolsResponse = await toolsApi.getToolsByCategory(categoryId);
      const filteredTools = toolsResponse.data.filter(tool => tool.categoryId === parseInt(categoryId));
      setTools(filteredTools);
    } catch (err) {
      console.error('Error creating tool request:', err);
      setError('Ошибка при создании заявки');
    } finally {
      setLoading(false);
    }
  };

  const renderCategoryIcon = (iconName) => {
    const IconComponent = iconComponents[iconName] || BuildIcon;
    return <IconComponent sx={{ fontSize: 32 }} />;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!category) {
    return <Alert severity="error">Категория не найдена</Alert>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconButton 
            onClick={() => navigate(-1)}
            sx={{ mr: 1 }}
            aria-label="Вернуться назад"
          >
            <ArrowBackIcon />
          </IconButton>
          <Breadcrumbs aria-label="навигация">
            <Link 
              component="button"
              variant="body1" 
              onClick={() => navigate('/tools')}
              underline="hover"
              color="inherit"
            >
              Категории
            </Link>
            <Typography color="text.primary">{category.name}</Typography>
          </Breadcrumbs>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <CategoryIconWrapper>
            {renderCategoryIcon(category.icon)}
          </CategoryIconWrapper>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {category.name}
            </Typography>
            {category.description && (
              <Typography variant="body1" color="text.secondary">
                {category.description}
              </Typography>
            )}
          </Box>
          <TextField
            size="small"
            placeholder="Поиск инструмента"
            value={searchQuery}
            onChange={handleSearchChange}
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
      </Box>

      {filteredTools.length === 0 ? (
        <Alert severity="info">
          {searchQuery.trim() ? 'По вашему запросу ничего не найдено' : 'В данной категории пока нет инструментов'}
        </Alert>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filteredTools.map((tool) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              onRequestClick={handleRequestClick}
              showRequestButton={role === 'worker' && tool.status === 'active' && tool.availableQuantity > 0}
            />
          ))}
        </Box>
      )}

      {selectedTool && (
        <CreateRequestModal
          open={requestModalOpen}
          onClose={handleRequestClose}
          tool={selectedTool}
          onSubmit={handleRequestSubmit}
          loading={loading}
        />
      )}
    </Box>
  );
};

export default CategoryTools; 
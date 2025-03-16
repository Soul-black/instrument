import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Typography,
  Box,
  Chip,
  Skeleton,
  Alert,
} from '@mui/material';
import {
  Build as BuildIcon,
  Handyman as HandymanIcon,
  Construction as ConstructionIcon,
  Straighten as StraightenIcon,
  Hardware as HardwareIcon,
  ElectricalServices as ElectricalServicesIcon,
  Plumbing as PlumbingIcon,
  Carpenter as CarpenterIcon,
  Architecture as ArchitectureIcon,
  Healing as HealingIcon
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { toolsApi } from '../../services/toolsService';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[4],
  },
}));

const CategoryIconWrapper = styled(Box)(({ theme }) => ({
  width: '64px',
  height: '64px',
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  transition: 'transform 0.2s ease-in-out, background-color 0.2s ease-in-out',
  '&:hover': {
    transform: 'scale(1.1)',
    backgroundColor: theme.palette.primary.dark,
  },
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

const LoadingSkeleton = () => (
  <Grid item xs={12} sm={6} md={4}>
    <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
  </Grid>
);

const CategoryGrid = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await toolsApi.getAllCategories();
        setCategories(response.data);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Ошибка при загрузке категорий');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryId) => {
    navigate(`/categories/${categoryId}`);
  };

  const renderCategoryIcon = (iconName) => {
    const IconComponent = iconComponents[iconName] || BuildIcon;
    return <IconComponent sx={{ fontSize: 36 }} />;
  };

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Grid container spacing={3}>
      {loading ? (
        Array.from(new Array(6)).map((_, index) => (
          <LoadingSkeleton key={index} />
        ))
      ) : (
        categories.map((category) => (
          <Grid item xs={12} sm={6} md={4} key={category.id}>
            <StyledCard>
              <CardActionArea
                onClick={() => handleCategoryClick(category.id)}
                sx={{ height: '100%' }}
              >
                <CardContent sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  textAlign: 'center',
                  p: 3
                }}>
                  <CategoryIconWrapper>
                    {renderCategoryIcon(category.icon)}
                  </CategoryIconWrapper>
                  <Typography variant="h6" component="h2" gutterBottom>
                    {category.name}
                  </Typography>
                  <Typography 
                    variant="body2" 
                    color="text.secondary"
                    sx={{ mb: 2, flexGrow: 1 }}
                  >
                    {category.description}
                  </Typography>
                  <Chip
                    label={`${category.toolsCount} инструментов`}
                    color="primary"
                    variant="outlined"
                  />
                </CardContent>
              </CardActionArea>
            </StyledCard>
          </Grid>
        ))
      )}
    </Grid>
  );
};

export default CategoryGrid; 
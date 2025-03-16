import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import CategoryGrid from '../../components/Categories/CategoryGrid';

const Tools = () => {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Категории инструментов
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Выберите категорию, чтобы просмотреть доступные инструменты
        </Typography>
        <CategoryGrid />
      </Box>
    </Container>
  );
};

export default Tools;

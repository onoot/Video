// client/src/components/nav/PageHeader.jsx
import React, { useContext } from 'react';
import { StorageContext } from '../../contex';
import { Typography, Breadcrumbs, Link, useTheme, Box } from '@mui/material';
import { Home as HomeIcon, NavigateNext as NavigateNextIcon } from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';

const PageHeader = () => {
  const { pageTitle, user } = useContext(StorageContext);
  const theme = useTheme();

  return (
    <Box sx={{ width: '100%', mb: 3 }}>
      <Typography 
        variant="h4" 
        sx={{ 
          fontWeight: 700,
          background: `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          mb: 1
        }}
      >
        {pageTitle}
      </Typography>
    </Box>
  );
};

export default PageHeader;
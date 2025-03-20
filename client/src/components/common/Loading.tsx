import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  CircularProgress,
  ThemeProvider,
  createTheme
} from '@mui/material';

interface LocationState {
  nextRoute: string;
  params: Record<string, any>;
}

const Loading: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { nextRoute, params } = (location.state as LocationState) || {};

  useEffect(() => {
    if (!nextRoute) {
      navigate('/');
      return;
    }

    const timer = setTimeout(() => {
      navigate(nextRoute, { state: { params } });
    }, 1500);

    return () => clearTimeout(timer);
  }, [nextRoute, params, navigate]);

  const theme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#1DB954',
      },
      background: {
        default: '#121212',
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#121212',
        }}
      >
        <CircularProgress 
          color="primary" 
          size={70} 
          thickness={4}
          sx={{
            animation: 'pulse 1.5s infinite alternate',
            '@keyframes pulse': {
              '0%': {
                opacity: 0.6,
              },
              '100%': {
                opacity: 1,
              },
            },
          }}
        />
        <Typography 
          variant="h5" 
          color="primary" 
          sx={{ 
            mt: 3,
            animation: 'fadeInOut 2s infinite alternate',
            '@keyframes fadeInOut': {
              '0%': {
                opacity: 0.7,
              },
              '100%': {
                opacity: 1,
              },
            },
          }}
        >
          Loading music...
        </Typography>
      </Box>
    </ThemeProvider>
  );
};

export default Loading; 
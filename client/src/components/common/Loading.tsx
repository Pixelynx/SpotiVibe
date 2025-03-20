import React from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress,
  Fade
} from '@mui/material';

interface LoadingProps {
  isLoading: boolean;
  message?: string;
  sx?: object;
  /* Children components - not used but included for type compatibility */
  children?: React.ReactNode;
}

const Loading: React.FC<LoadingProps> = ({ 
  isLoading, 
  message,
  sx = {},
  children: _  // Intentionally ignored
}) => {
  if (!isLoading) return null;

  return (
    <Fade in={isLoading} timeout={300}>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(18, 18, 18, 0.25)',
          backdropFilter: 'blur(1px)',
          zIndex: 1000,
          borderRadius: '4px',
          ...sx
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(18, 18, 18, 0.8)',
            borderRadius: '8px',
            padding: '16px 24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
          }}
        >
          <CircularProgress 
            color="primary" 
            size={50} 
            thickness={4}
            sx={{
              animation: 'pulse 1.5s infinite alternate',
              '@keyframes pulse': {
                '0%': { opacity: 0.6 },
                '100%': { opacity: 1 }
              },
            }}
          />
          {message && (
            <Typography 
              variant="body1" 
              color="primary" 
              sx={{ 
                mt: 2,
                fontWeight: 'medium',
                animation: 'fadeInOut 2s infinite alternate',
                '@keyframes fadeInOut': {
                  '0%': { opacity: 0.7 },
                  '100%': { opacity: 1 }
                },
              }}
            >
              {message}
            </Typography>
          )}
        </Box>
      </Box>
    </Fade>
  );
};

export default Loading; 
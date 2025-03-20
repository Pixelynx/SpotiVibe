import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  ThemeProvider,
  createTheme
} from '@mui/material';
import Loading from '../components/common/Loading.tsx';
import '../styles/DurationPage.css';
import { API_BASE_URL } from '../config.ts';

interface DurationData {
  artist_name: string;
  artists: string[];
  song_table: string[][];
  duration: {
    hours: number;
    minutes: number;
    seconds: number;
  };
}

interface LocationState {
  artist: string;
}

const DurationPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DurationData | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { artist } = (location.state as LocationState) || {};

  useEffect(() => {
    if (!artist) {
      navigate('/');
      return;
    }

    const fetchDuration = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/catalog_duration`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ artist }),
          credentials: 'include'
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to get catalog information');
        }

        const result = await response.json();
        setData(result);
        setLoading(false);
      } catch (err) {
        setError((err as Error).message);
        setLoading(false);
      }
    };

    fetchDuration();
  }, [artist, navigate]);

  const handleBackClick = () => {
    navigate('/');
  };

  const theme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#1DB954',
      },
      secondary: {
        main: '#ffffff',
      },
      background: {
        default: '#121212',
        paper: '#282828',
      },
    },
    components: {
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: '1px solid #3a3a3a',
          },
          head: {
            backgroundColor: '#1DB954',
            color: '#ffffff',
            fontWeight: 'bold',
          },
        },
      },
    },
  });

  if (error) {
    return (
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
          }}
        >
          <Typography variant="h5" color="error" gutterBottom>
            Error
          </Typography>
          <Typography variant="body1" gutterBottom>
            {error}
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={handleBackClick}
            sx={{ mt: 2 }}
          >
            Back to Home
          </Button>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3, 
              mb: 4, 
              textAlign: 'center',
              borderRadius: 2,
            }}
          >
            <Typography 
              variant="h4" 
              component="h1" 
              gutterBottom
              sx={{ 
                color: '#1DB954',
                fontWeight: 'bold',
              }}
            >
              Catalog Duration for {artist}
            </Typography>
            
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                mb: 3, 
                display: 'inline-block',
                backgroundColor: '#2e2e2e', 
                borderRadius: 2,
              }}
            >
              <Typography variant="h6">
                Total Time: {data ? `${data.duration.hours}h ${data.duration.minutes}m ${data.duration.seconds}s` : '0h 0m 0s'}
              </Typography>
            </Paper>
            
            <Button
              variant="contained"
              color="primary"
              onClick={handleBackClick}
              sx={{
                mb: 3,
                backgroundColor: '#1DB954',
                '&:hover': {
                  backgroundColor: '#1ed760',
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.3s ease',
              }}
            >
              Back to Home
            </Button>
          </Paper>

          <Box sx={{ position: 'relative', minHeight: '300px' }}>
            <Loading 
              isLoading={loading} 
              message="Calculating song durations..."
            />
            
            <TableContainer 
              component={Paper} 
              sx={{ 
                borderRadius: 2,
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                opacity: loading ? 0.7 : 1,
                transition: 'opacity 0.3s ease',
              }}
            >
              {data ? (
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow>
                      {data.artists.map((artist, index) => (
                        <TableCell key={index}>{artist}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {data.song_table.map((row, rowIndex) => (
                      <TableRow key={rowIndex} hover>
                        {row.map((song, colIndex) => (
                          <TableCell key={colIndex}>{song}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    Loading song information...
                  </Typography>
                </Box>
              )}
            </TableContainer>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default DurationPage; 
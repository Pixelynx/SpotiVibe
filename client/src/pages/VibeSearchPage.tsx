import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Paper, 
  CircularProgress,
  ThemeProvider,
  createTheme
} from '@mui/material';
import SearchResults from '../components/VibeSearch/SearchResults.tsx';
import '../styles/VibeSearchPage.css';
import { API_BASE_URL } from '../config.ts';

interface SearchResult {
  query: string;
  relevant_songs: Array<{
    title: string;
    artist: string;
    year?: string;
    url?: string;
  }>;
  total_pages: number;
  total_results: number;
  current_page: number;
}

interface LocationState {
  params: {
    query: string;
    artist: string;
  };
}

const VibeSearchPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResult | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const location = useLocation();
  const navigate = useNavigate();
  const { query, artist } = (location.state?.params as { query: string; artist: string }) || {};

  useEffect(() => {
    if (!query || !artist) {
      navigate('/');
      return;
    }

    const searchVibe = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/vibe_search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            query, 
            artist, 
            page: currentPage 
          }),
          credentials: 'include'
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to search vibe');
        }

        const result = await response.json();
        setResults(result);
        setLoading(false);
      } catch (err) {
        setError((err as Error).message);
        setLoading(false);
      }
    };

    searchVibe();
  }, [query, artist, currentPage, navigate]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    setLoading(true);
  };

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
  });

  if (loading) {
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
          <CircularProgress color="primary" size={60} thickness={4} />
          <Typography variant="h6" sx={{ mt: 3 }}>
            Searching vibes in {artist}'s catalog...
          </Typography>
        </Box>
      </ThemeProvider>
    );
  }

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
              Vibe Search Results
            </Typography>
            
            {results && (
              <Typography variant="h6" sx={{ mb: 2 }}>
                Showing songs matching "{results.query}" by {artist}
              </Typography>
            )}
            
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

          {results && (
            <SearchResults 
              results={results} 
              currentPage={currentPage}
              onPageChange={handlePageChange}
            />
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default VibeSearchPage; 
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Paper, 
  ThemeProvider,
  createTheme
} from '@mui/material';
import YearFilter from '../components/VibeSearch/YearFilter.tsx';
import Loading from '../components/common/Loading.tsx';
import '../styles/VibeSearchPage.css';
import { useAppDispatch, useAppSelector } from '../store/hooks.ts';
import { searchVibe } from '../store/actions/vibeSearchActions.ts';
import { 
  selectVibeLoading, 
  selectVibeError,
  selectVibeQuery,
  selectVibeArtist
} from '../store/selectors/vibeSearchSelectors.ts';
import SearchResults from 'components/VibeSearch/SearchResults.tsx';

interface LocationState {
  params: {
    query: string;
    artist: string;
  };
}

const VibeSearchPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectVibeLoading);
  const error = useAppSelector(selectVibeError);
  const reduxQuery = useAppSelector(selectVibeQuery);
  const reduxArtist = useAppSelector(selectVibeArtist);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { query, artist } = (location.state?.params as { query: string; artist: string }) || {};

  useEffect(() => {
    if (!query || !artist) {
      navigate('/');
      return;
    }

    // Only dispatch search if we have new search parameters
    if (query !== reduxQuery || artist !== reduxArtist) {
      dispatch(searchVibe({ query, artist, page: 1 }));
    }
  }, [query, artist, reduxQuery, reduxArtist, dispatch, navigate]);

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
            
            <Typography variant="h6" sx={{ mb: 2 }}>
              Showing songs matching "{query}" by {artist}
            </Typography>
            
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                mb: 0, 
                display: 'inline-block',
                backgroundColor: '#2e2e2e', 
                borderRadius: 2,
              }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={handleBackClick}
                sx={{
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
          </Paper>

          <Box sx={{ position: 'relative' }}>
            <Loading 
              isLoading={loading} 
              message="Searching for vibes..."
            />
            
            {/* Year Filter Component */}
            <YearFilter />
            
            {/* Search Results */}
            <Box sx={{ 
              opacity: loading ? 0.7 : 1,
              transition: 'opacity 0.3s ease'
            }}>
              <SearchResults />
            </Box>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default VibeSearchPage; 
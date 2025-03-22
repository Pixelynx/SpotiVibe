import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Paper, 
  Grid,
  Card,
  CardContent,
  CardActions,
  Link,
  Pagination,
  ThemeProvider,
  createTheme,
  Stack
} from '@mui/material';
import Loading from '../components/common/Loading.tsx';
import '../styles/DurationPage.css';
import { useAppDispatch, useAppSelector } from '../store/hooks.ts';
import { 
  selectArtists, 
  selectSongs, 
  selectDuration, 
  selectLoadingStates, 
  selectError, 
  selectFormattedDuration, 
  selectSelectedArtist, 
  selectPaginatedSongs,
  selectCurrentPage,
  selectTotalPages,
  selectOriginalArtist
} from '../store/selectors/catalogSelectors.ts';
import { fetchArtistCatalogDuration, selectArtistAndFetchSongs } from '../store/actions/catalogActions.ts';
import { changePage } from '../store/slices/catalogSlice.ts';

interface LocationState {
  artist: string;
}

const DurationPage: React.FC = () => {
  // Redux hooks
  const dispatch = useAppDispatch();
  const artists = useAppSelector(selectArtists);
  const songs = useAppSelector(selectSongs);
  const paginatedSongs = useAppSelector(selectPaginatedSongs);
  const duration = useAppSelector(selectDuration);
  const formattedDuration = useAppSelector(selectFormattedDuration);
  const loading = useAppSelector(selectLoadingStates);
  const error = useAppSelector(selectError);
  const selectedArtist = useAppSelector(selectSelectedArtist);
  const currentPage = useAppSelector(selectCurrentPage);
  const totalPages = useAppSelector(selectTotalPages);
  const originalArtist = useAppSelector(selectOriginalArtist);
  
  const location = useLocation();
  const navigate = useNavigate();
  const { artist } = (location.state as LocationState) || {};

  useEffect(() => {
    if (!artist) {
      navigate('/');
      return;
    }

    dispatch(fetchArtistCatalogDuration(artist));
  }, [dispatch, artist, navigate]);

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    dispatch(changePage(page));
  };

  const handleBackClick = () => {
    navigate('/');
  };

  const handleArtistSelect = (artistId: string) => {
    dispatch(selectArtistAndFetchSongs(artistId));
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
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: '#282828',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: '#282828',
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

  const isLoading = loading.artists || loading.songs;

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
              Catalog Duration for {originalArtist || artist || (artists.length > 0 ? artists[0].name : '')}
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
                Total Time: {formattedDuration}
              </Typography>
              
              <Button
                variant="contained"
                color="primary"
                onClick={handleBackClick}
                sx={{
                  mt: 2,
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
              isLoading={isLoading} 
              message="Calculating song durations..."
            />
            
            {/* CONTAINER 1: Artist Selector */}
            <Paper
              elevation={2}
              sx={{
                p: 2,
                mb: 3,
                borderRadius: 2,
              }}
            >
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 2, 
                  color: '#1DB954',
                  fontWeight: 'medium',
                }}
              >
                Select an Artist
              </Typography>
              
              <Stack 
                direction="row" 
                spacing={1} 
                sx={{ 
                  flexWrap: 'wrap', 
                  gap: 1,
                  '& > *': {
                    my: 0.5,
                  }
                }}
              >
                {/* Show the first artist (searched artist) in a slightly larger size */}
                {artists.length > 0 && (
                  <Paper
                    key={artists[0].id}
                    elevation={artists[0].isSelected ? 3 : 2}
                    onClick={() => handleArtistSelect(artists[0].id)}
                    sx={{
                      px: 2.5,
                      py: 1.75,
                      cursor: 'pointer',
                      backgroundColor: artists[0].isSelected ? 'rgba(29, 185, 84, 0.25)' : '#323232',
                      color: artists[0].isSelected ? '#fff' : 'inherit',
                      borderRadius: 2,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: '0 4px 10px rgba(0, 0, 0, 0.25)',
                        backgroundColor: artists[0].isSelected ? 'rgba(29, 185, 84, 0.3)' : '#3a3a3a',
                      },
                      border: artists[0].isSelected ? '1px solid rgba(29, 185, 84, 0.6)' : 'none',
                      fontWeight: 'medium',
                    }}
                  >
                    <Typography variant="body1" fontWeight="medium">{artists[0].name}</Typography>
                  </Paper>
                )}
                
                {/* Show other artists in normal size */}
                {artists.slice(1).map((artist) => (
                  <Paper
                    key={artist.id}
                    elevation={artist.isSelected ? 2 : 1}
                    onClick={() => handleArtistSelect(artist.id)}
                    sx={{
                      px: 2,
                      py: 1.5,
                      cursor: 'pointer',
                      backgroundColor: artist.isSelected ? 'rgba(29, 185, 84, 0.2)' : '#323232',
                      color: artist.isSelected ? '#fff' : 'inherit',
                      borderRadius: 2,
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                        backgroundColor: artist.isSelected ? 'rgba(29, 185, 84, 0.25)' : '#3a3a3a',
                      },
                      border: artist.isSelected ? '1px solid rgba(29, 185, 84, 0.5)' : 'none',
                    }}
                  >
                    <Typography variant="body1">{artist.name}</Typography>
                  </Paper>
                ))}
              </Stack>
            </Paper>
            
            {/* CONTAINER 2: Song Grid */}
            {/* TODO: Fix filter logic with artist selector */}
            <Paper
              elevation={3}
              sx={{
                p: 3,
                borderRadius: 2,
                mb: 2,
                minHeight: '300px',
              }}
            >
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 2.5, 
                  color: '#1DB954',
                  fontWeight: 'medium',
                }}
              >
                Song Collection
              </Typography>
              
              {paginatedSongs.length > 0 ? (
                <Box>
                  <Grid container spacing={2}>
                    {paginatedSongs.map((song) => (
                      <Grid item xs={12} sm={6} md={4} lg={2.4} key={song.id}>
                        <Card
                          sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            borderRadius: 2,
                            overflow: 'hidden',
                            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                            '&:hover': {
                              transform: 'translateY(-3px)',
                              boxShadow: '0 8px 15px rgba(0, 0, 0, 0.3)',
                            },
                          }}
                        >
                          <CardContent sx={{ flexGrow: 1, p: 2 }}>
                            <Typography 
                              variant="subtitle1" 
                              component="h3" 
                              sx={{ 
                                fontWeight: 'medium',
                                mb: 0.5,
                                color: '#1DB954',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                              }}
                            >
                              {song.name}
                            </Typography>
                            <Typography 
                              variant="body2" 
                              color="text.secondary"
                              sx={{
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {song.artist}
                            </Typography>
                          </CardContent>
                          <CardActions sx={{ p: 1.5, pt: 0, justifyContent: 'flex-end' }}>
                            <Link
                              href="#" // TODO: Populate from Genius API
                              underline="hover"
                              sx={{ 
                                fontSize: '0.875rem',
                                color: 'rgba(29, 185, 84, 0.8)',
                                '&:hover': {
                                  color: '#1DB954',
                                }
                              }}
                            >
                              Lyrics
                            </Link>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                      <Pagination 
                        count={totalPages} 
                        page={currentPage}
                        onChange={handlePageChange}
                        color="primary"
                        size="large"
                        sx={{
                          '& .MuiPaginationItem-root': {
                            color: '#fff',
                          },
                          '& .Mui-selected': {
                            backgroundColor: '#1DB954',
                          }
                        }}
                      />
                    </Box>
                  )}
                </Box>
              ) : (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography variant="body1" color="text.secondary">
                    No songs available for this artist.
                  </Typography>
                </Box>
              )}
            </Paper>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default DurationPage; 
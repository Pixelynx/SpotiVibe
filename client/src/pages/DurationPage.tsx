import React, { useEffect } from 'react';
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
  createTheme,
  Pagination
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
  selectTotalPages
} from '../store/selectors/catalogSelectors.ts';
import { fetchArtists, selectArtistAndFetchSongs } from '../store/actions/catalogActions.ts';
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
  
  const location = useLocation();
  const navigate = useNavigate();
  const { artist } = (location.state as LocationState) || {};

  useEffect(() => {
    if (!artist) {
      navigate('/');
      return;
    }

    dispatch(fetchArtists());
  }, [dispatch, artist, navigate]);

  useEffect(() => {
    if (artist && artists.length > 0) {
      const foundArtist = artists.find(a => a.name.toLowerCase() === artist.toLowerCase());
      if (foundArtist) {
        dispatch(selectArtistAndFetchSongs(foundArtist.id));
      }
    }
  }, [artist, artists, dispatch]);

  const handleBackClick = () => {
    navigate('/');
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    dispatch(changePage(page));
  };

  const prepareSongTable = () => {
    if (!paginatedSongs.length) return [];
    
    const columns = 5;
    const rows = Math.ceil(paginatedSongs.length / columns);
    
    // Create a 2D array for the table
    const table = Array(rows).fill(null).map(() => Array(columns).fill(''));
    
    paginatedSongs.forEach((song, index) => {
      const row = Math.floor(index / columns);
      const col = index % columns;
      table[row][col] = `${song.name} (${song.duration})`;
    });
    
    return table;
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

  const songTable = prepareSongTable();
  const artistColumns = artists.slice(0, 5).map(a => a.name);
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
              Catalog Duration for {selectedArtist?.name || artist}
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
              isLoading={isLoading} 
              message="Calculating song durations..."
            />
            
            <TableContainer 
              component={Paper} 
              sx={{ 
                borderRadius: 2,
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                opacity: isLoading ? 0.7 : 1,
                transition: 'opacity 0.3s ease',
              }}
            >
              {songs.length > 0 ? (
                <>
                  <Table sx={{ minWidth: 650 }}>
                    <TableHead>
                      <TableRow>
                        {artistColumns.map((artist, index) => (
                          <TableCell key={index}>{artist}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {songTable.map((row, rowIndex) => (
                        <TableRow key={rowIndex} hover>
                          {row.map((song, colIndex) => (
                            <TableCell key={colIndex}>{song}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
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
                </>
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
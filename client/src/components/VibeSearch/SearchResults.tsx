import React from 'react';
import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions, 
  Button, 
  Link, 
  Pagination,
  Paper
} from '@mui/material';

interface Song {
  title: string;
  artist: string;
  year?: string;
  url?: string;
}

interface SearchResultsProps {
  results: {
    relevant_songs: Song[];
    total_pages: number;
    total_results: number;
    query: string;
  };
  currentPage: number;
  onPageChange: (page: number) => void;
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, currentPage, onPageChange }) => {
  if (!results || !results.relevant_songs || results.relevant_songs.length === 0) {
    return (
      <Paper 
        elevation={2} 
        sx={{ 
          p: 4, 
          textAlign: 'center',
          backgroundColor: '#282828',
          borderRadius: 2
        }}
      >
        <Typography variant="h6" color="text.secondary">
          No songs found matching this vibe. Try a different search.
        </Typography>
      </Paper>
    );
  }

  const { relevant_songs, total_pages, total_results } = results;

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    onPageChange(page);
  };

  return (
    <Box>
      <Typography 
        variant="body1" 
        align="center" 
        sx={{ mb: 4 }}
      >
        Found {total_results} song{total_results !== 1 ? 's' : ''} matching your vibe.
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {relevant_songs.map((song, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card 
              sx={{ 
                height: '100%', 
                display: 'flex', 
                flexDirection: 'column', 
                bgcolor: '#282828',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: '0 8px 15px rgba(0, 0, 0, 0.2)',
                  bgcolor: '#333',
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography 
                  variant="h6" 
                  component="h3" 
                  gutterBottom
                  sx={{ color: '#1DB954' }}
                >
                  {song.title}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {song.artist}
                </Typography>
                {song.year && (
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Released: {song.year}
                  </Typography>
                )}
              </CardContent>
              {song.url && (
                <CardActions>
                  <Link
                    href={song.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    underline="none"
                    sx={{ ml: 1, mb: 1 }}
                  >
                    <Button 
                      size="small" 
                      variant="contained"
                      sx={{ 
                        bgcolor: '#1DB954',
                        '&:hover': {
                          bgcolor: '#1ed760',
                        }
                      }}
                    >
                      View Lyrics
                    </Button>
                  </Link>
                </CardActions>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>
      
      {total_pages > 1 && (
        <Box display="flex" justifyContent="center" sx={{ mt: 4 }}>
          <Pagination 
            count={total_pages} 
            page={currentPage} 
            onChange={handlePageChange} 
            color="primary"
            size="large"
            showFirstButton
            showLastButton
            sx={{
              '& .MuiPaginationItem-root': {
                color: '#ffffff',
              },
              '& .MuiPaginationItem-page.Mui-selected': {
                backgroundColor: '#1DB954',
              },
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default SearchResults; 
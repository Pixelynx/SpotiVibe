import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Tabs, 
  Tab, 
  TextField, 
  Button, 
  Paper,
  ThemeProvider,
  createTheme
} from '@mui/material';
import '../styles/Home.css';
import AuthContext, { AuthContextType } from '../contexts/AuthContext.tsx';
import { useAppDispatch } from '../store/hooks.ts';
import { searchVibe } from '../store/actions/vibeSearchActions.ts';

type TabPanelProps = {
  children?: React.ReactNode;
  index: number;
  value: number;
};

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const Home: React.FC = () => {
  const [tabValue, setTabValue] = useState<number>(0);
  const [artistName, setArtistName] = useState<string>('');
  const [vibeQuery, setVibeQuery] = useState<string>('');
  const [vibeArtist, setVibeArtist] = useState<string>('');
  const { authenticated, login } = useContext<AuthContextType>(AuthContext);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleDurationSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!authenticated) {
      await login();
      return;
    }
    
    if (!artistName) return;
    
    navigate('/catalog-duration', { state: { artist: artistName } });
  };

  const handleVibeSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!authenticated) {
      await login();
      return;
    }
    
    if (!vibeQuery || !vibeArtist) return;
    
    dispatch(searchVibe({ query: vibeQuery, artist: vibeArtist, page: 1 }));
    
    navigate('/vibe-search', { 
      state: { 
        params: { query: vibeQuery, artist: vibeArtist } 
      } 
    });
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
      MuiTab: {
        styleOverrides: {
          root: {
            '&.Mui-selected': {
              color: '#ffffff',
              backgroundColor: '#1DB954',
            },
          },
        },
      },
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="sm">
        <Paper 
          elevation={6} 
          sx={{ 
            mt: 10, 
            p: 4, 
            borderRadius: 2,
            background: 'linear-gradient(145deg, #3a3a3a, #282828)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: 'translateY(-5px)',
              boxShadow: '0 8px 15px rgba(0, 0, 0, 0.25), 0 20px 50px rgba(0, 0, 0, 0.2)',
              background: 'linear-gradient(145deg, #404040, #2e2e2e)',
            }
          }}
        >
          <Typography 
            variant="h3" 
            component="h1" 
            align="center" 
            gutterBottom
            sx={{ 
              color: '#1DB954',
              mb: 4,
              fontWeight: 'bold'
            }}
          >
            SpotiVibe
          </Typography>
          
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              variant="fullWidth"
              sx={{
                '& .MuiTabs-indicator': {
                  backgroundColor: '#1DB954',
                },
              }}
            >
              <Tab label="Catalog Duration" />
              <Tab label="Vibe Search" />
            </Tabs>
          </Box>
          
          <TabPanel value={tabValue} index={0}>
            <Box 
              component="form" 
              onSubmit={handleDurationSubmit}
              sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: 2
              }}
            >
              <TextField
                fullWidth
                label="Enter artist name"
                variant="outlined"
                value={artistName}
                onChange={(e) => setArtistName(e.target.value)}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#1DB954',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1DB954',
                    },
                  },
                }}
              />
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                size="large"
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
                Calculate Duration
              </Button>
            </Box>
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <Box 
              component="form" 
              onSubmit={handleVibeSubmit}
              sx={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: 2
              }}
            >
              <TextField
                fullWidth
                label="Enter vibe or phrase"
                variant="outlined"
                value={vibeQuery}
                onChange={(e) => setVibeQuery(e.target.value)}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#1DB954',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1DB954',
                    },
                  },
                }}
              />
              <TextField
                fullWidth
                label="Enter artist name"
                variant="outlined"
                value={vibeArtist}
                onChange={(e) => setVibeArtist(e.target.value)}
                required
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: '#1DB954',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#1DB954',
                    },
                  },
                }}
              />
              <Button 
                type="submit" 
                variant="contained" 
                color="primary"
                size="large"
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
                Catch A Vibe
              </Button>
            </Box>
          </TabPanel>
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default Home; 
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, Box, ThemeProvider, createTheme } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from './store/store';
import Home from './pages/Home.tsx';
import DurationPage from './pages/DurationPage.tsx';
import VibeSearchPage from './pages/VibeSearchPage.tsx';
import Loading from './components/common/Loading.tsx';
import AuthContext, { AuthContextType } from './contexts/AuthContext.tsx';
import { API_BASE_URL } from './config.ts';
import './styles/App.css';

const App: React.FC = () => {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth_status`, {
          credentials: 'include'
        });
        const data = await response.json();
        setAuthenticated(data.authenticated);
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        credentials: 'include'
      });
      const data = await response.json();
      window.location.href = data.auth_url;
    } catch (error) {
      console.error('Login error:', error);
    }
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
    typography: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
    },
  });

  const authContextValue: AuthContextType = {
    authenticated,
    login
  };

  return (
    <Provider store={store}>
      <AuthContext.Provider value={authContextValue}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <Box className="App" sx={{ position: 'relative', minHeight: '100vh' }}>
              {loading && (
                <Box
                  sx={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'rgba(18, 18, 18, 0.85)',
                    zIndex: 1200,
                  }}
                >
                  <Loading 
                    isLoading={loading} 
                    message="Connecting to Spotify..." 
                  />
                </Box>
              )}
              <Routes>
                <Route path="/" element={<Home />} />
                <Route
                  path="/catalog-duration"
                  element={authenticated ? <DurationPage /> : <Navigate to="/" />}
                />
                <Route
                  path="/vibe-search"
                  element={authenticated ? <VibeSearchPage /> : <Navigate to="/" />}
                />
              </Routes>
            </Box>
          </Router>
        </ThemeProvider>
      </AuthContext.Provider>
    </Provider>
  );
};

export default App; 
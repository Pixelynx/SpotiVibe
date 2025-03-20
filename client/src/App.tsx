import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, CircularProgress, Box, ThemeProvider, createTheme } from '@mui/material';
import Home from './pages/Home.tsx';
import DurationPage from './pages/DurationPage.tsx';
import VibeSearchPage from './pages/VibeSearchPage.tsx';
import SearchResults from './components/VibeSearch/SearchResults.tsx';
import Loading from './components/common/Loading.tsx';
import AuthContext, { AuthContextType } from './contexts/AuthContext.tsx';

const App: React.FC = () => {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth_status');
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
      const response = await fetch('/api/login');
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

  if (loading) {
    return (
      <ThemeProvider theme={theme}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            bgcolor: '#121212',
          }}
        >
          <CircularProgress color="primary" size={60} />
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Box className="App">
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
              <Route
                path="/search-results"
                element={authenticated ? <SearchResults results={null} currentPage={1} onPageChange={() => {}} /> : <Navigate to="/" />}
              />
              <Route path="/loading" element={<Loading />} />
            </Routes>
          </Box>
        </Router>
      </ThemeProvider>
    </AuthContext.Provider>
  );
};

export default App; 
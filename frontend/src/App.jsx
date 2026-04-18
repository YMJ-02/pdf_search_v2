import React, { useState, useCallback } from 'react';
import { Container, Typography, Box, Grid, Paper, Snackbar, Alert } from '@mui/material';
import FileUpload from './components/FileUpload';
import SearchBar from './components/SearchBar';
import Results from './components/Results';
import Status from './components/Status';
import ConfirmationDialog from './components/ConfirmationDialog';
import axios from 'axios';

// Electron 로컈 앱: 항상 127.0.0.1 (network server 불필요)
const API_URL = 'http://127.0.0.1:5001';

function App() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusKey, setStatusKey] = useState(0);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSearch = async (query) => {
    if (!query) {
      setNotification({ open: true, message: '\uac80\uc0c9\uc5b4\ub97c \uc785\ub825\ud558\uc138\uc694.', severity: 'warning' });
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/search`, { params: { q: query } });
      setResults(response.data);
      if (response.data.length === 0) {
        setNotification({ open: true, message: '\uac80\uc0c9 \uacb0\uacfc\uac00 \uc5c6\uc2b5\ub2c8\ub2e4.', severity: 'info' });
      }
    } catch (error) {
      console.error('Search failed:', error);
      setNotification({ open: true, message: '\uac80\uc0c9\uc5d0 \uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = useCallback(() => {
    setStatusKey(prevKey => prevKey + 1);
    setNotification({ open: true, message: '\ud30c\uc77c\uc774 \uc131\uacf5\uc801\uc73c\ub85c \uc5c5\ub85c\ub4dc \ubc0f \uccb4\ub9ac\ub418\uc5c8\uc2b5\ub2c8\ub2e4.', severity: 'success' });
  }, []);

  const handleResetConfirm = async () => {
    setDialogOpen(false);
    try {
      await axios.get(`${API_URL}/api/reset-all`);
      setResults([]);
      setStatusKey(prevKey => prevKey + 1);
      setNotification({ open: true, message: '\ubaa8\ub4e0 \ub370\uc774\ud130\uac00 \ucd08\uae30\ud654\ub418\uc5c8\uc2b5\ub2c8\ub2e4.', severity: 'success' });
    } catch (error) {
      console.error('Reset failed:', error);
      setNotification({ open: true, message: '\ucd08\uae30\ud654\uc5d0 \uc2e4\ud328\ud588\uc2b5\ub2c8\ub2e4.', severity: 'error' });
    }
  };

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') return;
    setNotification({ ...notification, open: false });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold', mb: 3 }}>
          \uace0\uae09 PDF \ubb38\uc11c \uac80\uc0c9 \uc2dc\uc2a4\ud15c
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <FileUpload onUploadSuccess={handleUploadSuccess} setNotification={setNotification} />
            <Status statusKey={statusKey} onResetClick={() => setDialogOpen(true)} />
          </Grid>
          <Grid item xs={12} md={6}>
            <SearchBar onSearch={handleSearch} loading={loading} />
            <Results results={results} loading={loading} />
          </Grid>
        </Grid>
      </Paper>
      <Snackbar open={notification.open} autoHideDuration={6000} onClose={handleCloseNotification}>
        <Alert onClose={handleCloseNotification} severity={notification.severity} sx={{ width: '100%' }}>
          {notification.message}
        </Alert>
      </Snackbar>
      <ConfirmationDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onConfirm={handleResetConfirm}
        title="\ub370\uc774\ud130 \ucd08\uae30\ud654 \ud655\uc778"
        description="\uc815\ub9d0\ub85c \ubaa8\ub4e0 \ub370\uc774\ud130\ub97c \ucd08\uae30\ud654\ud558\uc2dc\uaca0\uc2b5\ub2c8\uae4c? \uc5c5\ub85c\ub4dc\ub41c \ud30c\uc77c, \uccb4\ub9ac\ub41c \ud14d\uc2a4\ud2b8, \ud559\uc2b5\ub41c \ubaa8\ub378\uc774 \ubaa8\ub450 \uc601\uad6c\uc801\uc73c\ub85c \uc0ad\uc81c\ub429\ub2c8\ub2e4."
      />
    </Container>
  );
}

export default App;

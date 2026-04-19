import React, { useState, useCallback } from 'react';
import { Container, Typography, Box, Grid, Paper, Snackbar, Alert, ToggleButton, ToggleButtonGroup } from '@mui/material';
import FileUpload from './components/FileUpload';
import SearchBar from './components/SearchBar';
import Results from './components/Results';
import Status from './components/Status';
import ConfirmationDialog from './components/ConfirmationDialog';
import { LangProvider, useLang } from './LangContext';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:5001';

function AppInner() {
  const { lang, setLang, t } = useLang();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusKey, setStatusKey] = useState(0);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSearch = async (query) => {
    if (!query) {
      setNotification({ open: true, message: t.noQuery, severity: 'warning' });
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/search`, { params: { q: query } });
      setResults(response.data);
      if (response.data.length === 0) {
        setNotification({ open: true, message: t.noResultsNotif, severity: 'info' });
      }
    } catch (error) {
      console.error('Search failed:', error);
      setNotification({ open: true, message: t.searchError, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = useCallback(() => {
    setStatusKey(prevKey => prevKey + 1);
    setNotification({ open: true, message: t.uploadSuccess, severity: 'success' });
  }, [t]);

  const handleResetConfirm = async () => {
    setDialogOpen(false);
    try {
      await axios.get(`${API_URL}/api/reset-all`);
      setResults([]);
      setStatusKey(prevKey => prevKey + 1);
      setNotification({ open: true, message: t.resetSuccess, severity: 'success' });
    } catch (error) {
      console.error('Reset failed:', error);
      setNotification({ open: true, message: t.resetError, severity: 'error' });
    }
  };

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') return;
    setNotification({ ...notification, open: false });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        {/* 헤더: 타이틀 + 언어 토글 */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold' }}>
            {t.appTitle}
          </Typography>
          <ToggleButtonGroup
            value={lang}
            exclusive
            onChange={(_, val) => { if (val) setLang(val); }}
            size="small"
            aria-label="language"
          >
            <ToggleButton value="ko" aria-label="Korean">한국어</ToggleButton>
            <ToggleButton value="en" aria-label="English">EN</ToggleButton>
          </ToggleButtonGroup>
        </Box>

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
      />
    </Container>
  );
}

function App() {
  return (
    <LangProvider>
      <AppInner />
    </LangProvider>
  );
}

export default App;

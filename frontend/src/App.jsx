import React, { useState, useCallback } from 'react';
import { Container, Typography, Box, Grid, Paper, Snackbar, Alert } from '@mui/material';
import FileUpload from './components/FileUpload';
import SearchBar from './components/SearchBar';
import Results from './components/Results';
import Status from './components/Status';
import ConfirmationDialog from './components/ConfirmationDialog';
import axios from 'axios';

// API URL을 동적으로 설정 (같은 네트워크 접근 지원)
const API_URL = `http://${window.location.hostname}:5001`;

function App() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusKey, setStatusKey] = useState(0); // To trigger re-fetch
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSearch = async (query) => {
    if (!query) {
      setNotification({ open: true, message: '검색어를 입력하세요.', severity: 'warning' });
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/search`, { params: { q: query } });
      setResults(response.data);
      if (response.data.length === 0) {
        setNotification({ open: true, message: '검색 결과가 없습니다.', severity: 'info' });
      }
    } catch (error) {
      console.error('Search failed:', error);
      setNotification({ open: true, message: '검색에 실패했습니다.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = useCallback(() => {
    setStatusKey(prevKey => prevKey + 1); // Trigger status component re-fetch
    setNotification({ open: true, message: '파일이 성공적으로 업로드 및 처리되었습니다.', severity: 'success' });
  }, []);

  const handleResetConfirm = async () => {
    setDialogOpen(false);
    try {
        // GET 기반 우회 리셋 엔드포인트 호출
        await axios.get(`${API_URL}/api/reset-all`);
        setResults([]);
        setStatusKey(prevKey => prevKey + 1);
        setNotification({ open: true, message: '모든 데이터가 초기화되었습니다.', severity: 'success' });
    } catch (error) {
        console.error('Reset failed:', error);
        setNotification({ open: true, message: '초기화에 실패했습니다.', severity: 'error' });
    }
  };

  const handleCloseNotification = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setNotification({ ...notification, open: false });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold', mb: 3 }}>
          고급 PDF 문서 검색 시스템
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
        title="데이터 초기화 확인"
        description="정말로 모든 데이터를 초기화하시겠습니까? 업로드된 파일, 처리된 텍스트, 학습된 모델이 모두 영구적으로 삭제됩니다."
      />
    </Container>
  );
}

export default App;

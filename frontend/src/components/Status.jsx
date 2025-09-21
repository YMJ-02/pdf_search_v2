import React, { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Paper, Chip, Button } from '@mui/material';
import { DeleteForever } from '@mui/icons-material';
import axios from 'axios';

// API URL을 동적으로 설정 (같은 네트워크 접근 지원)
const API_URL = `http://${window.location.hostname}:5001`;

function Status({ statusKey, onResetClick }) {
  const [status, setStatus] = useState({ processed_files: [], total_pages: 0 });

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/status`);
        setStatus(response.data);
      } catch (error) {
        console.error('Failed to fetch status:', error);
      }
    };
    fetchStatus();
  }, [statusKey]);

  return (
    <Box mt={4}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5" gutterBottom>처리된 문서 현황</Typography>
        <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteForever />}
            onClick={onResetClick}
        >
            전체 초기화
        </Button>
      </Box>
      <Paper elevation={2} sx={{ p: 2, mt: 1 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="body1">총 처리된 페이지 수:</Typography>
          <Chip label={status.total_pages} color="secondary" />
        </Box>
        <Typography variant="body1" sx={{ mt: 2 }}>처리된 파일 목록:</Typography>
        <List dense sx={{ maxHeight: '20vh', overflow: 'auto' }}>
          {status.processed_files.length > 0 ? (
            status.processed_files.map((file, index) => (
              <ListItem key={index}>
                <ListItemText primary={file} />
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText primary="처리된 파일이 없습니다." />
            </ListItem>
          )}
        </List>
      </Paper>
    </Box>
  );
}

export default Status;

import React, { useState, useEffect } from 'react';
import { Box, Typography, List, ListItem, ListItemText, Paper, Chip, Button } from '@mui/material';
import { DeleteForever } from '@mui/icons-material';
import axios from 'axios';

// Electron 로컈 앱: 항상 127.0.0.1 사용
const API_URL = 'http://127.0.0.1:5001';

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
        <Typography variant="h5" gutterBottom>\ucc98\ub9ac\ub41c \ubb38\uc11c \ud604\ud669</Typography>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteForever />}
          onClick={onResetClick}
        >
          \uc804\uccb4 \ucd08\uae30\ud654
        </Button>
      </Box>
      <Paper elevation={2} sx={{ p: 2, mt: 1 }}>
        <Box display="flex" alignItems="center" gap={2}>
          <Typography variant="body1">\uc5d8 \ucc98\ub9ac\ub41c \ud398\uc774\uc9c0 \uc218:</Typography>
          <Chip label={status.total_pages} color="secondary" />
        </Box>
        <Typography variant="body1" sx={{ mt: 2 }}>\ucc98\ub9ac\ub41c \ud30c\uc77c \ubaa9\ub85d:</Typography>
        <List dense sx={{ maxHeight: '20vh', overflow: 'auto' }}>
          {status.processed_files.length > 0 ? (
            status.processed_files.map((file, index) => (
              <ListItem key={index}>
                <ListItemText primary={file} />
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText primary="\ucc98\ub9ac\ub41c \ud30c\uc77c\uc774 \uc5c6\uc2b5\ub2c8\ub2e4." />
            </ListItem>
          )}
        </List>
      </Paper>
    </Box>
  );
}

export default Status;

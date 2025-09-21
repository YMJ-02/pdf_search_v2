import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, Paper, CircularProgress, Divider, Chip } from '@mui/material';

function Results({ results, loading }) {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  // Array.isArray로 results가 배열인지 먼저 확인
  if (!Array.isArray(results)) {
    return (
      <Box mt={4}>
        <Typography variant="h5" gutterBottom>검색 결과</Typography>
        <Paper elevation={2} sx={{ p: 2 }}>
          <Typography>검색 결과를 불러오는 중 오류가 발생했습니다.</Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box mt={4}>
      <Typography variant="h5" gutterBottom>검색 결과</Typography>
      <Paper elevation={2} sx={{ maxHeight: '50vh', overflow: 'auto' }}>
        <List>
          {results.length > 0 ? (
            results.map((result, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Typography variant="h6">
                        {result.page}
                      </Typography>
                    }
                    secondary={
                      <Box>
                        <Chip 
                          label={`유사도: ${result.similarity}`} 
                          color="primary" 
                          size="small" 
                          sx={{ mb: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {result.content_preview}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < results.length - 1 && <Divider />}
              </React.Fragment>
            ))
          ) : (
            <ListItem>
              <ListItemText primary="검색어를 입력하거나 다른 검색어로 시도해보세요." />
            </ListItem>
          )}
        </List>
      </Paper>
    </Box>
  );
}

export default Results;

import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, Paper, CircularProgress, Divider, Chip } from '@mui/material';
import { useLang } from '../LangContext';

function Results({ results, loading }) {
  const { t } = useLang();

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  if (!Array.isArray(results)) {
    return (
      <Box mt={4}>
        <Typography variant="h5" gutterBottom>{t.resultsTitle}</Typography>
        <Paper elevation={2} sx={{ p: 2 }}>
          <Typography>{t.resultsError}</Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box mt={4}>
      <Typography variant="h5" gutterBottom>{t.resultsTitle}</Typography>
      <Paper elevation={2} sx={{ maxHeight: '50vh', overflow: 'auto' }}>
        <List>
          {results.length > 0 ? (
            results.map((result, index) => (
              <React.Fragment key={index}>
                <ListItem>
                  <ListItemText
                    primary={<Typography variant="h6">{result.page}</Typography>}
                    secondary={
                      <Box>
                        <Chip label={t.similarity(result.similarity)} color="primary" size="small" sx={{ mb: 1 }} />
                        <Typography variant="body2" color="text.secondary">{result.content_preview}</Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < results.length - 1 && <Divider />}
              </React.Fragment>
            ))
          ) : (
            <ListItem>
              <ListItemText primary={t.noResults} />
            </ListItem>
          )}
        </List>
      </Paper>
    </Box>
  );
}

export default Results;

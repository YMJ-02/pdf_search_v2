import React, { useState } from 'react';
import { TextField, Button, Box, CircularProgress, Typography } from '@mui/material';
import { Search } from '@mui/icons-material';
import { useLang } from '../LangContext';

function SearchBar({ onSearch, loading }) {
  const { t } = useLang();
  const [query, setQuery] = useState('');

  const handleSearch = () => onSearch(query);

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSearch();
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>{t.searchTitle}</Typography>
      <Box display="flex" flexDirection="column" gap={2}>
        <TextField
          fullWidth
          variant="outlined"
          label={t.searchLabel}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={loading}
          multiline
          rows={8}
        />
        <Button
          variant="contained"
          onClick={handleSearch}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <Search />}
          sx={{ height: '56px' }}
        >
          {t.search}
        </Button>
      </Box>
    </Box>
  );
}

export default SearchBar;

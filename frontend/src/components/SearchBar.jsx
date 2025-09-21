import React, { useState } from 'react';
import { TextField, Button, Box, CircularProgress, Typography } from '@mui/material';
import { Search } from '@mui/icons-material';

function SearchBar({ onSearch, loading }) {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    onSearch(query);
  };

  const handleKeyPress = (event) => {
    // Allow Shift+Enter for new line, but trigger search on Enter alone
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault(); // Prevents adding a new line
      handleSearch();
    }
  };

  return (
    <Box>
        <Typography variant="h5" gutterBottom>문서 검색</Typography>
        <Box display="flex" flexDirection="column" gap={2}>
            <TextField
                fullWidth
                variant="outlined"
                label="검색할 지문 또는 키워드"
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
                검색
            </Button>
        </Box>
    </Box>
  );
}

export default SearchBar;

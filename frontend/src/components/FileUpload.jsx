import React, { useState } from 'react';
import { Button, Box, LinearProgress, Typography } from '@mui/material';
import { UploadFile } from '@mui/icons-material';
import axios from 'axios';

// Electron 로컈 앱: 항상 127.0.0.1 사용
const API_URL = 'http://127.0.0.1:5001';

function FileUpload({ onUploadSuccess, setNotification }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event) => {
    setFiles([...event.target.files]);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setNotification({ open: true, message: '\uc5c5\ub85c\ub4dc\ud560 \ud30c\uc77c\uc744 \uc120\ud0dd\ud558\uc138\uc694.', severity: 'warning' });
      return;
    }
    setUploading(true);

    let successCount = 0;
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        await axios.post(`${API_URL}/api/upload`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        successCount++;
      } catch (error) {
        console.error(`Upload failed for ${file.name}:`, error);
        setNotification({ open: true, message: `${file.name} \uc5c5\ub85c\ub4dc \uc2e4\ud328: ${error.response?.data?.error || error.message}`, severity: 'error' });
      }
    }

    setUploading(false);
    setFiles([]);

    if (successCount > 0) {
      onUploadSuccess();
    }
    if (successCount < files.length) {
      setNotification({ open: true, message: `${files.length - successCount}\uac1c \ud30c\uc77c \uc5c5\ub85c\ub4dc \uc2e4\ud328.`, severity: 'warning' });
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>PDF \uc5c5\ub85c\ub4dc (\ub2e4\uc911 \uc120\ud0dd \uac00\ub2a5)</Typography>
      <Box display="flex" alignItems="center" gap={2}>
        <Button variant="contained" component="label" disabled={uploading}>
          \ud30c\uc77c \uc120\ud0dd
          <input
            type="file"
            hidden
            multiple
            accept=".pdf"
            onChange={handleFileChange}
          />
        </Button>
        <Typography variant="body1" sx={{ flexGrow: 1 }}>
          {files.length > 0 ? `${files.length}\uac1c \ud30c\uc77c \uc120\ud0dd\ub428` : '\uc120\ud0dd\ub41c \ud30c\uc77c \uc5c6\uc74c'}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={files.length === 0 || uploading}
          startIcon={<UploadFile />}
        >
          \uc5c5\ub85c\ub4dc
        </Button>
      </Box>
      {uploading && <LinearProgress sx={{ mt: 2 }} />}
    </Box>
  );
}

export default FileUpload;

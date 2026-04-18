import React, { useState } from 'react';
import { Button, Box, LinearProgress, Typography } from '@mui/material';
import { UploadFile } from '@mui/icons-material';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:5001';

function FileUpload({ onUploadSuccess, setNotification }) {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (event) => {
    setFiles([...event.target.files]);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setNotification({ open: true, message: '업로드할 파일을 선택하세요.', severity: 'warning' });
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
        setNotification({ open: true, message: `${file.name} 업로드 실패: ${error.response?.data?.error || error.message}`, severity: 'error' });
      }
    }

    setUploading(false);
    setFiles([]);

    if (successCount > 0) {
      onUploadSuccess();
    }
    if (successCount < files.length) {
      setNotification({ open: true, message: `${files.length - successCount}개 파일 업로드 실패.`, severity: 'warning' });
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>PDF 업로드 (다중 선택 가능)</Typography>
      <Box display="flex" alignItems="center" gap={2}>
        <Button variant="contained" component="label" disabled={uploading}>
          파일 선택
          <input
            type="file"
            hidden
            multiple
            accept=".pdf"
            onChange={handleFileChange}
          />
        </Button>
        <Typography variant="body1" sx={{ flexGrow: 1 }}>
          {files.length > 0 ? `${files.length}개 파일 선택됨` : '선택된 파일 없음'}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={files.length === 0 || uploading}
          startIcon={<UploadFile />}
        >
          업로드
        </Button>
      </Box>
      {uploading && <LinearProgress sx={{ mt: 2 }} />}
    </Box>
  );
}

export default FileUpload;

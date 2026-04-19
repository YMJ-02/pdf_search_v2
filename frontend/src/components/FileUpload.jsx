import React, { useState } from 'react';
import { Button, Box, LinearProgress, Typography, List, ListItem, ListItemText } from '@mui/material';
import { UploadFile, FolderOpen } from '@mui/icons-material';
import axios from 'axios';

const API_URL = 'http://127.0.0.1:5001';
const isElectron = typeof window !== 'undefined' && window.electronAPI?.isElectron;

function FileUpload({ onUploadSuccess, setNotification }) {
  const [files, setFiles] = useState([]); // { name, path? } 형태
  const [uploading, setUploading] = useState(false);

  // Electron: IPC 네이티브 다이얼로그 (파일 경로를 UTF-8로 직접 받음)
  const handleElectronSelect = async () => {
    const paths = await window.electronAPI.openFileDialog();
    if (paths.length === 0) return;
    const selected = paths.map(p => ({
      name: p.split(/[\\/]/).pop(),
      path: p,
    }));
    setFiles(selected);
  };

  // 브라우저 fallback
  const handleBrowserChange = (event) => {
    const selected = [...event.target.files].map(f => ({ name: f.name, file: f }));
    setFiles(selected);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setNotification({ open: true, message: '업로드할 파일을 선택하세요.', severity: 'warning' });
      return;
    }
    setUploading(true);
    let successCount = 0;

    for (const f of files) {
      try {
        if (isElectron && f.path) {
          // Electron: 파일 경로를 JSON으로 전달 → 인코딩 문제 없음
          await axios.post(`${API_URL}/api/upload-path`, { file_path: f.path }, {
            headers: { 'Content-Type': 'application/json' },
          });
        } else {
          // 브라우저: 기존 multipart 방식
          const formData = new FormData();
          formData.append('file', f.file);
          await axios.post(`${API_URL}/api/upload`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });
        }
        successCount++;
      } catch (error) {
        console.error(`Upload failed for ${f.name}:`, error);
        setNotification({
          open: true,
          message: `${f.name} 업로드 실패: ${error.response?.data?.error || error.message}`,
          severity: 'error',
        });
      }
    }

    setUploading(false);
    setFiles([]);
    if (successCount > 0) onUploadSuccess();
    if (successCount < files.length) {
      setNotification({ open: true, message: `${files.length - successCount}개 파일 업로드 실패.`, severity: 'warning' });
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>PDF 업로드 (다중 선택 가능)</Typography>
      <Box display="flex" alignItems="center" gap={2}>
        {isElectron ? (
          <Button variant="contained" component="label" disabled={uploading} startIcon={<FolderOpen />} onClick={handleElectronSelect}>
            파일 선택
          </Button>
        ) : (
          <Button variant="contained" component="label" disabled={uploading}>
            파일 선택
            <input type="file" hidden multiple accept=".pdf" onChange={handleBrowserChange} />
          </Button>
        )}
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
      {files.length > 0 && (
        <List dense sx={{ mt: 1 }}>
          {files.map((f, i) => (
            <ListItem key={i} disableGutters>
              <ListItemText primary={f.name} primaryTypographyProps={{ variant: 'body2', noWrap: true }} />
            </ListItem>
          ))}
        </List>
      )}
      {uploading && <LinearProgress sx={{ mt: 2 }} />}
    </Box>
  );
}

export default FileUpload;

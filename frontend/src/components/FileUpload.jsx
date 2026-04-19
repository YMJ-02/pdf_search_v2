import React, { useState } from 'react';
import { Button, Box, LinearProgress, Typography, List, ListItem, ListItemText } from '@mui/material';
import { UploadFile, FolderOpen } from '@mui/icons-material';
import axios from 'axios';
import { useLang } from '../LangContext';

const API_URL = 'http://127.0.0.1:5001';
const isElectron = typeof window !== 'undefined' && window.electronAPI?.isElectron;

function FileUpload({ onUploadSuccess, setNotification }) {
  const { t } = useLang();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleElectronSelect = async () => {
    const paths = await window.electronAPI.openFileDialog();
    if (paths.length === 0) return;
    const selected = paths.map(p => ({ name: p.split(/[\\/]/).pop(), path: p }));
    setFiles(selected);
  };

  const handleBrowserChange = (event) => {
    const selected = [...event.target.files].map(f => ({ name: f.name, file: f }));
    setFiles(selected);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      setNotification({ open: true, message: t.noUploadFile, severity: 'warning' });
      return;
    }
    setUploading(true);
    let successCount = 0;

    for (const f of files) {
      try {
        if (isElectron && f.path) {
          await axios.post(`${API_URL}/api/upload-path`, { file_path: f.path }, {
            headers: { 'Content-Type': 'application/json' },
          });
        } else {
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
          message: t.uploadFail(f.name, error.response?.data?.error || error.message),
          severity: 'error',
        });
      }
    }

    setUploading(false);
    setFiles([]);
    if (successCount > 0) onUploadSuccess();
    if (successCount < files.length) {
      setNotification({ open: true, message: t.uploadPartial(files.length - successCount), severity: 'warning' });
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>{t.uploadTitle}</Typography>
      <Box display="flex" alignItems="center" gap={2}>
        {isElectron ? (
          <Button variant="contained" disabled={uploading} startIcon={<FolderOpen />} onClick={handleElectronSelect}>
            {t.selectFile}
          </Button>
        ) : (
          <Button variant="contained" component="label" disabled={uploading}>
            {t.selectFile}
            <input type="file" hidden multiple accept=".pdf" onChange={handleBrowserChange} />
          </Button>
        )}
        <Typography variant="body1" sx={{ flexGrow: 1 }}>
          {files.length > 0 ? t.filesSelected(files.length) : t.noFile}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={files.length === 0 || uploading}
          startIcon={<UploadFile />}
        >
          {t.upload}
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

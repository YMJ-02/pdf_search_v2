import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { useLang } from '../LangContext';

function ConfirmationDialog({ open, onClose, onConfirm }) {
  const { t } = useLang();
  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
      <DialogTitle id="alert-dialog-title">{t.resetDialogTitle}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">{t.resetDialogDesc}</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t.cancel}</Button>
        <Button onClick={onConfirm} color="error" autoFocus>{t.confirm}</Button>
      </DialogActions>
    </Dialog>
  );
}

export default ConfirmationDialog;

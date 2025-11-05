import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useSeatingTranslation } from '../../hooks/useSeatingTranslation';
import { slugToTitle } from '../../utils/slug';

export default function ConfirmDeleteDialog({ open, name, onCancel, onConfirm, disabled }) {
  const { t } = useSeatingTranslation();
  const display = slugToTitle(name);
  return (
    <Dialog open={open} onClose={disabled ? undefined : onCancel} aria-labelledby="confirm-delete-title">
      <DialogTitle id="confirm-delete-title">{t('deleteWeddingTitle')}</DialogTitle>
      <DialogContent>
        <Typography variant="body1">{t('deleteWeddingConfirm', { name: display || name })}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={disabled}>{t('cancel')}</Button>
        <Button color="error" onClick={onConfirm} disabled={disabled}>{t('delete')}</Button>
      </DialogActions>
    </Dialog>
  );
}

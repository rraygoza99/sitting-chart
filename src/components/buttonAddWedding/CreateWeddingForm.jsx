import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useSeatingTranslation } from '../../hooks/useSeatingTranslation';

export default function CreateWeddingForm({ onCreate, disabled, onError }) {
  const { t } = useSeatingTranslation();
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (disabled || submitting) return;
    try {
      setSubmitting(true);
      await onCreate(name);
      setName('');
    } catch (err) {
      if (onError) {
        onError(err);
      } else {
        alert(err?.message || 'Failed to save wedding. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div style={{ margin: '1rem 2rem' }}>
        <Typography variant="h6" sx={{ mb: 0.5 }}>
          {t('createNewWeddingTitle')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('createNewWeddingDesc')}
        </Typography>
      </div>
      <div className="inputWrapper">
        <TextField
          id="wedding-name"
          variant="standard"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('enterWeddingNamePlaceholder')}
          disabled={disabled || submitting}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleSubmit();
            }
          }}
        />
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={disabled || submitting}
        >
          {submitting ? t('saving') : t('add')}
        </Button>
      </div>
    </>
  );
}

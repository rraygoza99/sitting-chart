import React, { useState } from 'react';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { useSeatingTranslation } from '../../hooks/useSeatingTranslation';

export default function CreateWeddingForm({ onCreate, disabled, onError }) {
  const { t } = useSeatingTranslation();
  const [partner1Name, setPartner1Name] = useState('');
  const [partner2Name, setPartner2Name] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [venue, setVenue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isValid = partner1Name.trim() && partner2Name.trim() && weddingDate;

  const handleSubmit = async () => {
    if (disabled || submitting || !isValid) return;
    try {
      setSubmitting(true);
      await onCreate({ partner1Name: partner1Name.trim(), partner2Name: partner2Name.trim(), weddingDate, venue: venue.trim() });
      setPartner1Name('');
      setPartner2Name('');
      setWeddingDate('');
      setVenue('');
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSubmit();
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
      <div className="inputWrapper" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'flex-end', margin: '0 2rem 1rem' }}>
        <TextField
          variant="standard"
          label={t('partner1Name')}
          value={partner1Name}
          onChange={(e) => setPartner1Name(e.target.value)}
          placeholder={t('partner1NamePlaceholder')}
          disabled={disabled || submitting}
          onKeyDown={handleKeyDown}
          required
        />
        <TextField
          variant="standard"
          label={t('partner2Name')}
          value={partner2Name}
          onChange={(e) => setPartner2Name(e.target.value)}
          placeholder={t('partner2NamePlaceholder')}
          disabled={disabled || submitting}
          onKeyDown={handleKeyDown}
          required
        />
        <TextField
          variant="standard"
          label={t('weddingDate')}
          type="date"
          value={weddingDate}
          onChange={(e) => setWeddingDate(e.target.value)}
          disabled={disabled || submitting}
          InputLabelProps={{ shrink: true }}
          required
        />
        <TextField
          variant="standard"
          label={t('venue')}
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
          placeholder={t('venuePlaceholder')}
          disabled={disabled || submitting}
          onKeyDown={handleKeyDown}
        />
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={disabled || submitting || !isValid}
        >
          {submitting ? t('saving') : t('add')}
        </Button>
      </div>
    </>
  );
}

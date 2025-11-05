import React from 'react';
import Button from '@mui/material/Button';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { useSeatingTranslation } from '../../hooks/useSeatingTranslation';
import { slugToTitle } from '../../utils/slug';

export default function WeddingListItem({ name, onOpen, onDelete, disabled, isDeleting }) {
  const { t } = useSeatingTranslation();
  const display = slugToTitle(name);
  return (
    <ListItem className="listItem">
      <ListItemText primary={display || name} className='listItemText' />
      <div className="buttonGroup">
        <Button onClick={onOpen} disabled={disabled}>{t('open')}</Button>
        <Button onClick={onDelete} disabled={disabled}>
          {isDeleting ? t('deleting') : t('delete')}
        </Button>
      </div>
    </ListItem>
  );
}

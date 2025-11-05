import React from 'react';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import WeddingListItem from './WeddingListItem';
import { useSeatingTranslation } from '../../hooks/useSeatingTranslation';

export default function WeddingList({ items, onOpen, onDelete, disabled, deletingName }) {
  const { t } = useSeatingTranslation();
  const isEmpty = !items || items.length === 0;

  return (
    <>
      <div style={{ margin: '1rem 2rem 0.5rem' }}>
        <Typography variant="h6">{t('availableWeddings')}</Typography>
      </div>

      {isEmpty ? (
        <div style={{ textAlign: 'center', margin: '2rem', color: '#666' }}>{t('noWeddingsYet')}</div>
      ) : (
        <List className='list'>
          {items.map((item, idx) => (
            <WeddingListItem
              key={item || idx}
              name={item}
              disabled={disabled}
              isDeleting={deletingName === item}
              onOpen={() => onOpen(item)}
              onDelete={() => onDelete(item)}
            />
          ))}
        </List>
      )}
    </>
  );
}

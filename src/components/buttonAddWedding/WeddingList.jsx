import React, { useState, useMemo } from 'react';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import WeddingListItem from './WeddingListItem';
import { useSeatingTranslation } from '../../hooks/useSeatingTranslation';
import { extractDateFromSlug } from '../../utils/slug';

export default function WeddingList({ items, onOpen, onDelete, disabled, deletingName }) {
  const { t } = useSeatingTranslation();
  const isEmpty = !items || items.length === 0;
  const [sortField, setSortField] = useState('date');   // 'date' | 'name'
  const [sortOrder, setSortOrder] = useState('asc');    // 'asc' | 'desc'

  const handleSortField = (_, value) => {
    if (value) setSortField(value);
  };

  const toggleOrder = () => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');

  const sortedItems = useMemo(() => {
    if (!items) return [];
    return [...items].sort((a, b) => {
      let cmp;
      if (sortField === 'date') {
        const dateA = extractDateFromSlug(a) || '';
        const dateB = extractDateFromSlug(b) || '';
        cmp = dateA.localeCompare(dateB);
      } else {
        cmp = a.localeCompare(b);
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });
  }, [items, sortField, sortOrder]);

  return (
    <>
      <div style={{ margin: '1rem 2rem 0.5rem', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <Typography variant="h6">{t('availableWeddings')}</Typography>
        {!isEmpty && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
            <ToggleButtonGroup
              value={sortField}
              exclusive
              onChange={handleSortField}
              size="small"
              aria-label={t('sortBy')}
            >
              <ToggleButton value="date" aria-label={t('sortByDate')}>{t('sortByDate')}</ToggleButton>
              <ToggleButton value="name" aria-label={t('sortByName')}>{t('sortByName')}</ToggleButton>
            </ToggleButtonGroup>
            <ToggleButton
              value={sortOrder}
              selected
              onChange={toggleOrder}
              size="small"
              aria-label={t('toggleSortOrder')}
              sx={{ minWidth: 36 }}
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </ToggleButton>
          </div>
        )}
      </div>

      {isEmpty ? (
        <div style={{ textAlign: 'center', margin: '2rem', color: '#666' }}>{t('noWeddingsYet')}</div>
      ) : (
        <List className='list'>
          {sortedItems.map((item, idx) => (
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

import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Modal,
  Typography,
  TextField,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Collapse from '@mui/material/Collapse';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import PlusOneIcon from '@mui/icons-material/PlusOne';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import LabelIcon from '@mui/icons-material/Label';
import { useSeatingTranslation } from '../hooks/useSeatingTranslation';

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 1000,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 3,
  maxHeight: '85vh',
  overflow: 'auto',
};

function GuestManagerModal({
  open,
  onClose,
  currentLanguage = 'english',
  allGuests = [],
  onAddPlusOne,
  onRenameGuest,
  onDeleteGuest,
  onAddGuest,
  groups = [],
  onChangeGroup,
}) {
  const { t } = useSeatingTranslation(currentLanguage);
  const [groupByGroup, setGroupByGroup] = useState(true);
  const [newFirstName, setNewFirstName] = useState('');
  const [newLastName, setNewLastName] = useState('');
  const [newGroup, setNewGroup] = useState('');
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [groupDialogGuestId, setGroupDialogGuestId] = useState(null);
  const [groupDialogValue, setGroupDialogValue] = useState('');
  const [rowOpen, setRowOpen] = useState({}); // id -> boolean

  // Build primary guests with ticket counts
  const primaryRows = useMemo(() => {
    const byId = new Map();
    allGuests.forEach(g => byId.set(g.id, g));

    const map = new Map();
    allGuests.forEach(g => {
      const originalId = g.originalGuestId || g.id;
      const original = byId.get(originalId) || g;
      if (!map.has(originalId)) {
        map.set(originalId, {
          id: originalId,
          firstName: original.firstName || '',
          lastName: original.lastName || '',
          group: original.group || 'Ungrouped',
          tickets: 0,
        });
      }
      const row = map.get(originalId);
      row.tickets += 1;
    });

    return Array.from(map.values()).sort((a, b) => (
      (a.lastName || '').localeCompare(b.lastName || '') || (a.firstName || '').localeCompare(b.firstName || '')
    ));
  }, [allGuests]);

  const grouped = useMemo(() => {
    const result = new Map();
    primaryRows.forEach(row => {
      const g = row.group || 'Ungrouped';
      if (!result.has(g)) result.set(g, []);
      result.get(g).push(row);
    });
    const sorted = Array.from(result.entries()).sort(([a], [b]) => a.localeCompare(b));
    sorted.forEach(([, rows]) => rows.sort((r1, r2) => (
      (r1.lastName || '').localeCompare(r2.lastName || '') || (r1.firstName || '').localeCompare(r2.firstName || '')
    )));
    return new Map(sorted);
  }, [primaryRows]);

  const handleAddGuest = () => {
    if (!newFirstName.trim() || !newLastName.trim()) return;
    onAddGuest && onAddGuest({ firstName: newFirstName.trim(), lastName: newLastName.trim(), group: newGroup.trim() });
    setNewFirstName('');
    setNewLastName('');
    setNewGroup('');
  };

  return (
    <Modal open={open} onClose={onClose} aria-labelledby="guest-manager-modal-title">
      <Box sx={modalStyle}>
        <Typography id="guest-manager-modal-title" variant="h6" sx={{ mb: 2 }}>
          {t('guestManager') || 'Guest Manager'}
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
          <FormControlLabel
            control={<Switch checked={groupByGroup} onChange={(e) => setGroupByGroup(e.target.checked)} />}
            label={t('groupByGroup') || 'Group by group'}
          />
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
          <TextField size="small" label={t('firstName')} value={newFirstName} onChange={(e) => setNewFirstName(e.target.value)} />
          <TextField size="small" label={t('lastName')} value={newLastName} onChange={(e) => setNewLastName(e.target.value)} />
          <Autocomplete
            freeSolo
            options={(Array.isArray(groups) ? groups : [])}
            value={newGroup}
            onChange={(e, val) => setNewGroup(typeof val === 'string' ? val : (val || ''))}
            onInputChange={(e, val) => setNewGroup(val || '')}
            sx={{ minWidth: 220 }}
            renderInput={(params) => (
              <TextField {...params} size="small" label={t('group')} />
            )}
          />
          <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddGuest}>
            {t('addGuest')}
          </Button>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {!groupByGroup && (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell />
                  <TableCell>{t('lastName')}</TableCell>
                  <TableCell>{t('firstName')}</TableCell>
                  <TableCell>{t('group')}</TableCell>
                  <TableCell align="right">{t('tickets')}</TableCell>
                  <TableCell align="right">{t('actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {primaryRows.map(row => (
                  <PrimaryRow
                    key={row.id}
                    row={row}
                    allGuests={allGuests}
                    open={!!rowOpen[row.id]}
                    setOpen={(v) => setRowOpen(prev => ({ ...prev, [row.id]: v }))}
                    t={t}
                    onAddPlusOne={onAddPlusOne}
                    onDeleteGuest={onDeleteGuest}
                    onRenameGuest={onRenameGuest}
                    onChangeGroup={() => {
                      setGroupDialogGuestId(row.id);
                      setGroupDialogValue(row.group || '');
                      setGroupDialogOpen(true);
                    }}
                  />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {groupByGroup && (
          Array.from(grouped.entries()).map(([groupName, rows]) => (
            <Box key={groupName} sx={{ mb: 2 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>{groupName} — {rows.length}</Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell />
                      <TableCell>{t('lastName')}</TableCell>
                      <TableCell>{t('firstName')}</TableCell>
                      <TableCell>{t('group')}</TableCell>
                      <TableCell align="right">{t('tickets')}</TableCell>
                      <TableCell align="right">{t('actions')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {rows.map(row => (
                      <PrimaryRow
                        key={row.id}
                        row={row}
                        allGuests={allGuests}
                        open={!!rowOpen[row.id]}
                        setOpen={(v) => setRowOpen(prev => ({ ...prev, [row.id]: v }))}
                        t={t}
                        onAddPlusOne={onAddPlusOne}
                        onDeleteGuest={onDeleteGuest}
                        onRenameGuest={onRenameGuest}
                        onChangeGroup={() => {
                          setGroupDialogGuestId(row.id);
                          setGroupDialogValue(row.group || '');
                          setGroupDialogOpen(true);
                        }}
                      />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ))
        )}

        {/* Change Group Dialog */}
        <Modal open={groupDialogOpen} onClose={() => setGroupDialogOpen(false)} aria-labelledby="change-group-modal-title">
          <Box sx={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            width: 400, bgcolor: 'background.paper', border: '2px solid #000', boxShadow: 24, p: 3
          }}>
            <Typography id="change-group-modal-title" variant="h6" sx={{ mb: 2 }}>
              {t('changeGroup')}
            </Typography>
            <Autocomplete
              freeSolo
              options={(Array.isArray(groups) ? groups : [])}
              value={groupDialogValue}
              onChange={(e, val) => setGroupDialogValue(typeof val === 'string' ? val : (val || ''))}
              onInputChange={(e, val) => setGroupDialogValue(val || '')}
              renderInput={(params) => (
                <TextField {...params} label={t('group')} />
              )}
              sx={{ mb: 2 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button variant="outlined" onClick={() => setGroupDialogOpen(false)}>{t('cancel')}</Button>
              <Button variant="contained" onClick={() => {
                if (onChangeGroup && groupDialogGuestId) {
                  onChangeGroup(groupDialogGuestId, (groupDialogValue || '').trim());
                }
                setGroupDialogOpen(false);
              }}>{t('save')}</Button>
            </Box>
          </Box>
        </Modal>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button variant="outlined" onClick={onClose}>{t('close')}</Button>
        </Box>
      </Box>
    </Modal>
  );
}

export default GuestManagerModal;

// Row component for primary guest with collapsible +1 list
function PrimaryRow({ row, allGuests, open, setOpen, t, onAddPlusOne, onDeleteGuest, onRenameGuest, onChangeGroup }) {
  const [editFirst, setEditFirst] = useState(row.firstName || '');
  const [editLast, setEditLast] = useState(row.lastName || '');

  const plusOnes = useMemo(
    () => allGuests.filter(g => g.originalGuestId === row.id && g.id !== row.id),
    [allGuests, row.id]
  );

  const commitPrimaryRename = () => {
    if (onRenameGuest) onRenameGuest(row.id, editFirst.trim(), editLast.trim());
  };

  return (
    <>
      <TableRow>
        <TableCell width={48}>
          <IconButton size="small" onClick={() => setOpen(!open)} aria-label="expand row">
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ minWidth: 160 }}>
          <TextField size="small" value={editLast} onChange={(e) => setEditLast(e.target.value)} onBlur={commitPrimaryRename} />
        </TableCell>
        <TableCell sx={{ minWidth: 160 }}>
          <TextField size="small" value={editFirst} onChange={(e) => setEditFirst(e.target.value)} onBlur={commitPrimaryRename} />
        </TableCell>
        <TableCell sx={{ minWidth: 140 }}>{row.group || 'Ungrouped'}</TableCell>
        <TableCell align="right">{row.tickets}</TableCell>
        <TableCell align="right">
          <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
            <IconButton size="small" color="secondary" onClick={onChangeGroup} title={t('changeGroup')}>
              <LabelIcon />
            </IconButton>
            <IconButton size="small" color="primary" onClick={() => onAddPlusOne && onAddPlusOne(row.id)} title={t('addPlusOne') || '+1'}>
              <PlusOneIcon />
            </IconButton>
            <IconButton size="small" color="error" onClick={() => onDeleteGuest && onDeleteGuest(row.id)} title={t('delete')}>
              <DeleteIcon />
            </IconButton>
          </Box>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>{t('guests')} +1</Typography>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>{t('lastName')}</TableCell>
                    <TableCell>{t('firstName')}</TableCell>
                    <TableCell>{t('group')}</TableCell>
                    <TableCell align="right">{t('actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {plusOnes.map(po => (
                    <PlusOneRow key={po.id} guest={po} t={t} onRenameGuest={onRenameGuest} onDeleteGuest={onDeleteGuest} />
                  ))}
                  {plusOnes.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} sx={{ color: 'text.secondary' }}>
                        {t('noSearchResults') || 'No results'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );
}

function PlusOneRow({ guest, t, onRenameGuest, onDeleteGuest }) {
  const [first, setFirst] = useState(guest.firstName || '');
  const [last, setLast] = useState(guest.lastName || '');

  const commit = () => {
    if (onRenameGuest) onRenameGuest(guest.id, first.trim(), last.trim());
  };

  return (
    <TableRow>
      <TableCell sx={{ minWidth: 160 }}>
        <TextField size="small" value={last} onChange={(e) => setLast(e.target.value)} onBlur={commit} />
      </TableCell>
      <TableCell sx={{ minWidth: 160 }}>
        <TextField size="small" value={first} onChange={(e) => setFirst(e.target.value)} onBlur={commit} />
      </TableCell>
      <TableCell sx={{ minWidth: 140 }}>{guest.group || 'Ungrouped'}</TableCell>
      <TableCell align="right">
        <IconButton size="small" color="error" onClick={() => onDeleteGuest && onDeleteGuest(guest.id)} title={t('delete')}>
          <DeleteIcon />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}

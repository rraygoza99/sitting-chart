import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SaveIcon from '@mui/icons-material/Save';
import HomeIcon from '@mui/icons-material/Home';
import UndoIcon from '@mui/icons-material/Undo';
import Popper from '@mui/material/Popper';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import './TopActionBar.css';
import { useSeatingTranslation } from '../hooks/useSeatingTranslation';

function TopActionBar({ 
    onSave, 
    isDisabled = false, 
    onExportAlphabetical,
    onExportGrouped,
    onExportTickets,
    onExportTicketsByGroup,
    onUndo,
    canUndo = false,
    hasUnsavedChanges = false, // Add prop to track unsaved changes
    currentLanguage = 'english', // Add currentLanguage prop
    totalSeatedGuests = 0
}) {
    const [exportMenuOpen, setExportMenuOpen] = useState(false);
    const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
    const exportAnchorRef = useRef(null);
    const navigate = useNavigate();
    
    // Use translation hook
    const { t } = useSeatingTranslation(currentLanguage);

    const handleHomeClick = () => {
        if (hasUnsavedChanges) {
            setConfirmDialogOpen(true);
        } else {
            navigate('/');
        }
    };

    const handleConfirmLeave = () => {
        setConfirmDialogOpen(false);
        navigate('/');
    };

    const handleCancelLeave = () => {
        setConfirmDialogOpen(false);
    };

    const handleExportMenuToggle = () => {
        setExportMenuOpen((prevOpen) => !prevOpen);
    };

    const handleExportMenuClose = (event) => {
        if (exportAnchorRef.current && exportAnchorRef.current.contains(event.target)) {
            return;
        }
        setExportMenuOpen(false);
    };

    const handleExportOption = (exportType) => {
        if (exportType === 'alphabetical') {
            onExportAlphabetical();
        } else if (exportType === 'grouped') {
            onExportGrouped();
        } else if (exportType === 'tickets') {
            onExportTickets();
        } else if (exportType === 'ticketsByGroup') {
            onExportTicketsByGroup();
        }
        setExportMenuOpen(false);
    };

    return (
        <div className="top-action-bar">
            <div className="top-action-bar-content">
                <div className="top-action-bar-left">
                    <IconButton
                        variant="contained"
                        color="primary"
                        onClick={handleHomeClick}
                        className="home-button"
                        size="medium"
                        title={t('goToHome')}
                        sx={{ 
                            backgroundColor: '#1976d2',
                            color: 'white',
                            '&:hover': {
                                backgroundColor: '#1565c0'
                            }
                        }}
                    >
                        <HomeIcon />
                    </IconButton>
                </div>
                
                <div className="top-action-bar-center">
                    {/* Center section is now empty */}
                </div>
                
                <div className="top-action-bar-right">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontWeight: 500, fontSize: 15, color: '#333', marginRight: 8 }}>
                            {t('totalSeatedGuests') || 'Total Seated Guests'}: {totalSeatedGuests}
                        </span>
                        <IconButton
                            variant="contained"
                            color="secondary"
                            onClick={onUndo}
                            disabled={!canUndo}
                            className="undo-button"
                            size="medium"
                            title={t('undoLastAction')}
                            sx={{ 
                                backgroundColor: canUndo ? '#582f5fff' : '#e0e0e0',
                                color: canUndo ? 'white' : '#9e9e9e',
                                '&:hover': {
                                    backgroundColor: canUndo ? '#7b1fa2' : '#e0e0e0'
                                },
                                '&:disabled': {
                                    backgroundColor: '#e0e0e0',
                                    color: '#9e9e9e'
                                }
                            }}
                        >
                            <UndoIcon />
                        </IconButton>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={onSave}
                            disabled={isDisabled || !hasUnsavedChanges}
                            className="save-button"
                            size="medium"
                            startIcon={<SaveIcon />}
                        >
                            {t('save')}
                        </Button>
                    </div>
                    <Button 
                        variant="contained" 
                        color="success"
                        ref={exportAnchorRef}
                        aria-label={t('ariaLabelPDFExport')}
                        aria-controls={exportMenuOpen ? 'export-split-button-menu' : undefined}
                        aria-expanded={exportMenuOpen ? 'true' : undefined}
                        aria-haspopup="menu"
                        size="medium"
                        onClick={handleExportMenuToggle}
                        className='export-button'
                        startIcon={<PictureAsPdfIcon />}
                        endIcon={<ArrowDropDownIcon />}
                        style={{ marginRight: '8px' }}
                    >
                        {t('export')}
                    </Button>
                    
                    <Popper
                        sx={{ zIndex: 1 }}
                        open={exportMenuOpen}
                        anchorEl={exportAnchorRef.current}
                        role={undefined}
                        transition
                        disablePortal
                    >
                        {({ TransitionProps, placement }) => (
                            <Grow
                                {...TransitionProps}
                                style={{
                                    transformOrigin:
                                        placement === 'bottom' ? 'center top' : 'center bottom',
                                }}
                            >
                                <Paper>
                                    <ClickAwayListener onClickAway={handleExportMenuClose}>
                                        <MenuList id="export-split-button-menu" autoFocusItem>
                                            <MenuItem onClick={() => handleExportOption('alphabetical')}>
                                                {t('alphabeticalList')}
                                            </MenuItem>
                                            <MenuItem onClick={() => handleExportOption('grouped')}>
                                                {t('groupedByTables')}
                                            </MenuItem>
                                            <MenuItem onClick={() => handleExportOption('tickets')}>
                                                {t('exportTickets')}
                                            </MenuItem>
                                            <MenuItem onClick={() => handleExportOption('ticketsByGroup')}>
                                                {t('exportTicketsByGroup')}
                                            </MenuItem>
                                        </MenuList>
                                    </ClickAwayListener>
                                </Paper>
                            </Grow>
                        )}
                    </Popper>
                </div>
            </div>
            
            {/* Confirmation Dialog */}
            <Dialog
                open={confirmDialogOpen}
                onClose={handleCancelLeave}
                aria-labelledby="unsaved-changes-dialog-title"
                aria-describedby="unsaved-changes-dialog-description"
            >
                <DialogTitle id="unsaved-changes-dialog-title">
                    {t('unsavedChangesTitle')}
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="unsaved-changes-dialog-description">
                        {t('unsavedChangesMessage')}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelLeave} color="primary">
                        {t('cancel')}
                    </Button>
                    <Button onClick={handleConfirmLeave} color="error" variant="contained">
                        {t('leaveWithoutSaving')}
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}

export default TopActionBar;

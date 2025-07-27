import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import SaveIcon from '@mui/icons-material/Save';
import HomeIcon from '@mui/icons-material/Home';
import Popper from '@mui/material/Popper';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import './TopActionBar.css';

function TopActionBar({ 
    onSave, 
    isDisabled = false, 
    onExportAlphabetical,
    onExportGrouped,
    onExportTickets
}) {
    const [exportMenuOpen, setExportMenuOpen] = useState(false);
    const exportAnchorRef = useRef(null);
    const navigate = useNavigate();

    const handleHomeClick = () => {
        navigate('/');
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
                        title="Go to Home"
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
                    <Button 
                        variant="contained" 
                        color="success"
                        ref={exportAnchorRef}
                        aria-label="PDF export options"
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
                        Export
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={onSave}
                        disabled={isDisabled}
                        className="save-button"
                        size="medium"
                        startIcon={<SaveIcon />}
                    >
                        Save
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
                                                Alphabetical List
                                            </MenuItem>
                                            <MenuItem onClick={() => handleExportOption('grouped')}>
                                                Grouped by Tables
                                            </MenuItem>
                                            <MenuItem onClick={() => handleExportOption('tickets')}>
                                                Export Tickets
                                            </MenuItem>
                                        </MenuList>
                                    </ClickAwayListener>
                                </Paper>
                            </Grow>
                        )}
                    </Popper>
                </div>
            </div>
        </div>
    );
}

export default TopActionBar;

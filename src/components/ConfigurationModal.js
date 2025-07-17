import React, { useState, useEffect } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';

const ConfigurationModal = ({ 
    onExportToJSON, 
    onDeleteArrangement, 
    weddingId 
}) => {
    const [open, setOpen] = useState(false);
    const [defaultTableSize, setDefaultTableSize] = useState(10);

    // Load saved configuration on component mount
    useEffect(() => {
        const savedConfig = localStorage.getItem('seatingConfiguration');
        if (savedConfig) {
            try {
                const config = JSON.parse(savedConfig);
                setDefaultTableSize(config.defaultTableSize || 10);
            } catch (error) {
                console.error('Error loading configuration:', error);
            }
        }
    }, []);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleSave = () => {
        // Save the configuration to localStorage
        const config = {
            defaultTableSize: defaultTableSize
        };
        localStorage.setItem('seatingConfiguration', JSON.stringify(config));
        console.log('Saving default table size:', defaultTableSize);
        setOpen(false);
    };

    const handleTableSizeChange = (event) => {
        const value = parseInt(event.target.value, 10);
        if (!isNaN(value) && value > 0) {
            setDefaultTableSize(value);
        }
    };

    const modalStyle = {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 600,
        bgcolor: 'background.paper',
        border: '2px solid #000',
        boxShadow: 24,
        p: 4,
        maxHeight: '80vh',
        overflowY: 'auto'
    };

    const configButtonStyle = {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        zIndex: 1000,
        backgroundColor: '#1976d2',
        color: 'white',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        '&:hover': {
            backgroundColor: '#1565c0',
            transform: 'scale(1.1)',
        },
        transition: 'all 0.2s ease'
    };

    return (
        <>
            {/* Fixed Configuration Button */}
            <IconButton
                onClick={handleOpen}
                sx={configButtonStyle}
                title="Configuration Settings"
            >
                <SettingsIcon fontSize="large" />
            </IconButton>

            {/* Configuration Modal */}
            <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="configuration-modal-title"
                aria-describedby="configuration-modal-description"
            >
                <Box sx={modalStyle}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography id="configuration-modal-title" variant="h5" component="h2">
                            Configuration Settings
                        </Typography>
                        <IconButton onClick={handleClose} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>
                    
                    <Typography variant="body1" sx={{ mb: 3 }}>
                        Configure your seating arrangement settings here.
                    </Typography>

                    {/* Table Size Configuration */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Table Settings
                        </Typography>
                        <TextField
                            fullWidth
                            label="Default Table Size"
                            type="number"
                            value={defaultTableSize}
                            onChange={handleTableSizeChange}
                            helperText="Number of seats per table (default: 10)"
                            inputProps={{
                                min: 1,
                                max: 20
                            }}
                            variant="outlined"
                        />
                    </Box>

                    {/* Arrangement Actions */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Arrangement Actions
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Button
                                variant="contained"
                                color="warning"
                                onClick={onExportToJSON}
                                size="medium"
                                sx={{ minWidth: '150px' }}
                            >
                                Export to JSON
                            </Button>
                            <Button
                                variant="contained"
                                color="error"
                                onClick={onDeleteArrangement}
                                size="medium"
                                sx={{ minWidth: '150px' }}
                            >
                                Delete Arrangement
                            </Button>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {weddingId ? `Current arrangement: ${weddingId}` : 'No arrangement selected'}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button
                            variant="outlined"
                            onClick={handleClose}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSave}
                        >
                            Save Settings
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </>
    );
};

export default ConfigurationModal;

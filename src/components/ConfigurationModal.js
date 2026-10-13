import React, { useState, useEffect } from 'react';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import CloseIcon from '@mui/icons-material/Close';
import SettingsIcon from '@mui/icons-material/Settings';
import CSVImporter from './CSVImporter';
import { useSeatingTranslation } from '../hooks/useSeatingTranslation';
import { S3_API_BASE } from '../config/api';
import { listWeddingBackups } from '../utils/backupService';
import { getWedding } from '../utils/weddingsService';
import { getPlannerBranding, savePlannerBranding } from '../utils/brandingService';

const ConfigurationModal = ({ 
    onExportToJSON, 
    onDeleteArrangement, 
    onCSVImport,
    onDownloadSampleCSV,
    onLanguageChange,
    onRestoreBackup,
    onBrandingChange,
    weddingId,
    existingGuests = [],
    existingTables = [],
    currentLanguage = 'english', // Add currentLanguage prop
    isOpen,
    onOpen,
    onClose
}) => {
    const [internalOpen, setInternalOpen] = useState(false);
    const [defaultTableSize, setDefaultTableSize] = useState(10);
    const [language, setLanguage] = useState('english'); // 'english' or 'spanish'
    const [backups, setBackups] = useState([]);
    const [loadingBackups, setLoadingBackups] = useState(false);
    
    // Planner Branding State
    const [companyName, setCompanyName] = useState('');
    const [tagline, setTagline] = useState('');
    const [logoDataUrl, setLogoDataUrl] = useState('');
    
    // Controlled or uncontrolled open state
    const open = isOpen !== undefined ? isOpen : internalOpen;
    
    // Use translation hook
    const { t } = useSeatingTranslation(currentLanguage);

    // Load backups when modal opens
    useEffect(() => {
        if (open && weddingId) {
            setLoadingBackups(true);
            listWeddingBackups(weddingId)
                .then(data => setBackups(data))
                .catch(err => console.error('Error fetching backups:', err))
                .finally(() => setLoadingBackups(false));
        }
    }, [open, weddingId]);

    // Load saved configuration and branding on component mount
    useEffect(() => {
        const savedConfig = localStorage.getItem('seatingConfiguration');
        if (savedConfig) {
            try {
                const config = JSON.parse(savedConfig);
                setDefaultTableSize(config.defaultTableSize || 10);
                setLanguage(config.language || 'english');
            } catch (error) {
                console.error('Error loading configuration:', error);
            }
        }

        const branding = getPlannerBranding();
        if (branding) {
            setCompanyName(branding.companyName || '');
            setTagline(branding.tagline || '');
            setLogoDataUrl(branding.logoDataUrl || '');
        }
    }, [open]);

    const handleOpen = () => {
        if (onOpen) onOpen();
        else setInternalOpen(true);
    };

    const handleClose = () => {
        if (onClose) onClose();
        else setInternalOpen(false);
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Ensure reasonable image size (max 1.5MB)
        if (file.size > 1.5 * 1024 * 1024) {
            alert('Image size exceeds 1.5MB. Please choose a smaller image.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (uploadEvent) => {
            setLogoDataUrl(uploadEvent.target.result);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveLogo = () => {
        setLogoDataUrl('');
    };

    const handleSave = () => {
        // Save the configuration to localStorage
        const config = {
            defaultTableSize: defaultTableSize,
            language: language
        };
        localStorage.setItem('seatingConfiguration', JSON.stringify(config));

        // Save branding to localStorage
        const newBranding = {
            companyName: companyName.trim(),
            tagline: tagline.trim(),
            logoDataUrl: logoDataUrl,
        };
        savePlannerBranding(newBranding);

        if (onBrandingChange) {
            onBrandingChange(newBranding);
        }
        
        // Notify parent component of language change
        if (onLanguageChange) {
            onLanguageChange(language);
        }
        
        handleClose();
    };

    // Share (add user) state and handler
    const [newEmail, setNewEmail] = useState('');
    const [shareLoading, setShareLoading] = useState(false);

    const handleShare = async () => {
        if (!weddingId) {
            alert('No file selected to share.');
            return;
        }
        const email = newEmail.trim();
        if (!email) {
            alert('Please enter a valid email address.');
            return;
        }

        setShareLoading(true);
        try {
            const fileName = `${weddingId}.json`;
            const shareUrl = `${S3_API_BASE}/share/${encodeURIComponent(fileName)}?newEmail=${encodeURIComponent(email)}`;
            const response = await fetch(shareUrl, { method: 'POST' });
            if (!response.ok) {
                const text = await response.text().catch(() => '');
                throw new Error(text || `HTTP ${response.status}`);
            }
            alert(`Successfully shared ${fileName} with ${email}`);
            setNewEmail('');
        } catch (err) {
            console.error('Error sharing file:', err);
            alert('Failed to share file. ' + (err.message || ''));
        } finally {
            setShareLoading(false);
        }
    };

    const handleTableSizeChange = (event) => {
        const value = parseInt(event.target.value, 10);
        if (!isNaN(value) && value > 0) {
            setDefaultTableSize(value);
        }
    };

    const handleLanguageChange = (event) => {
        setLanguage(event.target.checked ? 'spanish' : 'english');
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
                title={t('configurationSettings')}
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
                            {t('configurationSettingsTitle')}
                        </Typography>
                        <IconButton onClick={handleClose} size="small">
                            <CloseIcon />
                        </IconButton>
                    </Box>

                    {/* Add user / Share section */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Add user
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <TextField
                                placeholder="Email..."
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                size="small"
                                sx={{ flex: 1 }}
                            />
                            <Button
                                variant="contained"
                                onClick={handleShare}
                                disabled={shareLoading || !newEmail.trim() || !weddingId}
                            >
                                {shareLoading ? 'Sharing...' : 'Share'}
                            </Button>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Enter an email address to grant access to the current arrangement file.
                        </Typography>
                    </Box>
                    
                    <Typography variant="body1" sx={{ mb: 3 }}>
                        {t('configureSeatingSettings')}
                    </Typography>

                    {/* Planner Branding Settings */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 1 }}>
                            🎨 {t('plannerBranding') || 'Planner Branding'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            {t('plannerBrandingDesc') || 'Customize your logo, company name and tagline. This branding will appear on exported PDFs and your seating canvas.'}
                        </Typography>

                        <TextField
                            fullWidth
                            label={t('brandingCompanyName') || 'Company / Planner Name'}
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder={t('brandingCompanyNamePlaceholder') || 'e.g. Elegance Weddings & Events'}
                            variant="outlined"
                            sx={{ mb: 2 }}
                        />

                        <TextField
                            fullWidth
                            label={t('brandingTagline') || 'Tagline / Contact Phone / Website'}
                            value={tagline}
                            onChange={(e) => setTagline(e.target.value)}
                            placeholder={t('brandingTaglinePlaceholder') || 'e.g. www.eleganceweddings.mx | +52 55 1234 5678'}
                            variant="outlined"
                            sx={{ mb: 2 }}
                        />

                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, p: 2, bgcolor: '#fbfcfe', border: '1px dashed #bbb', borderRadius: 1.5 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                {t('brandingLogo') || 'Planner Logo'}
                            </Typography>
                            {logoDataUrl ? (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box
                                        component="img"
                                        src={logoDataUrl}
                                        alt="Planner Logo"
                                        sx={{
                                            maxHeight: 60,
                                            maxWidth: 160,
                                            objectFit: 'contain',
                                            bgcolor: '#fff',
                                            p: 0.5,
                                            border: '1px solid #ddd',
                                            borderRadius: 1,
                                        }}
                                    />
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        size="small"
                                        onClick={handleRemoveLogo}
                                    >
                                        {t('removeLogo') || 'Remove Logo'}
                                    </Button>
                                </Box>
                            ) : (
                                <Typography variant="caption" color="text.secondary">
                                    {t('noLogoSelected') || 'No logo uploaded yet.'}
                                </Typography>
                            )}

                            <div>
                                <Button
                                    variant="outlined"
                                    component="label"
                                    size="small"
                                    sx={{ textTransform: 'none' }}
                                >
                                    {logoDataUrl ? (t('changeLogo') || 'Change Logo') : (t('uploadLogo') || 'Upload Logo (PNG / JPG)')}
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/png, image/jpeg, image/webp"
                                        onChange={handleLogoUpload}
                                    />
                                </Button>
                            </div>
                        </Box>
                    </Box>

                    {/* Language Settings */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            {t('languageSettings')}
                        </Typography>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={language === 'spanish'}
                                    onChange={handleLanguageChange}
                                    color="primary"
                                />
                            }
                            label={
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Typography variant="body1">
                                        {language === 'english' ? '🇺🇸 English' : '🇪🇸 Español'}
                                    </Typography>
                                </Box>
                            }
                            labelPlacement="start"
                            sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                marginLeft: 0,
                                width: '100%'
                            }}
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {t('switchLanguage')}
                        </Typography>
                    </Box>

                    {/* Table Size Configuration */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            {t('tableSettings')}
                        </Typography>
                        <TextField
                            fullWidth
                            label={t('defaultTableSize')}
                            type="number"
                            value={defaultTableSize}
                            onChange={handleTableSizeChange}
                            helperText={t('numberSeatsPerTable')}
                            inputProps={{
                                min: 1,
                                max: 20
                            }}
                            variant="outlined"
                        />
                    </Box>

                    {/* CSV Import Actions */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            {t('csvImport')}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                            <CSVImporter 
                                onImport={onCSVImport} 
                                existingGuests={existingGuests}
                                existingTables={existingTables}
                            />
                            <Button
                                variant="outlined"
                                color="info"
                                onClick={onDownloadSampleCSV}
                                size="medium"
                                sx={{ minWidth: '150px' }}
                            >
                                📄 {t('downloadSampleCSV')}
                            </Button>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {t('csvFormatHelp')}
                        </Typography>
                    </Box>

                    {/* Backups Section */}
                    {weddingId && (
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" sx={{ mb: 1 }}>
                                🕒 {t('weddingBackups')}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {t('backupPolicyDesc')}
                            </Typography>
                            {loadingBackups ? (
                                <Typography variant="body2" color="text.secondary">
                                    {t('loading')}
                                </Typography>
                            ) : backups.length === 0 ? (
                                <Typography variant="body2" color="text.secondary">
                                    {t('noBackupsYet')}
                                </Typography>
                            ) : (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {backups.map((b) => (
                                        <Box
                                            key={b.backupKey}
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                p: 1.5,
                                                bgcolor: '#f5f7fa',
                                                borderRadius: 1,
                                                border: '1px solid #e0e0e0',
                                            }}
                                        >
                                            <div>
                                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                                    {b.dateStr}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {b.isoDate ? new Date(b.isoDate).toLocaleTimeString() : ''}
                                                </Typography>
                                            </div>
                                            <Button
                                                variant="outlined"
                                                size="small"
                                                color="primary"
                                                onClick={async () => {
                                                    if (onRestoreBackup) {
                                                        const backupData = await getWedding(b.backupKey);
                                                        if (backupData) {
                                                            onRestoreBackup(backupData);
                                                            handleClose();
                                                        }
                                                    }
                                                }}
                                            >
                                                {t('restoreBackup')}
                                            </Button>
                                        </Box>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    )}

                    {/* Arrangement Actions */}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            {t('arrangementActions')}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                            <Button
                                variant="contained"
                                color="warning"
                                onClick={onExportToJSON}
                                size="medium"
                                sx={{ minWidth: '150px' }}
                            >
                                {t('exportToJSON')}
                            </Button>
                            <Button
                                variant="contained"
                                color="error"
                                onClick={onDeleteArrangement}
                                size="medium"
                                sx={{ minWidth: '150px' }}
                            >
                                {t('delete')} {t('arrangement')}
                            </Button>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            {weddingId ? t('currentArrangement', { name: weddingId }) : t('noArrangementSelected')}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button
                            variant="outlined"
                            onClick={handleClose}
                        >
                            {t('cancel')}
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleSave}
                        >
                            {t('save')} {t('settings')}
                        </Button>
                    </Box>
                </Box>
            </Modal>
        </>
    );
};

export default ConfigurationModal;

import React, { useState } from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { useSeatingTranslation } from '../hooks/useSeatingTranslation';

const LanguageTest = () => {
    const [currentLanguage, setCurrentLanguage] = useState('english');
    const { t } = useSeatingTranslation(currentLanguage);

    const toggleLanguage = () => {
        setCurrentLanguage(prev => prev === 'english' ? 'spanish' : 'english');
    };

    return (
        <Paper elevation={3} sx={{ p: 3, m: 2, maxWidth: 600 }}>
            <Typography variant="h4" gutterBottom>
                Language System Demo
            </Typography>
            
            <Typography variant="h6" color="primary" gutterBottom>
                Current Language: {currentLanguage === 'english' ? '🇺🇸 English' : '🇪🇸 Español'}
            </Typography>
            
            <Button 
                variant="contained" 
                onClick={toggleLanguage}
                sx={{ mb: 3 }}
            >
                Switch to {currentLanguage === 'english' ? 'Spanish' : 'English'}
            </Button>

            <Box sx={{ mb: 2 }}>
                <Typography variant="h6">Sample Translations:</Typography>
                <ul>
                    <li><strong>{t('save')}:</strong> {t('saveArrangement')}</li>
                    <li><strong>{t('export')}:</strong> {t('exportToPDF')}</li>
                    <li><strong>{t('guests')}:</strong> {t('addGuests')}</li>
                    <li><strong>{t('table')}:</strong> {t('tableSettings')}</li>
                    <li><strong>{t('configuration')}:</strong> {t('configurationSettings')}</li>
                    <li><strong>{t('language')}:</strong> {t('languageSettings')}</li>
                </ul>
            </Box>

            <Box sx={{ mb: 2 }}>
                <Typography variant="h6">Message Examples:</Typography>
                <ul>
                    <li>{t('arrangementSaved')}</li>
                    <li>{t('guestAdded', { count: 5 })}</li>
                    <li>{t('currentArrangement', { name: 'Smith Wedding' })}</li>
                    <li>{t('switchLanguage')}</li>
                </ul>
            </Box>

            <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                <Typography variant="body2">
                    <strong>✅ Translation System Features:</strong><br/>
                    • Complete English/Spanish dictionary<br/>
                    • Organized in separate files for maintainability<br/>
                    • Parameter substitution (e.g., count, name)<br/>
                    • Fallback to English if translation missing<br/>
                    • Easy integration with useSeatingTranslation hook<br/>
                    • Modular structure for adding new languages<br/>
                    • Ready for full app implementation
                </Typography>
            </Box>
        </Paper>
    );
};

export default LanguageTest;

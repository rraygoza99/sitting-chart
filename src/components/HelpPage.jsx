import React, { useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';
import ContactSupportOutlinedIcon from '@mui/icons-material/ContactSupportOutlined';
import LightbulbOutlinedIcon from '@mui/icons-material/LightbulbOutlined';

import { useSeatingTranslation } from '../hooks/useSeatingTranslation';
import UserMenu from './common/UserMenu';

export default function HelpPage() {
    const auth = useAuth();
    const navigate = useNavigate();
    const { t } = useSeatingTranslation();

    const userEmail = auth.user?.profile?.email || '';
    const userName =
        auth.user?.profile?.['cognito:username'] ||
        auth.user?.profile?.preferred_username ||
        auth.user?.profile?.username ||
        'User';

    const [category, setCategory] = useState('bug');
    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [status, setStatus] = useState({ sent: false, error: false });

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!subject.trim() || !message.trim()) {
            return;
        }

        const recipientEmail = 'rraygoza1408@gmail.com';
        const formattedSubject = `[Sitting Chart - ${category.toUpperCase()}] ${subject.trim()}`;
        const bodyContent = `User: ${userName} (${userEmail || 'No email provided'})\nCategory: ${category}\n\nMessage:\n${message.trim()}`;

        // Create mailto link as fallback/standard client-side email trigger
        const mailtoLink = `mailto:${recipientEmail}?subject=${encodeURIComponent(formattedSubject)}&body=${encodeURIComponent(bodyContent)}`;
        
        window.location.href = mailtoLink;
        setStatus({ sent: true, error: false });
    };

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: '#f4f6f8', pb: 8 }}>
            {/* Top Bar */}
            <Box
                sx={{
                    bgcolor: 'white',
                    borderBottom: '1px solid #e0e0e0',
                    px: { xs: 2, md: 4 },
                    py: 1.5,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate('/')}
                    variant="outlined"
                    size="small"
                    sx={{ textTransform: 'none' }}
                >
                    {t('backToWeddings') || 'Volver a mis bodas'}
                </Button>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                    {t('helpAndSupport') || 'Ayuda y Soporte'}
                </Typography>
                <UserMenu />
            </Box>

            <Container maxWidth="md" sx={{ mt: 4 }}>
                <Paper sx={{ p: 4, borderRadius: 2 }} elevation={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                        <HelpOutlineIcon color="primary" sx={{ fontSize: 32 }} />
                        <div>
                            <Typography variant="h5" sx={{ fontWeight: 700, color: '#222' }}>
                                {t('helpCenterTitle') || 'Reportar un Error o Consulta'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {t('helpCenterSubtitle') || 'Envía tus comentarios, reporte de problemas o dudas directamente a nuestro equipo.'}
                            </Typography>
                        </div>
                    </Box>

                    {status.sent && (
                        <Alert severity="success" sx={{ mb: 3 }}>
                            {t('helpFormSentSuccess') || 'Se ha preparado tu mensaje. Si no se abrió tu cliente de correo, puedes enviar tu reporte directamente a rraygoza1408@gmail.com.'}
                        </Alert>
                    )}

                    <form onSubmit={handleSubmit}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                            <TextField
                                select
                                label={t('inquiryCategory') || 'Tipo de consulta'}
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                fullWidth
                                variant="outlined"
                            >
                                <MenuItem value="bug">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <BugReportOutlinedIcon fontSize="small" color="error" />
                                        {t('categoryBug') || 'Reportar un error / Bug'}
                                    </Box>
                                </MenuItem>
                                <MenuItem value="inquiry">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <ContactSupportOutlinedIcon fontSize="small" color="primary" />
                                        {t('categoryInquiry') || 'Pregunta o consulta general'}
                                    </Box>
                                </MenuItem>
                                <MenuItem value="feature">
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <LightbulbOutlinedIcon fontSize="small" color="warning" />
                                        {t('categoryFeature') || 'Sugerencia de nueva función'}
                                    </Box>
                                </MenuItem>
                            </TextField>

                            <TextField
                                label={t('inquirySubject') || 'Asunto'}
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder={t('inquirySubjectPlaceholder') || 'Breve descripción del problema o consulta'}
                                required
                                fullWidth
                                variant="outlined"
                            />

                            <TextField
                                label={t('inquiryMessage') || 'Mensaje detallado'}
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={t('inquiryMessagePlaceholder') || 'Cuéntanos con detalle qué ocurrió o en qué te podemos ayudar...'}
                                required
                                multiline
                                rows={5}
                                fullWidth
                                variant="outlined"
                            />

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    size="large"
                                    startIcon={<SendIcon />}
                                    sx={{ px: 4, py: 1.2, textTransform: 'none', fontWeight: 600 }}
                                >
                                    {t('sendInquiry') || 'Enviar Reporte'}
                                </Button>
                            </Box>
                        </Box>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
}

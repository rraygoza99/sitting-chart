import React, { useState, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import SaveIcon from '@mui/icons-material/Save';

import { useSeatingTranslation } from '../hooks/useSeatingTranslation';
import UserMenu from './common/UserMenu';
import { getCurrentPlanId } from '../utils/subscriptionService';
import { getPlannerBranding, savePlannerBranding } from '../utils/brandingService';

export default function AccountPage() {
    const auth = useAuth();
    const navigate = useNavigate();
    const { t } = useSeatingTranslation();

    const activePlanId = getCurrentPlanId();

    const email = auth.user?.profile?.email || '';
    const username =
        auth.user?.profile?.['cognito:username'] ||
        auth.user?.profile?.preferred_username ||
        auth.user?.profile?.username ||
        email ||
        'User';

    // Branding State
    const [companyName, setCompanyName] = useState('');
    const [tagline, setTagline] = useState('');
    const [logoDataUrl, setLogoDataUrl] = useState('');
    const [brandingSaved, setBrandingSaved] = useState(false);

    useEffect(() => {
        const branding = getPlannerBranding();
        if (branding) {
            setCompanyName(branding.companyName || '');
            setTagline(branding.tagline || '');
            setLogoDataUrl(branding.logoDataUrl || '');
        }
    }, []);

    const handleLogoUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 1.5 * 1024 * 1024) {
            alert('Image size exceeds 1.5MB. Please choose a smaller image.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (uploadEvent) => {
            setLogoDataUrl(uploadEvent.target.result);
            setBrandingSaved(false);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveLogo = () => {
        setLogoDataUrl('');
        setBrandingSaved(false);
    };

    const handleSaveBranding = (e) => {
        e.preventDefault();
        const newBranding = {
            companyName: companyName.trim(),
            tagline: tagline.trim(),
            logoDataUrl: logoDataUrl,
        };
        savePlannerBranding(newBranding);
        setBrandingSaved(true);
        setTimeout(() => setBrandingSaved(false), 4000);
    };

    const planInfo = {
        basic: {
            name: t('planBasicName') || 'Básico (Independiente)',
            price: '$299 MXN / mes',
            limit: '3 ' + (t('activeWeddings') || 'bodas activas'),
            description: t('planBasicDesc') || 'Ideal para wedding planners independientes con pocos eventos simultáneos.',
        },
        pro: {
            name: t('planProName') || 'Profesional',
            price: '$499 MXN / mes',
            limit: '8 ' + (t('activeWeddings') || 'bodas activas'),
            description: t('planProDesc') || 'Para wedding planners profesionales y activos.',
        },
        agency: {
            name: t('planAgencyName') || 'Agencia / Ilimitado',
            price: '$899 MXN / mes',
            limit: t('unlimitedWeddings') || 'Bodas activas ilimitadas',
            description: t('planAgencyDesc') || 'Para agencias, salones de eventos y organizadores de alto volumen.',
        },
    };

    const currentPlan = planInfo[activePlanId] || planInfo.pro;

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
                    {t('accountAndSubscription') || 'Cuenta y Suscripción'}
                </Typography>
                <UserMenu />
            </Box>

            <Container maxWidth="lg" sx={{ mt: 4 }}>
                {/* User Information Card */}
                <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }} elevation={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                                sx={{
                                    bgcolor: '#1976d2',
                                    color: 'white',
                                    width: 56,
                                    height: 56,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.5rem',
                                    fontWeight: 600,
                                }}
                            >
                                {(username || email || 'U').charAt(0).toUpperCase()}
                            </Box>
                            <Box>
                                <Typography variant="h6" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <PersonOutlineIcon fontSize="small" color="action" />
                                    {username}
                                </Typography>
                                {email && (
                                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <EmailOutlinedIcon fontSize="small" />
                                        {email}
                                    </Typography>
                                )}
                            </Box>
                        </Box>
                        <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                            <Chip
                                icon={<WorkspacePremiumIcon />}
                                label={`${t('currentPlan') || 'Plan Actual'}: ${currentPlan.name}`}
                                color="primary"
                                sx={{ fontWeight: 600, px: 1, py: 2 }}
                            />
                            <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                                {t('subscriptionActive') || 'Estado: Activo'}
                            </Typography>
                        </Box>
                    </Box>
                </Paper>

                {/* Current Subscription Section */}
                <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }} elevation={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                        <Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                                <WorkspacePremiumIcon color="primary" sx={{ fontSize: 28 }} />
                                <Typography variant="h5" sx={{ fontWeight: 700, color: '#222' }}>
                                    {t('currentPlan') || 'Plan Actual'}: {currentPlan.name}
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                                {currentPlan.description}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1 }}>
                                <Chip label={currentPlan.price} size="small" color="primary" variant="outlined" sx={{ fontWeight: 600 }} />
                                <Chip label={currentPlan.limit} size="small" variant="filled" sx={{ bgcolor: '#e8f5e9', color: '#2e7d32', fontWeight: 600 }} />
                            </Box>
                        </Box>
                        <Button
                            variant="contained"
                            color="primary"
                            size="medium"
                            onClick={() => navigate('/plans')}
                            sx={{ textTransform: 'none', px: 3, py: 1.2, fontWeight: 600 }}
                        >
                            {t('changePlan') || 'Cambiar plan'}
                        </Button>
                    </Box>
                </Paper>

                {/* Planner Branding Settings Section */}
                <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }} elevation={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                        <PaletteOutlinedIcon color="primary" />
                        <Typography variant="h5" sx={{ fontWeight: 700, color: '#222' }}>
                            {t('plannerBranding') || 'Marca y Logotipo del Organizador'}
                        </Typography>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        {t('plannerBrandingDesc') || 'Personaliza tu logotipo, nombre de empresa y datos de contacto. Aparecerán en los PDFs exportados y en el espacio de trabajo.'}
                    </Typography>

                    {brandingSaved && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            {t('brandingSavedSuccess') || '¡Marca guardada con éxito! Se aplicará en tus PDFs y espacio de trabajo.'}
                        </Alert>
                    )}

                    <form onSubmit={handleSaveBranding}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label={t('brandingCompanyName') || 'Nombre de la Empresa / Planner'}
                                    value={companyName}
                                    onChange={(e) => {
                                        setCompanyName(e.target.value);
                                        setBrandingSaved(false);
                                    }}
                                    placeholder={t('brandingCompanyNamePlaceholder') || 'ej. Elegance Bodas & Eventos'}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label={t('brandingTagline') || 'Eslogan / Sitio Web / Teléfono'}
                                    value={tagline}
                                    onChange={(e) => {
                                        setTagline(e.target.value);
                                        setBrandingSaved(false);
                                    }}
                                    placeholder={t('brandingTaglinePlaceholder') || 'ej. www.elegancebodas.mx | +52 55 1234 5678'}
                                    variant="outlined"
                                />
                            </Grid>

                            <Grid item xs={12}>
                                <Box sx={{ p: 2, bgcolor: '#fbfcfe', border: '1px dashed #bbb', borderRadius: 1.5 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                            {t('brandingLogo') || 'Logotipo'}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                            {t('brandingLogoDimensions') || 'Recomendado: 300 × 120 px (PNG transparente, formato horizontal, máx. 1.5 MB)'}
                                        </Typography>
                                    </Box>
                                    {logoDataUrl ? (
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mb: 1.5 }}>
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
                                                sx={{ textTransform: 'none' }}
                                            >
                                                {t('removeLogo') || 'Eliminar Logotipo'}
                                            </Button>
                                        </Box>
                                    ) : (
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                                            {t('noLogoSelected') || 'Aún no has subido ningún logotipo.'}
                                        </Typography>
                                    )}

                                    <div>
                                        <Button
                                            variant="outlined"
                                            component="label"
                                            size="small"
                                            sx={{ textTransform: 'none' }}
                                        >
                                            {logoDataUrl ? (t('changeLogo') || 'Cambiar Logotipo') : (t('uploadLogo') || 'Subir Logotipo (PNG / JPG)')}
                                            <input
                                                type="file"
                                                hidden
                                                accept="image/png, image/jpeg, image/webp"
                                                onChange={handleLogoUpload}
                                            />
                                        </Button>
                                    </div>
                                </Box>
                            </Grid>

                            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    color="primary"
                                    startIcon={<SaveIcon />}
                                    sx={{ px: 3, textTransform: 'none', fontWeight: 600 }}
                                >
                                    {t('save') || 'Guardar'} {t('settings') || 'Configuración'}
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
}

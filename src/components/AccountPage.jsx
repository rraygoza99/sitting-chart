import React from 'react';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Divider from '@mui/material/Divider';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import StarIcon from '@mui/icons-material/Star';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';

import { useSeatingTranslation } from '../hooks/useSeatingTranslation';
import UserMenu from './common/UserMenu';
import { getCurrentPlanId } from '../utils/subscriptionService';

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

    const handleSelectPlan = (planId) => {
        try {
            localStorage.setItem('userSubscriptionPlan', planId);
            window.location.reload();
        } catch (_) {}
    };

    const plans = [
        {
            id: 'basic',
            name: t('planBasicName') || 'Básico (Independiente)',
            price: '$299 MXN',
            period: t('perMonth') || '/ mes',
            description: t('planBasicDesc') || 'Ideal para wedding planners independientes con pocos eventos simultáneos.',
            weddingsLimit: '3 ' + (t('activeWeddings') || 'bodas activas'),
            features: [
                t('fullSeatingCanvas') || 'Lienzo completo de asignación de mesas',
                t('csvImportFeature') || 'Importación y exportación de invitados por CSV',
                t('pdfExportsAll') || 'Generación de PDFs (Alfabético, Mesas, Boletos)',
                t('basicSupport') || 'Soporte estándar',
            ],
            isCurrent: activePlanId === 'basic',
            highlighted: false,
        },
        {
            id: 'pro',
            name: t('planProName') || 'Profesional',
            price: '$499 MXN',
            period: t('perMonth') || '/ mes',
            description: t('planProDesc') || 'Para wedding planners profesionales y activos.',
            weddingsLimit: '8 ' + (t('activeWeddings') || 'bodas activas'),
            features: [
                t('allBasicFeatures') || 'Todo lo del Plan Básico',
                t('sharingFeature') || 'Compartir eventos con clientes y equipo',
                t('undoHistoryFeature') || 'Historial de cambios multinivel (Deshacer)',
                t('customTableCapacities') || 'Mesas y grupos personalizados ilimitados',
                t('prioritySupport') || 'Soporte prioritario',
            ],
            isCurrent: activePlanId === 'pro',
            highlighted: true,
        },
        {
            id: 'agency',
            name: t('planAgencyName') || 'Agencia / Ilimitado',
            price: '$899 MXN',
            period: t('perMonth') || '/ mes',
            description: t('planAgencyDesc') || 'Para agencias, salones de eventos y organizadores de alto volumen.',
            weddingsLimit: t('unlimitedWeddings') || 'Bodas activas ilimitadas',
            features: [
                t('allProFeatures') || 'Todo lo del Plan Profesional',
                t('unlimitedWeddings') || 'Eventos y bodas ilimitadas',
                t('customBranding') || 'Personalización de marca en PDFs (Logo y estilo)',
                t('multiUserTeams') || 'Múltiples organizadores simultáneos',
                t('dedicatedSupport') || 'Soporte prioritario 24/7',
            ],
            isCurrent: activePlanId === 'agency',
            highlighted: false,
        },
    ];

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
                                label={`${t('currentPlan') || 'Plan Actual'}: ${plans.find(p => p.id === activePlanId)?.name || t('planProName') || 'Profesional'}`}
                                color="primary"
                                sx={{ fontWeight: 600, px: 1, py: 2 }}
                            />
                            <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                                {t('subscriptionActive') || 'Estado: Activo'}
                            </Typography>
                        </Box>
                    </Box>
                </Paper>

                {/* Subscription Plans Section */}
                <Box sx={{ mb: 3 }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#222' }}>
                        {t('subscriptionPlansTitle') || 'Planes de Suscripción'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {t('subscriptionPlansDesc') || 'Administra tu plan para aumentar el límite de bodas simultáneas y acceder a funciones avanzadas.'}
                    </Typography>
                </Box>

                <Grid container spacing={3} alignItems="stretch">
                    {plans.map((plan) => (
                        <Grid item xs={12} md={4} key={plan.id} sx={{ display: 'flex' }}>
                            <Card
                                elevation={plan.highlighted ? 4 : 1}
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    width: '100%',
                                    borderRadius: 2,
                                    border: plan.highlighted ? '2px solid #1976d2' : '1px solid #e0e0e0',
                                    position: 'relative',
                                }}
                            >
                                {plan.highlighted && (
                                    <Chip
                                        icon={<StarIcon sx={{ color: 'white !important', fontSize: '1rem' }} />}
                                        label={t('recommendedPlan') || 'Recomendado'}
                                        color="primary"
                                        size="small"
                                        sx={{
                                            position: 'absolute',
                                            top: 12,
                                            right: 12,
                                            fontWeight: 600,
                                        }}
                                    />
                                )}
                                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#222', mb: 1 }}>
                                        {plan.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40, mb: 2 }}>
                                        {plan.description}
                                    </Typography>

                                    <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 1 }}>
                                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1976d2' }}>
                                            {plan.price}
                                        </Typography>
                                        <Typography variant="subtitle2" color="text.secondary" sx={{ ml: 1 }}>
                                            {plan.period}
                                        </Typography>
                                    </Box>

                                    <Chip
                                        label={plan.weddingsLimit}
                                        size="small"
                                        variant="outlined"
                                        color={plan.highlighted ? 'primary' : 'default'}
                                        sx={{ mb: 2, fontWeight: 500 }}
                                    />

                                    <Divider sx={{ my: 2 }} />

                                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                                        {t('includedFeatures') || 'Incluye:'}
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                        {plan.features.map((feature, idx) => (
                                            <Box key={idx} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                                                <CheckCircleOutlineIcon color="success" sx={{ fontSize: 18, mt: '2px', flexShrink: 0 }} />
                                                <Typography variant="body2" color="text.primary">
                                                    {feature}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </CardContent>
                                <CardActions sx={{ p: 3, pt: 0 }}>
                                    {plan.isCurrent ? (
                                        <Button fullWidth variant="outlined" color="primary" disabled sx={{ textTransform: 'none', py: 1 }}>
                                            {t('currentPlan') || 'Plan Actual'}
                                        </Button>
                                    ) : (
                                        <Button
                                            fullWidth
                                            variant={plan.highlighted ? 'contained' : 'outlined'}
                                            color="primary"
                                            sx={{ textTransform: 'none', py: 1, fontWeight: 600 }}
                                            onClick={() => handleSelectPlan(plan.id)}
                                        >
                                            {t('selectPlan') || 'Elegir Plan'}
                                        </Button>
                                    )}
                                </CardActions>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
}

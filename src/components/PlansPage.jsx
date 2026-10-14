import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import StarIcon from '@mui/icons-material/Star';

import { useSeatingTranslation } from '../hooks/useSeatingTranslation';
import UserMenu from './common/UserMenu';
import { getCurrentPlanId } from '../utils/subscriptionService';

export default function PlansPage() {
    const navigate = useNavigate();
    const { t } = useSeatingTranslation();

    const [activePlanId, setActivePlanId] = useState(() => getCurrentPlanId());
    const [changeSuccess, setChangeSuccess] = useState(false);

    const handleSelectPlan = (planId) => {
        try {
            localStorage.setItem('userSubscriptionPlan', planId);
            setActivePlanId(planId);
            setChangeSuccess(true);
            setTimeout(() => setChangeSuccess(false), 4000);
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
                    onClick={() => navigate('/account')}
                    variant="outlined"
                    size="small"
                    sx={{ textTransform: 'none' }}
                >
                    {t('backToAccount') || 'Volver a mi cuenta'}
                </Button>
                <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
                    {t('subscriptionPlansTitle') || 'Planes de Suscripción'}
                </Typography>
                <UserMenu />
            </Box>

            <Container maxWidth="lg" sx={{ mt: 4 }}>
                {changeSuccess && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                        {t('planChangedSuccess') || '¡Plan actualizado con éxito!'}
                    </Alert>
                )}

                <Box sx={{ mb: 4, textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: '#222', mb: 1 }}>
                        {t('subscriptionPlansTitle') || 'Planes de Suscripción'}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 650, mx: 'auto' }}>
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
                                    border: plan.isCurrent
                                        ? '2px solid #2e7d32'
                                        : plan.highlighted
                                        ? '2px solid #1976d2'
                                        : '1px solid #e0e0e0',
                                    position: 'relative',
                                }}
                            >
                                {plan.isCurrent ? (
                                    <Chip
                                        icon={<CheckCircleOutlineIcon sx={{ color: 'white !important', fontSize: '1rem' }} />}
                                        label={t('currentPlan') || 'Plan Actual'}
                                        color="success"
                                        size="small"
                                        sx={{
                                            position: 'absolute',
                                            top: 12,
                                            right: 12,
                                            fontWeight: 600,
                                        }}
                                    />
                                ) : plan.highlighted ? (
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
                                ) : null}
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
                                        <Button fullWidth variant="outlined" color="success" disabled sx={{ textTransform: 'none', py: 1, fontWeight: 600 }}>
                                            ✓ {t('currentPlan') || 'Plan Actual'}
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

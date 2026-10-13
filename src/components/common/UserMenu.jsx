import React, { useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { useNavigate } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';

import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutIcon from '@mui/icons-material/Logout';

import { useSeatingTranslation } from '../../hooks/useSeatingTranslation';

const clientId = '5p565e420hon8ith2m655n0krh';
const logoutUri = 'https://master.d3mmpbz9sdxh3s.amplifyapp.com/login';
const cognitoDomain = 'https://sitting-chart.auth.us-east-2.amazoncognito.com';

export default function UserMenu({ onOpenSettings, currentLanguage = 'english' }) {
    const auth = useAuth();
    const navigate = useNavigate();
    const { t } = useSeatingTranslation(currentLanguage);
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const email = auth.user?.profile?.email || '';
    const username = auth.user?.profile?.['cognito:username'] || auth.user?.profile?.preferred_username || auth.user?.profile?.username || email || 'User';

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleOpenAccount = () => {
        handleMenuClose();
        navigate('/account');
    };

    const handleSettingsClick = () => {
        handleMenuClose();
        if (onOpenSettings) {
            onOpenSettings();
        }
    };

    const handleLogout = async () => {
        handleMenuClose();
        try {
            await auth.removeUser();
        } catch (e) {
            console.error('Error removing user:', e);
        }
        sessionStorage.clear();
        localStorage.removeItem('oidc.user:' + auth.settings?.authority + ':' + auth.settings?.client_id);
        window.location.href = '/login';
    };

    const userInitial = (username || email || 'U').charAt(0).toUpperCase();

    return (
        <>
            <Tooltip title={t('account') || 'Account'}>
                <IconButton
                    onClick={handleMenuOpen}
                    size="small"
                    aria-controls={open ? 'user-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                    sx={{
                        ml: 1,
                        bgcolor: '#1976d2',
                        color: 'white',
                        '&:hover': { bgcolor: '#1565c0' },
                        width: 38,
                        height: 38,
                    }}
                >
                    <Avatar sx={{ width: 32, height: 32, bgcolor: '#1565c0', fontSize: '0.95rem', fontWeight: 600 }}>
                        {userInitial}
                    </Avatar>
                </IconButton>
            </Tooltip>

            <Menu
                anchorEl={anchorEl}
                id="user-menu"
                open={open}
                onClose={handleMenuClose}
                onClick={handleMenuClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{
                    elevation: 3,
                    sx: {
                        minWidth: 200,
                        mt: 1,
                        borderRadius: 2,
                        overflow: 'visible',
                        '&:before': {
                            content: '""',
                            display: 'block',
                            position: 'absolute',
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: 'background.paper',
                            transform: 'translateY(-50%) rotate(45deg)',
                            zIndex: 0,
                        },
                    },
                }}
            >
                {/* User info header */}
                <div style={{ padding: '8px 16px', outline: 'none' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#111' }}>
                        {username}
                    </Typography>
                    {email && (
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem' }} noWrap>
                            {email}
                        </Typography>
                    )}
                </div>
                <Divider />

                <MenuItem onClick={handleOpenAccount}>
                    <ListItemIcon>
                        <PersonOutlineIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>{t('account') || 'Account'}</ListItemText>
                </MenuItem>

                {onOpenSettings && (
                    <MenuItem onClick={handleSettingsClick}>
                        <ListItemIcon>
                            <SettingsOutlinedIcon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText>{t('settings') || 'Settings'}</ListItemText>
                    </MenuItem>
                )}

                <Divider />

                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                    <ListItemIcon sx={{ color: 'error.main' }}>
                        <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>{t('logout') || 'Log out'}</ListItemText>
                </MenuItem>
            </Menu>
        </>
    );
}

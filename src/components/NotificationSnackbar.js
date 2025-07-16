import React from 'react';
import { Snackbar, Alert } from '@mui/material';

function NotificationSnackbar({
    alertOpen,
    alertMessage,
    alertSeverity,
    onCloseAlert
}) {
    return (
        <Snackbar open={alertOpen} autoHideDuration={3000} onClose={onCloseAlert}>
            <Alert onClose={onCloseAlert} severity={alertSeverity}>
                {alertMessage}
            </Alert>
        </Snackbar>
    );
}

export default NotificationSnackbar;

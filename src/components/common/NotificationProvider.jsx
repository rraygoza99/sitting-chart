import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import MuiAlert from '@mui/material/Alert';

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const NotificationContext = createContext(null);

export function NotificationProvider({ children, autoHideDuration = 4000 }) {
  const [snack, setSnack] = useState({ open: false, message: '', severity: 'info' });

  const close = useCallback(() => setSnack((s) => ({ ...s, open: false })), []);

  const notify = useMemo(() => ({
    show: (message, severity = 'info') => setSnack({ open: true, message, severity }),
    success: (message) => setSnack({ open: true, message, severity: 'success' }),
    error: (message) => setSnack({ open: true, message, severity: 'error' }),
    warning: (message) => setSnack({ open: true, message, severity: 'warning' }),
    info: (message) => setSnack({ open: true, message, severity: 'info' }),
    close,
  }), [close]);

  return (
    <NotificationContext.Provider value={notify}>
      {children}
      <Snackbar
        open={snack.open}
        autoHideDuration={autoHideDuration}
        onClose={close}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={close} severity={snack.severity} sx={{ width: '100%' }}>
          {snack.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return ctx;
}

export default NotificationProvider;

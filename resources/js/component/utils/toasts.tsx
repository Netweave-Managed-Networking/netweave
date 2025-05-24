import {
  Alert,
  AlertColor,
  Snackbar,
  SnackbarCloseReason,
  SnackbarOrigin,
} from '@mui/material';

export type ToastPosition = {
  v: SnackbarOrigin['vertical'];
  h: SnackbarOrigin['horizontal'];
};

export interface ToastProps {
  open: boolean;
  message: string;
  position?: ToastPosition;
  severity?: AlertColor;
  onClose?: (
    event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => void;
}

const Toast = ({
  open,
  message,
  onClose,
  position = { v: 'bottom', h: 'center' },
  severity = 'info',
}: ToastProps) => {
  return (
    <Snackbar
      open={open}
      onClose={onClose}
      autoHideDuration={4000}
      anchorOrigin={{ vertical: position.v, horizontal: position.h }}
    >
      <Alert severity={severity} variant="filled" sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Toast;

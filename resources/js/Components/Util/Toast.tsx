import {
  Alert,
  AlertColor,
  Snackbar,
  SnackbarCloseReason,
  SnackbarOrigin,
} from '@mui/material';

export type ToastPosition =
  `${SnackbarOrigin['vertical']}-${SnackbarOrigin['horizontal']}`;

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
  position = 'bottom-center',
  severity = 'info',
}: ToastProps) => {
  return (
    <Snackbar
      open={open}
      onClose={onClose}
      autoHideDuration={4000}
      anchorOrigin={{
        vertical: position.split('-')[0] as SnackbarOrigin['vertical'],
        horizontal: position.split('-')[1] as SnackbarOrigin['horizontal'],
      }}
    >
      <Alert severity={severity} variant="filled" sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default Toast;

import { Snackbar, SnackbarCloseReason, SnackbarOrigin } from '@mui/material';

export interface ToastProps {
  open: boolean;
  message: string;
  position?: `${SnackbarOrigin['vertical']}-${SnackbarOrigin['horizontal']}`;
  onClose?: (
    event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason
  ) => void;
}

const Toast = ({
  open,
  onClose,
  message,
  position = 'bottom-center',
}: ToastProps) => {
  return (
    <Snackbar
      open={open}
      onClose={onClose}
      autoHideDuration={3000}
      anchorOrigin={{
        vertical: position.split('-')[0] as SnackbarOrigin['vertical'],
        horizontal: position.split('-')[1] as SnackbarOrigin['horizontal'],
      }}
      message={message}
    />
  );
};

export default Toast;

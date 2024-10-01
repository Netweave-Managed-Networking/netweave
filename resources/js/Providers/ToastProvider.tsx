import Toast, { ToastPosition } from '@/Components/Toast';
import { PageProps } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export const ToastProvider = () => {
  const { props } = usePage<PageProps>();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [severity, setSeverity] = useState<'error' | 'success'>('error');
  const [position] = useState<ToastPosition>('bottom-right');

  useEffect(() => {
    const message: string | null | undefined =
      props.error_message ?? props.success_message;

    if (message) {
      setMessage(message);
      setSeverity(props.error_message ? 'error' : 'success');
      setOpen(true);
    }
  }, [props.error_message, props.success_message]);

  const handleClose = () => {
    setOpen(false);
    props.success_message = null;
    props.error_message = null;
  };

  return message ? (
    <Toast
      open={open}
      onClose={handleClose}
      message={message}
      position={position} // Optional, or pass a default if you don't want to customize
      severity={severity}
    />
  ) : (
    <></>
  );
};

import Toast, { ToastPosition } from '@/Components/Util/Toast';
import { createContext, ReactNode, useContext, useState } from 'react';

type ToastContextType = {
  showToast: (
    message: string,
    severity: 'error' | 'success' | 'info',
    position?: ToastPosition
  ) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = (): ToastContextType | never => {
  const context: ToastContextType | undefined = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [severity, setSeverity] = useState<'error' | 'success' | 'info'>(
    'error'
  );
  const [position, setPosition] = useState<ToastPosition>({
    v: 'bottom',
    h: 'right',
  });

  const showToast = (
    message: string,
    severity: 'error' | 'success' | 'info',
    position: ToastPosition = { v: 'bottom', h: 'right' }
  ) => {
    setMessage(message);
    setSeverity(severity);
    setPosition(position);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setMessage(null);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {message && (
        <Toast
          open={open}
          onClose={handleClose}
          message={message}
          position={position}
          severity={severity}
        />
      )}
    </ToastContext.Provider>
  );
};

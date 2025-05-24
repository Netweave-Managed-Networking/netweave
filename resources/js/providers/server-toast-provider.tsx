import { PageProps } from '@/types/page-props.type';
import { usePage } from '@inertiajs/react';
import { ReactNode, useEffect } from 'react';
import { useToast } from './toast-provider';

/** shows a toast message (using ToastProvider) every time the backend sets an error_message or success_message */
export const ServerToastProvider = ({ children }: { children: ReactNode }) => {
  const { props } = usePage<PageProps>();
  const { showToast } = useToast();

  useEffect(() => {
    const message: string | null | undefined =
      props.error_message ?? props.success_message;

    if (message) {
      showToast(message, props.error_message ? 'error' : 'success');
      props.success_message = null;
      props.error_message = null;
    }
  }, [props.error_message, props.success_message]);

  return children;
};

import '../css/app.css';
import './bootstrap';

import { ToastProvider } from '@/providers/toast-provider';
import { createInertiaApp } from '@inertiajs/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});

createInertiaApp({
  title: (title: string) => `${title} - ${appName}`,
  resolve: (name: string) =>
    resolvePageComponent(
      `./pages/${name}.tsx`,
      import.meta.glob('./pages/**/*.tsx')
    ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setup({ el, App, props }: { el: any; App: any; props: any }) {
    const root = createRoot(el);

    root.render(
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <App {...props} />
        </ToastProvider>
      </QueryClientProvider>
    );
  },
  progress: {
    color: '#4B5563',
  },
});

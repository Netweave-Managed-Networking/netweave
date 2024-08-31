import './bootstrap';
import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
  title: (title: string) => `${title} - ${appName}`,
  resolve: (name: string) =>
    resolvePageComponent(
      `./Pages/${name}.tsx`,
      import.meta.glob('./Pages/**/*.tsx')
    ),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setup({ el, App, props }: { el: any; App: any; props: any }) {
    const root = createRoot(el);

    root.render(<App {...props} />);
  },
  progress: {
    color: '#4B5563',
  },
});

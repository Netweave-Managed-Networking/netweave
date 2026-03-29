import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Server, // TODO: change back to RenderMode.Prerender once dummy api call is no longer made by app.ts
  },
];

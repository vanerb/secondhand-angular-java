import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Las rutas con parámetros dependen de datos del backend: se renderizan en el navegador.
  {
    path: 'product/:id',
    renderMode: RenderMode.Client
  },
  {
    path: 'profile/:username',
    renderMode: RenderMode.Client
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];

import { ApplicationConfig, provideBrowserGlobalErrorListeners, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { environment } from '../environments/environment';

registerLocaleData(localeEs);

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    // En la demo de GitHub Pages no hay servidor: la API y el chat se simulan en el navegador.
    provideHttpClient(withFetch(), withInterceptors(environment.demoInterceptors)),
    ...environment.demoProviders,
    ...(environment.demo ? [] : [provideClientHydration()]),
    {
      provide: LOCALE_ID,
      useValue: 'es-ES',
    },
  ],
};

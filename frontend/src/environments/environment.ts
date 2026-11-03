import { Provider, Type } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';

/** Configuración normal: la API Spring Boot responde en http://localhost:8080. */
export const environment = {
  demo: false,
  // Solo la configuración demo los rellena (así su código no entra en el build normal).
  demoInterceptors: [] as HttpInterceptorFn[],
  demoProviders: [] as Provider[],
  demoBanner: null as Type<unknown> | null,
};

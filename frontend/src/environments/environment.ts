import { Provider, Type } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';

/** Configuración normal: la API Spring Boot responde en http://localhost:8080. */
export const environment = {
  demo: false,
  // URL del backend; cámbiala si la API no está en este puerto.
  apiUrl: 'http://localhost:8080',
  wsUrl: 'ws://localhost:8080/ws',
  // Solo la configuración demo los rellena (así su código no entra en el build normal).
  demoInterceptors: [] as HttpInterceptorFn[],
  demoProviders: [] as Provider[],
  demoBanner: null as Type<unknown> | null,
};

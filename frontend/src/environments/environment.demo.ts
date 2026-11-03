import { Provider, Type } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { DemoBanner } from '../app/demo/demo-banner';
import { demoBackendInterceptor } from '../app/demo/demo-backend.interceptor';
import { DemoChatWebSocketService } from '../app/demo/demo-chat-socket';
import { ChatWebSocketService } from '../app/services/chat-web-socket-service';

/** Demo estática (GitHub Pages): la API y el chat se simulan en el navegador con datos de muestra. */
export const environment = {
  demo: true,
  demoInterceptors: [demoBackendInterceptor] as HttpInterceptorFn[],
  demoProviders: [{ provide: ChatWebSocketService, useClass: DemoChatWebSocketService }] as Provider[],
  demoBanner: DemoBanner as Type<unknown> | null,
};

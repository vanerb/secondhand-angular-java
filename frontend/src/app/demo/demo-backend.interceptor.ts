import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DemoApi } from './demo-api';
import { Row } from './demo-seed';
import { ApiFail, DemoStore } from './demo-store';

let api: DemoApi | null = null;

/** API simulada compartida por el interceptor y el WebSocket de la demo. */
export const demoApi = () => (api ??= new DemoApi(new DemoStore()));

/** Vuelve a los datos de muestra originales (borra lo guardado en este navegador). */
export function resetDemoData(): void {
  demoApi().reset();
}

/**
 * Sustituye al backend en la demo estática: las peticiones a /api se resuelven en el navegador
 * con DemoApi; cualquier otra URL sigue su camino normal.
 */
export const demoBackendInterceptor: HttpInterceptorFn = (request, next) => {
  const match = /^(?:https?:\/\/[^/]+)?\/api(\/[^?#]*)/.exec(request.url);
  if (!match) return next(request);
  const path = match[1].replace(/\/+$/, '') || '/';

  return new Observable((subscriber) => {
    let cancelled = false;
    const run = async () => {
      const fields: Record<string, string[]> = {};
      const files: Record<string, File[]> = {};
      let json: Row | null = null;
      if (request.body instanceof FormData) {
        request.body.forEach((value, key) => {
          if (value instanceof File) (files[key] ??= []).push(value);
          else (fields[key] ??= []).push(value);
        });
      } else if (request.body && typeof request.body === 'object') {
        json = request.body as Row;
      }
      const query: Record<string, string> = {};
      for (const key of request.params.keys()) query[key] = request.params.get(key) ?? '';
      const header = request.headers.get('Authorization');
      const token = header?.startsWith('Bearer ') ? header.slice(7) : null;
      // Latencia breve para que la interfaz muestre sus estados de carga como con un servidor real.
      await new Promise((resolve) => setTimeout(resolve, 150));
      try {
        const result = await demoApi().handle({ method: request.method, path, query, json, fields, files, token });
        if (!cancelled) {
          subscriber.next(new HttpResponse({ status: result.status, body: result.body, url: request.url }));
          subscriber.complete();
        }
      } catch (error) {
        if (cancelled) return;
        const failure = error instanceof ApiFail ? error : new ApiFail(500, String((error as Error)?.message ?? error));
        if (!(error instanceof ApiFail)) console.error('[demo]', error);
        subscriber.error(new HttpErrorResponse({
          status: failure.status,
          error: failure.body('/api' + path),
          url: request.url,
          statusText: failure.body('')['error'],
        }));
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  });
};

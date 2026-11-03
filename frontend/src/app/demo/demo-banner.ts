import { Component, signal } from '@angular/core';
import { resetDemoData } from './demo-backend.interceptor';
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from './demo-seed';

/** Aviso fijo de la demo estática con las cuentas de prueba y un botón para restablecer los datos. */
@Component({
  selector: 'app-demo-banner',
  template: `
    <aside class="demo-banner" [class.closed]="closed()">
      @if (closed()) {
        <button type="button" class="pill" (click)="closed.set(false)">Demo · cuentas de prueba</button>
      } @else {
        <strong>Demo sin servidor</strong>
        <span>
          Los datos viven en tu navegador. Entra con
          @for (account of accounts; track account.email; let last = $last) {
            <code>{{ account.email }}</code>{{ last ? '' : ', ' }}
          }
          y la contraseña <code>{{ password }}</code>.
        </span>
        <button type="button" (click)="reset()">Restablecer datos</button>
        <button type="button" class="close" aria-label="Ocultar aviso de demo" (click)="closed.set(true)">×</button>
      }
    </aside>
  `,
  styles: `
    .demo-banner{position:fixed;left:16px;bottom:16px;z-index:1000;display:flex;align-items:center;gap:12px;width:min(960px,calc(100% - 110px));box-sizing:border-box;padding:10px 12px 10px 16px;border:1px solid #1c2b21;border-radius:16px;background:#e3f2d4;color:#1c2b21;font:12px/1.45 Roboto,Arial,sans-serif;box-shadow:0 12px 32px #1c2b2133}
    .demo-banner.closed{width:auto;padding:0;border:0;background:none;box-shadow:none}
    strong{white-space:nowrap;font-weight:700}
    span{flex:1}
    code{padding:1px 5px;border-radius:6px;background:#ffffffb0;font-size:11px;word-break:break-all}
    button{border:1px solid #1c2b21;border-radius:99px;background:#fff;color:#1c2b21;padding:6px 11px;font:700 11px Roboto,Arial,sans-serif;white-space:nowrap;cursor:pointer}
    .close{border:0;background:none;font-size:18px;line-height:1;padding:2px 6px}
    .pill{background:#e3f2d4;box-shadow:0 8px 20px #1c2b2133}
    @media(max-width:640px){.demo-banner:not(.closed){flex-wrap:wrap;gap:8px;width:calc(100% - 32px);bottom:84px}span{flex-basis:100%;order:2}.close{margin-left:auto}}
  `,
})
export class DemoBanner {
  readonly closed = signal(false);
  readonly accounts = DEMO_ACCOUNTS;
  readonly password = DEMO_PASSWORD;

  reset(): void {
    resetDemoData();
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('type');
    } catch {
      // Sin almacenamiento: la sesión ya era solo de memoria.
    }
    location.reload();
  }
}

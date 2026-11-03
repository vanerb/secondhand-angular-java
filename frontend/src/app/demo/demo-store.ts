import { Row, Tables, demoSeed } from './demo-seed';

const STORAGE_KEY = 'secondhand_demo_db_v1';

const STATUS_TEXT: Record<number, string> = {
  400: 'Bad Request',
  403: 'Forbidden',
  404: 'Not Found',
  500: 'Internal Server Error',
};

/**
 * Error HTTP con el formato de error por defecto de Spring Boot
 * ({timestamp, status, error, message, path}); el interceptor añade timestamp y path.
 */
export class ApiFail {
  constructor(
    readonly status: number,
    readonly message = '',
  ) {}

  body(path: string): Row {
    return {
      timestamp: new Date().toISOString(),
      status: this.status,
      error: STATUS_TEXT[this.status] ?? 'Error',
      message: this.message,
      path,
    };
  }
}

/** Las RuntimeException e IllegalStateException del backend acaban como 500. */
export function fail(message: string, status = 500): never {
  throw new ApiFail(status, message);
}

/**
 * Base de datos en memoria de la demo de GitHub Pages: parte de los datos de muestra y
 * guarda los cambios en localStorage (cada visitante tiene su propia copia).
 */
export class DemoStore {
  private tables: Tables;

  constructor() {
    this.tables = this.read() ?? demoSeed();
  }

  private read(): Tables | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.tables));
    } catch {
      console.warn('[demo] No se pudieron guardar los cambios en localStorage (¿sin espacio?). Siguen en memoria hasta recargar.');
    }
  }

  reset(): void {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Almacenamiento bloqueado: basta con regenerar los datos en memoria.
    }
    this.tables = demoSeed();
  }

  t(name: string): Row[] {
    return (this.tables[name] ??= []);
  }

  find(name: string, id: number): Row | undefined {
    return this.t(name).find((row) => row['id'] === id);
  }

  insert(name: string, row: Row): Row {
    const table = this.t(name);
    const id = table.reduce((max, item) => Math.max(max, Number(item['id']) || 0), 0) + 1;
    const created = { id, ...row };
    table.push(created);
    return created;
  }

  remove(name: string, predicate: (row: Row) => boolean): void {
    this.tables[name] = this.t(name).filter((row) => !predicate(row));
  }
}

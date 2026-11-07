/** Textos en español para los valores que la API guarda en inglés (categoría, estado y disponibilidad). */

const CATEGORY_LABELS: Record<string, string> = {
  ELECTRONICS: 'Electrónica',
  COMPUTERS: 'Informática',
  VIDEO_GAMES: 'Videojuegos',
  MOBILE: 'Móviles',
  CLOTHING: 'Ropa',
  HOME: 'Hogar',
  SPORTS: 'Deporte',
  BOOKS: 'Libros',
  OTHER: 'Otros',
};

const CONDITION_LABELS: Record<string, string> = {
  NEW: 'Nuevo',
  LIKE_NEW: 'Como nuevo',
  GOOD: 'Buen estado',
  USED: 'Usado',
  VERY_USED: 'Muy usado',
};

const AVAILABILITY_LABELS: Record<string, string> = {
  AVAILABLE: 'Disponible',
  RESERVED: 'Reservado',
  SOLD: 'Vendido',
};

const label = (labels: Record<string, string>, value: string | null | undefined): string =>
  value ? labels[value] ?? value : 'Sin especificar';

export const categoryLabel = (value: string | null | undefined) => label(CATEGORY_LABELS, value);
export const conditionLabel = (value: string | null | undefined) => label(CONDITION_LABELS, value);
export const availabilityLabel = (value: string | null | undefined) => label(AVAILABILITY_LABELS, value);

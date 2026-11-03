/**
 * Ilustraciones de la demo: SVG generados como data URL para que los datos de muestra
 * no dependan de la carpeta uploads del backend ni de imágenes externas.
 */
const svg = (body: string) =>
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">${body}</svg>`);

const escape = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Foto de producto: fondo degradado y un emoji grande (el nombre ya aparece en la ficha). */
export function productArt(emoji: string, from: string, to: string, angle = 0): string {
  return svg(`
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1" gradientTransform="rotate(${angle} .5 .5)">
      <stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>
    <rect width="800" height="800" fill="url(#g)"/>
    <circle cx="640" cy="150" r="190" fill="#fff" opacity=".13"/>
    <circle cx="120" cy="700" r="230" fill="#000" opacity=".06"/>
    <ellipse cx="400" cy="600" rx="210" ry="34" fill="#000" opacity=".12"/>
    <text x="400" y="510" font-size="330" text-anchor="middle" font-family="Apple Color Emoji,Segoe UI Emoji,Noto Color Emoji,sans-serif">${emoji}</text>`);
}

/** Avatar con iniciales. */
export function avatarArt(initials: string, from: string, to: string): string {
  return svg(`
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs>
    <rect width="800" height="800" fill="url(#g)"/>
    <text x="400" y="470" font-size="300" text-anchor="middle" fill="#fff" font-family="Roboto,Arial,sans-serif" font-weight="500">${escape(initials)}</text>`);
}

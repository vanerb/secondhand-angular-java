import { environment } from '../../environments/environment';

const API_URL = 'http://localhost:8080';

// En la demo no existe la carpeta uploads del backend: se usa una imagen genérica en línea.
const DEMO_NO_IMAGE =
  'data:image/svg+xml;charset=utf-8,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400"><rect width="400" height="400" fill="#e7ece4"/>' +
      '<circle cx="200" cy="160" r="70" fill="#c4cfbf"/><rect x="90" y="250" width="220" height="90" rx="45" fill="#c4cfbf"/></svg>',
  );

export function getImage(img: string | null | undefined) {
  if (!img) {
    return environment.demo ? DEMO_NO_IMAGE : API_URL + '/uploads/No_Image_Available.jpg';
  }

  // Las imágenes de la demo se guardan como data URL.
  if (/^(data:|blob:|https?:)/.test(img)) {
    return img;
  }

  return API_URL + img;
}

export function sleep(millis: number) {
  return new Promise(resolve => setTimeout(resolve, millis));
}

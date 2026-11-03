import { avatarArt, productArt } from './demo-art';

export type Row = Record<string, any>;
export type Tables = Record<string, Row[]>;

export const DEMO_PASSWORD = 'Demo1234';

/** Cuentas de prueba que se muestran en el aviso de la demo. */
export const DEMO_ACCOUNTS = [
  { email: 'lucia@secondhand.demo', name: 'Lucía' },
  { email: 'marcos@secondhand.demo', name: 'Marcos' },
  { email: 'ana@secondhand.demo', name: 'Ana' },
];

/** Fecha con el formato de LocalDateTime de Spring (sin zona horaria). */
export function localDateTime(date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
  );
}

const ago = (days: number, hours = 0, minutes = 0) =>
  localDateTime(new Date(Date.now() - ((days * 24 + hours) * 60 + minutes) * 60_000));

type SeedProduct = [
  owner: number, name: string, category: string, price: number, condition: string,
  emoji: string, from: string, to: string, description: string,
];

const PRODUCTS: SeedProduct[] = [
  [1, 'Chaqueta vaquera vintage', 'CLOTHING', 45, 'GOOD', '🧥', '#9fb8d9', '#4b6a91',
    'Chaqueta vaquera de los 90, talla M. Lavado clásico y forro en buen estado. Solo tiene un pequeño desgaste en el puño izquierdo.'],
  [1, 'Lámpara de mesa retro', 'HOME', 28, 'LIKE_NEW', '🛋️', '#f4d8a8', '#d69b52',
    'Lámpara de sobremesa con pantalla de lino. Funciona perfectamente, bombilla LED incluida.'],
  [1, 'Bicicleta de paseo', 'SPORTS', 120, 'USED', '🚲', '#bfe3c0', '#4f9a63',
    'Bicicleta urbana con cesta delantera y 6 marchas. Ruedas cambiadas el año pasado.'],
  [1, 'Colección de novelas clásicas', 'BOOKS', 18, 'GOOD', '📚', '#efe3c8', '#b88c52',
    'Lote de 8 novelas clásicas en edición de bolsillo: Austen, Dickens, Galdós y más.'],
  [1, 'Bolso de piel marrón', 'CLOTHING', 35, 'LIKE_NEW', '👜', '#e7c3a1', '#99603b',
    'Bolso bandolera de piel auténtica. Usado dos veces, como nuevo.'],
  [2, 'Nintendo Switch con dos mandos', 'VIDEO_GAMES', 190, 'GOOD', '🎮', '#ffb3b3', '#d9434f',
    'Consola con base, dos Joy-Con y funda de transporte. Sin rayaduras en la pantalla.'],
  [2, 'Auriculares inalámbricos', 'ELECTRONICS', 60, 'LIKE_NEW', '🎧', '#c9c6f5', '#5b55c9',
    'Auriculares con cancelación de ruido y estuche. Batería de unas 30 horas.'],
  [2, 'Portátil 14" para estudiantes', 'COMPUTERS', 320, 'GOOD', '💻', '#cfd8e3', '#5d6f86',
    'Portátil con 16 GB de RAM y SSD de 512 GB. Ideal para clase y ofimática. Incluye cargador.'],
  [2, 'Smartphone 128 GB', 'MOBILE', 210, 'GOOD', '📱', '#b9e4f0', '#3a8fb0',
    'Móvil libre de 128 GB con funda y protector de pantalla. Batería al 89 %.'],
  [2, 'Cámara instantánea', 'ELECTRONICS', 55, 'USED', '📷', '#fde2b5', '#e39a3b',
    'Cámara de fotos instantánea con correa. Se incluye un paquete de carretes a medias.'],
  [3, 'Planta monstera con maceta', 'HOME', 22, 'GOOD', '🪴', '#cde8c4', '#4f8a4a',
    'Monstera deliciosa de un metro con maceta de cerámica blanca. Recogida en mano.'],
  [3, 'Guitarra acústica', 'OTHER', 95, 'GOOD', '🎸', '#f2cfa8', '#a8642f',
    'Guitarra acústica de iniciación con funda acolchada y afinador de pinza.'],
  [3, 'Zapatillas de running talla 39', 'SPORTS', 30, 'USED', '👟', '#ffd1e0', '#d65a87',
    'Zapatillas para correr con amortiguación. Unos 200 km de uso, suela en buen estado.'],
  [3, 'Cafetera italiana de 6 tazas', 'HOME', 15, 'NEW', '☕', '#e8d9cf', '#7d5845',
    'Cafetera de aluminio sin estrenar, todavía en su caja.'],
];

const USERS: Row[] = [
  { name: 'Lucía', cogname: 'Martín', username: 'lucia_vintage', email: 'lucia@secondhand.demo', avatar: ['LM', '#7fb08a', '#2f6b45'] },
  { name: 'Marcos', cogname: 'Ruiz', username: 'marcos_tech', email: 'marcos@secondhand.demo', avatar: ['MR', '#7a9fd6', '#2f4f8a'] },
  { name: 'Ana', cogname: 'Gómez', username: 'ana_lee', email: 'ana@secondhand.demo', avatar: ['AG', '#e0a07c', '#a3532e'] },
];

/** Estado inicial de la base de datos simulada (se regenera al restablecer la demo). */
export function demoSeed(): Tables {
  const users = USERS.map(({ avatar, ...user }, index) => ({
    id: index + 1,
    ...user,
    type: 'USER',
    password: DEMO_PASSWORD,
    profileImage: avatarArt(avatar[0], avatar[1], avatar[2]),
  }));

  const products: Row[] = [];
  const images: Row[] = [];
  PRODUCTS.forEach(([owner, name, category, price, condition, emoji, from, to, description], index) => {
    const id = index + 1;
    products.push({
      id, name, category, price, condition, description,
      availability: 'AVAILABLE', archived: false, userId: owner, createdAt: ago(20 - index),
    });
    images.push({ id: images.length + 1, url: productArt(emoji, from, to), fromType: 'PRODUCT', fromId: id, isCover: true });
    images.push({ id: images.length + 1, url: productArt(emoji, to, from, 90), fromType: 'PRODUCT', fromId: id, isCover: false });
  });

  // Venta en curso: oferta aceptada por la Switch (producto reservado, pago pendiente).
  products[5]['availability'] = 'RESERVED';
  // Venta completada: la lámpara ya se pagó con tarjeta (producto vendido y archivado).
  products[1]['availability'] = 'SOLD';
  products[1]['archived'] = true;

  const conversations: Row[] = [
    { id: 1, user1Id: 2, user2Id: 1, productId: 1, createdAt: ago(3, 5) },
    { id: 2, user1Id: 1, user2Id: 2, productId: 6, createdAt: ago(2, 8) },
    { id: 3, user1Id: 3, user2Id: 1, productId: 2, createdAt: ago(6, 2) },
    { id: 4, user1Id: 1, user2Id: 3, productId: 12, createdAt: ago(1, 3) },
  ];

  const messages: Row[] = [];
  const say = (conversationId: number, senderId: number, content: string, createdAt: string) =>
    messages.push({ id: messages.length + 1, conversationId, senderId, content, createdAt, read: true });
  say(1, 2, '¡Hola! ¿La chaqueta sigue disponible?', ago(3, 5));
  say(1, 1, 'Hola Marcos, sí, sigue disponible 😊', ago(3, 4, 40));
  say(1, 2, '¿Me la dejarías en 35 €? Te he enviado una oferta.', ago(3, 4, 30));
  say(2, 1, 'Hola, me interesa la Switch. ¿Incluye algún juego?', ago(2, 8));
  say(2, 2, 'Solo la consola y los mandos, pero está como nueva.', ago(2, 7, 30));
  say(2, 1, 'Perfecto, te propongo 175 €.', ago(2, 7));
  say(2, 2, 'Trato hecho, acepto la oferta 👍', ago(2, 6));
  say(3, 3, '¡Qué bonita la lámpara! ¿Funciona bien?', ago(6, 2));
  say(3, 1, 'Sí, perfecta. Si quieres te la reservo.', ago(6, 1));
  say(3, 3, 'Pagado con tarjeta, ¡gracias!', ago(5, 20));
  say(4, 1, 'Hola Ana, ¿la guitarra tiene alguna marca o golpe?', ago(1, 3));
  say(4, 3, 'Ninguno, la he usado muy poco. Las cuerdas son nuevas.', ago(1, 2));

  const offers: Row[] = [
    { id: 1, conversationId: 1, productId: 1, senderId: 2, receiverId: 1, amount: 35, status: 'PENDING', createdAt: ago(3, 4, 30), respondedAt: null },
    { id: 2, conversationId: 2, productId: 6, senderId: 1, receiverId: 2, amount: 175, status: 'ACCEPTED', createdAt: ago(2, 7), respondedAt: ago(2, 6) },
    { id: 3, conversationId: 3, productId: 2, senderId: 3, receiverId: 1, amount: 25, status: 'ACCEPTED', createdAt: ago(6, 1), respondedAt: ago(6) },
  ];

  const payments: Row[] = [
    { id: 1, conversationId: 2, productId: 6, offerId: 2, buyerId: 1, sellerId: 2, amount: 175, method: null, status: 'PENDING', createdAt: ago(2, 6), paidAt: null, cancelledAt: null, cardLast4: null },
    { id: 2, conversationId: 3, productId: 2, offerId: 3, buyerId: 3, sellerId: 1, amount: 25, method: 'CARD', status: 'PAID', createdAt: ago(6), paidAt: ago(5, 20), cancelledAt: null, cardLast4: '4242' },
  ];

  const favorites: Row[] = [
    { id: 1, userId: 1, productId: 7 },
    { id: 2, userId: 1, productId: 11 },
    { id: 3, userId: 2, productId: 3 },
    { id: 4, userId: 3, productId: 1 },
    { id: 5, userId: 3, productId: 8 },
  ];

  return { users, products, images, conversations, messages, offers, payments, favorites };
}

import { imageDataUrl } from './demo-files';
import { Row, localDateTime } from './demo-seed';
import { ApiFail, DemoStore, fail } from './demo-store';

/**
 * Réplica en el navegador de la API REST de Spring Boot (mismas rutas, validaciones,
 * mensajes de error y formato JSON) para que la demo de GitHub Pages funcione sin servidor.
 */
export interface DemoRequest {
  method: string;
  path: string;
  query: Record<string, string>;
  /** Cuerpo JSON (@RequestBody). */
  json: Row | null;
  /** Campos de un multipart/form-data (@RequestParam), con valores repetidos. */
  fields: Record<string, string[]>;
  files: Record<string, File[]>;
  token: string | null;
}

export interface DemoResponse {
  status: number;
  body: unknown;
}

interface Ctx extends DemoRequest {
  params: string[];
  viewer: Row | null;
}

type Handler = (ctx: Ctx) => unknown | Promise<unknown>;

const PAGE_SIZE = 20;
const CONDITIONS = ['NEW', 'LIKE_NEW', 'GOOD', 'USED', 'VERY_USED'];
const AVAILABILITIES = ['AVAILABLE', 'RESERVED', 'SOLD'];
const FAKE_HASH = '$2a$10$demo.demo.demo.demo.demo.demo.demo.demo.demo.demo.de';

/** Respuesta sin cuerpo (ResponseEntity.noContent()). */
class NoContent {}

export class DemoApi {
  private readonly routes: { method: string; pattern: RegExp; auth: boolean; handler: Handler }[] = [];

  constructor(readonly db: DemoStore) {
    this.registerRoutes();
  }

  async handle(request: DemoRequest): Promise<DemoResponse> {
    for (const route of this.routes) {
      const match = route.method === request.method && route.pattern.exec(request.path);
      if (!match) continue;
      const viewer = this.resolveUser(request.token);
      // Spring Security: todo lo que no es público exige un token válido (403 sin cuerpo propio).
      if (route.auth && !viewer) throw new ApiFail(403);
      const result = await route.handler({ ...request, params: match.slice(1), viewer });
      this.db.save();
      if (result instanceof NoContent) return { status: 204, body: null };
      return { status: 200, body: result ?? null };
    }
    // Sin controlador: Spring Security responde 403 a las rutas desconocidas no públicas.
    throw new ApiFail(request.path.startsWith('/auth/') ? 404 : 403);
  }

  reset(): void {
    this.db.reset();
  }

  // ---------------------------------------------------------------- sesión

  login(userId: number): string {
    return `demo.${userId}.${Math.random().toString(36).slice(2, 10)}`;
  }

  resolveUser(token: string | null): Row | null {
    const id = /^demo\.(\d+)\./.exec(token ?? '')?.[1];
    return id ? (this.db.find('users', Number(id)) ?? null) : null;
  }

  private me(ctx: Ctx): Row {
    return ctx.viewer ?? fail('Usuario no encontrado');
  }

  // ---------------------------------------------------------------- utilidades

  private on(method: string, path: string, handler: Handler, auth = true): void {
    const pattern = new RegExp('^' + path.replace(/:id/g, '(\\d+)').replace(/:name/g, '([^/]+)') + '$');
    this.routes.push({ method, pattern, auth, handler });
  }

  /** @RequestParam obligatorio: si falta, Spring responde 400. */
  private field(ctx: Ctx, name: string, required = true): string | null {
    const value = ctx.fields[name]?.[0] ?? ctx.query[name];
    if (value === undefined || value === null) {
      if (required) throw new ApiFail(400, `Required parameter '${name}' is not present.`);
      return null;
    }
    return value;
  }

  private longParam(ctx: Ctx, name: string): number {
    const value = Number(this.field(ctx, name));
    if (!Number.isInteger(value)) throw new ApiFail(400, `Failed to convert value of parameter '${name}'.`);
    return value;
  }

  private decimal(value: string | null, name: string): number {
    const number = Number(value);
    if (value === null || value.trim() === '' || !Number.isFinite(number)) {
      throw new ApiFail(400, `Failed to convert value of parameter '${name}'.`);
    }
    return number;
  }

  private enumValue(value: string | null, allowed: string[], name: string): string {
    if (value === null || !allowed.includes(value)) {
      throw new ApiFail(400, `Failed to convert value of parameter '${name}'.`);
    }
    return value;
  }

  private files(ctx: Ctx, name: string): File[] {
    return (ctx.files[name] ?? []).filter((file) => file.size > 0);
  }

  private async upload(file: File, fromType: string, fromId: number, isCover: boolean): Promise<Row> {
    let url: string;
    try {
      url = await imageDataUrl(file);
    } catch {
      fail('No se pudo leer la imagen');
    }
    return this.db.insert('images', { url, fromType, fromId, isCover });
  }

  private imagesOf(fromType: string, fromId: number): Row[] {
    return this.db.t('images').filter((image) => image['fromType'] === fromType && image['fromId'] === fromId);
  }

  private user(id: number, message = 'Usuario no encontrado'): Row {
    return this.db.find('users', id) ?? fail(message);
  }

  private product(id: number, message = 'Product not found'): Row {
    return this.db.find('products', id) ?? fail(message);
  }

  // ---------------------------------------------------------------- formato JSON

  /** Entidad User tal cual la serializa Jackson (incluye el hash de la contraseña). */
  private userEntity(user: Row): Row {
    const { id, name, cogname, type, username, email, profileImage } = user;
    return { id, name, cogname, type, username, email, password: FAKE_HASH, profileImage: profileImage ?? null };
  }

  private userChat(user: Row): Row {
    const { id, username, name, cogname, profileImage } = user;
    return { id, username, name, cogname, profileImage: profileImage ?? null };
  }

  private isFavorite(viewer: Row | null, productId: number): boolean {
    return !!viewer && this.db.t('favorites').some((f) => f['userId'] === viewer['id'] && f['productId'] === productId);
  }

  private productDTO(product: Row, viewer: Row | null): Row {
    const owner = this.user(product['userId']);
    return {
      id: product['id'],
      name: product['name'],
      category: product['category'],
      price: product['price'],
      condition: product['condition'],
      availability: product['availability'],
      userId: owner['id'],
      username: owner['username'],
      images: this.imagesOf('PRODUCT', product['id']).map((image) => image['url']),
      favorite: this.isFavorite(viewer, product['id']),
      description: product['description'],
      archived: product['archived'],
    };
  }

  private conversationDTO(conversation: Row): Row {
    const product = this.product(conversation['productId']);
    return {
      id: conversation['id'],
      user1: this.userChat(this.user(conversation['user1Id'])),
      user2: this.userChat(this.user(conversation['user2Id'])),
      productId: product['id'],
      productName: product['name'],
      productPrice: product['price'],
      productAvailability: product['availability'],
      createdAt: conversation['createdAt'],
    };
  }

  messageDTO(message: Row): Row {
    return {
      id: message['id'],
      conversationId: message['conversationId'],
      sender: this.userChat(this.user(message['senderId'])),
      content: message['content'],
      createdAt: message['createdAt'],
      read: message['read'],
    };
  }

  private offerDTO(offer: Row): Row {
    return {
      id: offer['id'],
      conversationId: offer['conversationId'],
      productId: offer['productId'],
      sender: this.userChat(this.user(offer['senderId'])),
      receiver: this.userChat(this.user(offer['receiverId'])),
      amount: offer['amount'],
      originalPrice: this.product(offer['productId'])['price'],
      status: offer['status'],
      createdAt: offer['createdAt'],
      respondedAt: offer['respondedAt'],
    };
  }

  private paymentDTO(payment: Row): Row {
    return {
      id: payment['id'],
      conversationId: payment['conversationId'],
      productId: payment['productId'],
      offerId: payment['offerId'],
      buyerId: payment['buyerId'],
      sellerId: payment['sellerId'],
      buyerUsername: this.user(payment['buyerId'])['username'],
      sellerUsername: this.user(payment['sellerId'])['username'],
      amount: payment['amount'],
      method: payment['method'],
      status: payment['status'],
      createdAt: payment['createdAt'],
      paidAt: payment['paidAt'],
      cancelledAt: payment['cancelledAt'],
      cardLast4: payment['cardLast4'],
    };
  }

  // ---------------------------------------------------------------- rutas

  private registerRoutes(): void {
    this.authRoutes();
    this.productRoutes();
    this.favoriteRoutes();
    this.imageRoutes();
    this.chatRoutes();
    this.offerRoutes();
    this.paymentRoutes();
  }

  private authRoutes(): void {
    const users = () => this.db.t('users');

    this.on('POST', '/auth/register', async (ctx) => {
      const name = this.field(ctx, 'name')!;
      const cogname = this.field(ctx, 'cogname')!;
      const type = this.field(ctx, 'type')!;
      const username = this.field(ctx, 'username')!;
      const email = this.field(ctx, 'email')!;
      const password = this.field(ctx, 'password')!;
      if (users().some((u) => u['email'] === email)) fail('El email ya está registrado');
      if (users().some((u) => u['username'] === username)) fail('El usuario ya existe');
      const user = this.db.insert('users', { name, cogname, type: type || 'USER', username, email, password, profileImage: null });
      const [image] = this.files(ctx, 'image');
      if (image) user['profileImage'] = (await this.upload(image, 'USER', user['id'], true))['url'];
      return { token: this.login(user['id']) };
    }, false);

    this.on('POST', '/auth/login', (ctx) => {
      const user = users().find((u) => u['email'] === ctx.json?.['email']);
      if (!user || user['password'] !== ctx.json?.['password']) fail('Email o contraseña incorrectos');
      return { token: this.login(user['id']) };
    }, false);

    this.on('GET', '/auth/user', (ctx) => {
      if (!ctx.token) throw new ApiFail(400, "Required request header 'Authorization' is not present.");
      return this.userEntity(this.me(ctx));
    }, false);

    this.on('PUT', '/auth/update', async (ctx) => {
      if (!ctx.token) throw new ApiFail(400, "Required request header 'Authorization' is not present.");
      const user = this.me(ctx);
      const name = this.field(ctx, 'name')!;
      const cogname = this.field(ctx, 'cogname')!;
      const username = this.field(ctx, 'username')!;
      const email = this.field(ctx, 'email')!;
      if (email !== user['email'] && users().some((u) => u['email'] === email)) fail('El email ya está registrado');
      if (username !== user['username'] && users().some((u) => u['username'] === username)) fail('El nombre de usuario ya existe');
      Object.assign(user, { name, cogname, username, email });
      const [image] = this.files(ctx, 'image');
      if (image) user['profileImage'] = (await this.upload(image, 'USER', user['id'], true))['url'];
      return { token: this.login(user['id']) };
    }, false);

    this.on('GET', '/auth/user/:name', (ctx) => {
      const username = decodeURIComponent(ctx.params[0]);
      const user = users().find((u) => u['username'] === username) ?? fail('User not found');
      return this.userEntity(user);
    }, false);
  }

  private productRoutes(): void {
    const products = () => this.db.t('products');

    const list = (ctx: Ctx) => {
      const q = ctx.query;
      const has = (key: string) => q[key] !== undefined && q[key] !== '';
      const like = (value: string, search: string) => value.toLowerCase().includes(search.toLowerCase());
      if (has('condition')) this.enumValue(q['condition'], CONDITIONS, 'condition');
      if (has('availability')) this.enumValue(q['availability'], AVAILABILITIES, 'availability');
      let rows = products().filter((p) =>
        !p['archived'] &&
        (!has('name') || like(p['name'], q['name'])) &&
        (!has('category') || p['category'] === q['category']) &&
        (!has('minPrice') || p['price'] >= Number(q['minPrice'])) &&
        (!has('maxPrice') || p['price'] <= Number(q['maxPrice'])) &&
        (!has('condition') || p['condition'] === q['condition']) &&
        (!has('availability') || p['availability'] === q['availability']) &&
        (!has('userId') || p['userId'] === Number(q['userId'])) &&
        (!has('description') || like(p['description'], q['description'])),
      );
      if (has('sort')) {
        const [field, direction] = q['sort'].split(',');
        const sign = direction?.toLowerCase() === 'desc' ? -1 : 1;
        rows = [...rows].sort((a, b) => {
          const x = a[field];
          const y = b[field];
          return sign * (typeof x === 'number' && typeof y === 'number' ? x - y : String(x ?? '').localeCompare(String(y ?? ''), 'es'));
        });
      }
      const size = Math.max(1, Number(q['size']) || PAGE_SIZE);
      const page = Math.max(0, Number(q['page']) || 0);
      // Serialización de Page de Spring Data (PagedModel): {content, page}.
      return {
        content: rows.slice(page * size, (page + 1) * size).map((p) => this.productDTO(p, ctx.viewer)),
        page: { size, number: page, totalElements: rows.length, totalPages: Math.ceil(rows.length / size) },
      };
    };

    this.on('GET', '/products', list, false);
    this.on('GET', '/products/auth', list);

    this.on('POST', '/products', async (ctx) => {
      const user = this.me(ctx);
      const name = this.field(ctx, 'name')!;
      const category = this.field(ctx, 'category')!;
      const price = this.decimal(this.field(ctx, 'price'), 'price');
      const condition = this.enumValue(this.field(ctx, 'condition'), CONDITIONS, 'condition');
      const availability = this.field(ctx, 'availability', false);
      const description = this.field(ctx, 'description')!;
      const product = this.db.insert('products', {
        name, category, price, condition, description,
        availability: availability ? this.enumValue(availability, AVAILABILITIES, 'availability') : 'AVAILABLE',
        archived: false, userId: user['id'], createdAt: localDateTime(),
      });
      let first = true;
      for (const file of this.files(ctx, 'images')) {
        await this.upload(file, 'PRODUCT', product['id'], first);
        first = false;
      }
      return this.productDTO(product, user);
    });

    // La ficha de un producto es pública, como en el backend.
    this.on('GET', '/products/:id', (ctx) => this.productDTO(this.product(Number(ctx.params[0])), ctx.viewer), false);

    this.on('PUT', '/products/:id', async (ctx) => {
      const user = this.me(ctx);
      const product = this.product(Number(ctx.params[0]));
      const name = this.field(ctx, 'name')!;
      const category = this.field(ctx, 'category')!;
      const price = this.decimal(this.field(ctx, 'price'), 'price');
      const condition = this.enumValue(this.field(ctx, 'condition'), CONDITIONS, 'condition');
      const availability = this.enumValue(this.field(ctx, 'availability'), AVAILABILITIES, 'availability');
      const description = this.field(ctx, 'description')!;
      if (product['userId'] !== user['id']) fail('You do not have permission to modify this product');
      if (product['archived']) fail('El producto está archivado y ya no se puede modificar');
      if (product['availability'] !== 'AVAILABLE') fail('El producto no se puede modificar mientras está reservado o vendido');
      if (availability !== 'AVAILABLE') fail('La disponibilidad de reservado o vendido la gestiona el proceso de compra');
      Object.assign(product, { name, category, price, condition, availability, description });

      const keep = ctx.fields['existingImages'] ?? [];
      this.db.remove('images', (image) =>
        image['fromType'] === 'PRODUCT' && image['fromId'] === product['id'] && !keep.includes(image['url']));
      let hasCover = this.imagesOf('PRODUCT', product['id']).some((image) => image['isCover']);
      for (const file of this.files(ctx, 'images')) {
        await this.upload(file, 'PRODUCT', product['id'], !hasCover);
        hasCover = true;
      }
      return this.productDTO(product, user);
    });

    this.on('DELETE', '/products/:id', (ctx) => {
      const user = this.me(ctx);
      const product = this.product(Number(ctx.params[0]));
      const id = product['id'];
      if (product['userId'] !== user['id']) fail('You do not have permission to modify this product');
      if (product['archived']) fail('Un producto archivado no se puede eliminar');
      const conversations = this.db.t('conversations').filter((c) => c['productId'] === id).map((c) => c['id']);
      this.db.remove('payments', (p) => p['productId'] === id);
      this.db.remove('offers', (o) => o['productId'] === id);
      this.db.remove('messages', (m) => conversations.includes(m['conversationId']));
      this.db.remove('conversations', (c) => c['productId'] === id);
      this.db.remove('favorites', (f) => f['productId'] === id);
      this.db.remove('images', (i) => i['fromType'] === 'PRODUCT' && i['fromId'] === id);
      this.db.remove('products', (p) => p['id'] === id);
      return new NoContent();
    });

    this.on('GET', '/products/user/id/:id', (ctx) =>
      products().filter((p) => p['userId'] === Number(ctx.params[0])).map((p) => this.productDTO(p, ctx.viewer)));

    this.on('GET', '/products/user/:name', (ctx) => {
      const username = decodeURIComponent(ctx.params[0]);
      const owner = this.db.t('users').find((u) => u['username'] === username);
      return products().filter((p) => p['userId'] === owner?.['id']).map((p) => this.productDTO(p, ctx.viewer));
    });

    this.on('GET', '/products/me', (ctx) => {
      const user = this.me(ctx);
      return products().filter((p) => p['userId'] === user['id']).map((p) => this.productDTO(p, user));
    });
  }

  private favoriteRoutes(): void {
    this.on('POST', '/favorites/:id', (ctx) => {
      const user = this.me(ctx);
      const product = this.product(Number(ctx.params[0]));
      if (!this.isFavorite(user, product['id'])) {
        this.db.insert('favorites', { userId: user['id'], productId: product['id'] });
      }
      return null;
    });

    this.on('DELETE', '/favorites/:id', (ctx) => {
      const user = this.me(ctx);
      const product = this.product(Number(ctx.params[0]));
      this.db.remove('favorites', (f) => f['userId'] === user['id'] && f['productId'] === product['id']);
      return new NoContent();
    });

    // ProductFavoriteDTO: el usuario va como entidad completa y las imágenes como entidades Image.
    this.on('GET', '/favorites', (ctx) => {
      const user = this.me(ctx);
      return this.db.t('favorites')
        .filter((f) => f['userId'] === user['id'])
        .map((f) => this.product(f['productId']))
        .map((p) => ({
          id: p['id'],
          name: p['name'],
          category: p['category'],
          price: p['price'],
          condition: p['condition'],
          availability: p['availability'],
          user: this.userEntity(this.user(p['userId'])),
          description: p['description'],
          images: this.imagesOf('PRODUCT', p['id']),
        }));
    });

    this.on('GET', '/favorites/:id/exists', (ctx) => {
      const user = this.me(ctx);
      return this.isFavorite(user, this.product(Number(ctx.params[0]))['id']);
    });
  }

  private imageRoutes(): void {
    this.on('POST', '/images/upload', async (ctx) => {
      const [file] = this.files(ctx, 'file');
      const fromType = this.field(ctx, 'fromType')!;
      const fromId = this.longParam(ctx, 'fromId');
      if (!file) fail('No se recibió ningún archivo');
      return this.upload(file, fromType, fromId, this.field(ctx, 'isCover', false) === 'true');
    });

    this.on('GET', '/images/:name/:id', (ctx) => this.imagesOf(ctx.params[0], Number(ctx.params[1])));
  }

  private conversation(id: number): Row {
    return this.db.find('conversations', id) ?? fail('Conversación no encontrada');
  }

  private participant(conversation: Row, userId: number, message: string): void {
    if (conversation['user1Id'] !== userId && conversation['user2Id'] !== userId) fail(message);
  }

  private chatRoutes(): void {
    this.on('POST', '/chat/conversation', (ctx) => {
      const user1Id = this.longParam(ctx, 'user1Id');
      const user2Id = this.longParam(ctx, 'user2Id');
      const productId = this.longParam(ctx, 'productId');
      if (user1Id === user2Id) fail('No puedes crear una conversación contigo mismo');
      this.user(user1Id);
      this.user(user2Id);
      const product = this.product(productId, 'Producto no encontrado');
      const existing = this.db.t('conversations').find((c) =>
        c['productId'] === productId &&
        ((c['user1Id'] === user1Id && c['user2Id'] === user2Id) || (c['user1Id'] === user2Id && c['user2Id'] === user1Id)));
      if (existing) return this.conversationDTO(existing);
      if (product['archived'] || product['availability'] !== 'AVAILABLE') {
        fail('No se puede iniciar una nueva conversación sobre un producto que no está disponible');
      }
      return this.conversationDTO(this.db.insert('conversations', { user1Id, user2Id, productId, createdAt: localDateTime() }));
    });

    this.on('GET', '/chat/conversations/:id', (ctx) => {
      const user = this.user(Number(ctx.params[0]));
      return this.db.t('conversations')
        .filter((c) => c['user1Id'] === user['id'] || c['user2Id'] === user['id'])
        .map((c) => this.conversationDTO(c));
    });

    this.on('GET', '/chat/conversation/:id/messages', (ctx) => {
      const conversation = this.conversation(Number(ctx.params[0]));
      return this.db.t('messages')
        .filter((m) => m['conversationId'] === conversation['id'])
        .sort((a, b) => a['createdAt'].localeCompare(b['createdAt']))
        .map((m) => this.messageDTO(m));
    });

    this.on('DELETE', '/chat/conversation/:id', (ctx) => {
      const conversation = this.conversation(Number(ctx.params[0]));
      const id = conversation['id'];
      const payment = this.latestPayment(id);
      if (payment?.['status'] === 'PAID') fail('No se puede eliminar una conversación de una venta completada');
      if (payment) {
        Object.assign(this.product(payment['productId']), { availability: 'AVAILABLE', archived: false });
        this.db.remove('payments', (p) => p['id'] === payment['id']);
      }
      this.db.remove('messages', (m) => m['conversationId'] === id);
      this.db.remove('offers', (o) => o['conversationId'] === id);
      this.db.remove('conversations', (c) => c['id'] === id);
      return null;
    });
  }

  /** Equivalente al mensaje STOMP /app/chat.sendMessage (lo usa el WebSocket simulado). */
  sendMessage(conversationId: number, senderId: number, content: string): Row {
    const conversation = this.conversation(conversationId);
    this.user(senderId);
    const message = this.db.insert('messages', {
      conversationId: conversation['id'], senderId, content, createdAt: localDateTime(), read: false,
    });
    this.db.save();
    return this.messageDTO(message);
  }

  private offer(id: number): Row {
    return this.db.find('offers', id) ?? fail('Oferta no encontrada');
  }

  private offerRoutes(): void {
    const notAllowed = 'No tienes permiso para acceder a esta negociación';
    const amountOf = (ctx: Ctx) => {
      const amount = ctx.json?.['amount'];
      return amount === null || amount === undefined || amount === '' ? null : Number(amount);
    };

    this.on('GET', '/chat/conversation/:id/offers', (ctx) => {
      const conversation = this.conversation(Number(ctx.params[0]));
      this.participant(conversation, this.longParam(ctx, 'userId'), notAllowed);
      return this.db.t('offers')
        .filter((o) => o['conversationId'] === conversation['id'])
        .sort((a, b) => a['createdAt'].localeCompare(b['createdAt']) || a['id'] - b['id'])
        .map((o) => this.offerDTO(o));
    });

    this.on('POST', '/chat/conversation/:id/offers', (ctx) => {
      const senderId = ctx.json?.['senderId'];
      if (senderId === null || senderId === undefined) fail('El usuario que realiza la oferta es obligatorio');
      const amount = amountOf(ctx);
      if (amount === null || !(amount > 0)) fail('La oferta debe ser mayor que 0');
      const conversation = this.conversation(Number(ctx.params[0]));
      const sender = this.user(Number(senderId));
      this.participant(conversation, sender['id'], notAllowed);
      if (this.db.t('offers').some((o) => o['conversationId'] === conversation['id'] && o['status'] === 'PENDING')) {
        fail('Ya existe una oferta pendiente. Debes responder a ella antes de realizar otra.');
      }
      const receiverId = conversation['user1Id'] === sender['id'] ? conversation['user2Id'] : conversation['user1Id'];
      const product = this.product(conversation['productId']);
      if (product['availability'] !== 'AVAILABLE' || product['archived']) fail('El producto no está disponible para nuevas ofertas');
      if (amount > product['price']) fail('La oferta no puede ser superior al precio original del producto');
      return this.offerDTO(this.db.insert('offers', {
        conversationId: conversation['id'], productId: product['id'], senderId: sender['id'], receiverId,
        amount, status: 'PENDING', createdAt: localDateTime(), respondedAt: null,
      }));
    });

    this.on('POST', '/chat/offers/:id/accept', (ctx) => {
      const offer = this.offer(Number(ctx.params[0]));
      const userId = this.longParam(ctx, 'userId');
      this.participant(this.conversation(offer['conversationId']), userId, notAllowed);
      if (offer['status'] !== 'PENDING') fail('Esta oferta ya no está pendiente');
      if (offer['receiverId'] !== userId) fail('Solo el destinatario puede aceptar esta oferta');
      const product = this.product(offer['productId']);
      if (product['availability'] !== 'AVAILABLE' || product['archived']) {
        fail('El producto ya no está disponible para completar esta oferta');
      }
      Object.assign(offer, { status: 'ACCEPTED', respondedAt: localDateTime() });
      product['availability'] = 'RESERVED';
      this.createPaymentFromOffer(offer, product);
      return this.offerDTO(offer);
    });

    this.on('POST', '/chat/offers/:id/reject', (ctx) => {
      const offer = this.offer(Number(ctx.params[0]));
      const userId = this.longParam(ctx, 'userId');
      this.participant(this.conversation(offer['conversationId']), userId, notAllowed);
      if (offer['status'] !== 'PENDING') fail('Esta oferta ya no está pendiente');
      if (offer['receiverId'] !== userId) fail('Solo el destinatario puede rechazar esta oferta');
      Object.assign(offer, { status: 'REJECTED', respondedAt: localDateTime() });
      return this.offerDTO(offer);
    });

    this.on('POST', '/chat/offers/:id/counter', (ctx) => {
      const senderId = ctx.json?.['senderId'];
      if (senderId === null || senderId === undefined) fail('El usuario que realiza la contraoferta es obligatorio');
      const previous = this.offer(Number(ctx.params[0]));
      this.participant(this.conversation(previous['conversationId']), Number(senderId), notAllowed);
      if (previous['status'] !== 'PENDING') fail('Solo puedes contraofertar una oferta pendiente');
      if (previous['receiverId'] !== Number(senderId)) fail('Solo el destinatario puede realizar una contraoferta');
      const amount = amountOf(ctx);
      if (amount === null || !(amount > 0)) fail('La contraoferta debe ser mayor que 0');
      const product = this.product(previous['productId']);
      if (product['availability'] === 'SOLD') fail('El producto ya está vendido y no admite nuevas ofertas');
      if (amount > product['price']) fail('La contraoferta no puede ser superior al precio original del producto');
      this.user(Number(senderId));
      Object.assign(previous, { status: 'REJECTED', respondedAt: localDateTime() });
      return this.offerDTO(this.db.insert('offers', {
        conversationId: previous['conversationId'], productId: product['id'], senderId: Number(senderId),
        receiverId: previous['senderId'], amount, status: 'PENDING', createdAt: localDateTime(), respondedAt: null,
      }));
    });
  }

  private latestPayment(conversationId: number): Row | undefined {
    return this.db.t('payments')
      .filter((p) => p['conversationId'] === conversationId)
      .sort((a, b) => b['createdAt'].localeCompare(a['createdAt']) || b['id'] - a['id'])[0];
  }

  private createPaymentFromOffer(offer: Row, product: Row): void {
    const open = this.db.t('payments').some((p) =>
      p['productId'] === product['id'] && ['PENDING', 'CASH_AWAITING_CONFIRMATION'].includes(p['status']));
    if (open) return;
    const sellerId = product['userId'];
    const buyerId = offer['senderId'] === sellerId ? offer['receiverId'] : offer['senderId'];
    this.db.insert('payments', {
      conversationId: offer['conversationId'], productId: product['id'], offerId: offer['id'], buyerId, sellerId,
      amount: offer['amount'], method: null, status: 'PENDING', createdAt: localDateTime(),
      paidAt: null, cancelledAt: null, cardLast4: null,
    });
  }

  private paymentRoutes(): void {
    const notAllowed = 'No tienes permiso para acceder a esta operación';
    const paymentOf = (ctx: Ctx) => this.db.find('payments', Number(ctx.params[0])) ?? fail('Pago no encontrado');
    const markAsPaid = (payment: Row) => {
      Object.assign(payment, { status: 'PAID', paidAt: localDateTime() });
      Object.assign(this.product(payment['productId']), { availability: 'SOLD', archived: true });
    };

    this.on('GET', '/payments/conversation/:id', (ctx) => {
      const conversation = this.conversation(Number(ctx.params[0]));
      const userId = this.longParam(ctx, 'userId');
      const payment = this.latestPayment(conversation['id']);
      if (!payment) return null;
      this.participant(conversation, userId, notAllowed);
      return this.paymentDTO(payment);
    });

    this.on('POST', '/payments/:id/pay', (ctx) => {
      const payment = paymentOf(ctx);
      const userId = this.longParam(ctx, 'userId');
      this.participant(this.conversation(payment['conversationId']), userId, notAllowed);
      if (payment['buyerId'] !== userId) fail('Solo el comprador puede iniciar el pago');
      if (payment['status'] !== 'PENDING') fail('Este pago ya no está pendiente');
      const method = ctx.json?.['method'];
      if (!method) fail('Debes seleccionar un método de pago');
      if (method !== 'CARD' && method !== 'CASH') throw new ApiFail(400, 'JSON parse error: método de pago no válido');
      if (method === 'CARD') {
        const last4 = ctx.json?.['cardLast4'];
        if (typeof last4 !== 'string' || !/^\d{4}$/.test(last4)) fail('Los datos de la tarjeta no son válidos');
        Object.assign(payment, { method: 'CARD', cardLast4: last4 });
        markAsPaid(payment);
      } else {
        Object.assign(payment, { method: 'CASH', status: 'CASH_AWAITING_CONFIRMATION' });
      }
      return this.paymentDTO(payment);
    });

    this.on('POST', '/payments/:id/confirm-cash', (ctx) => {
      const payment = paymentOf(ctx);
      const userId = this.longParam(ctx, 'userId');
      this.participant(this.conversation(payment['conversationId']), userId, notAllowed);
      if (payment['sellerId'] !== userId) fail('Solo el vendedor puede confirmar que ha recibido el efectivo');
      if (payment['status'] !== 'CASH_AWAITING_CONFIRMATION') fail('El pago en efectivo no está pendiente de confirmación');
      markAsPaid(payment);
      return this.paymentDTO(payment);
    });

    this.on('POST', '/payments/:id/cancel', (ctx) => {
      const payment = paymentOf(ctx);
      const userId = this.longParam(ctx, 'userId');
      this.participant(this.conversation(payment['conversationId']), userId, notAllowed);
      if (payment['status'] === 'PAID') fail('Una venta ya pagada no se puede cancelar desde aquí');
      if (payment['status'] === 'CANCELLED') return this.paymentDTO(payment);
      Object.assign(payment, { status: 'CANCELLED', cancelledAt: localDateTime() });
      Object.assign(this.product(payment['productId']), { availability: 'AVAILABLE', archived: false });
      const offer = this.db.find('offers', payment['offerId']);
      if (offer?.['status'] === 'ACCEPTED') Object.assign(offer, { status: 'CANCELLED', respondedAt: localDateTime() });
      return this.paymentDTO(payment);
    });
  }
}

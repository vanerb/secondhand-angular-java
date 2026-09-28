import { Component, OnChanges, OnInit, signal, SimpleChanges } from '@angular/core';
import { Container } from '../../general/container/container';
import { AuthService } from '../../../services/auth-service';
import { ProductService } from '../../../services/product-service';
import { FavoriteService } from '../../../services/favorite-service';
import { CommonModule } from '@angular/common';
import { getImage } from '../../../services/utilities-service';
import { ProductView } from '../products/product-view/product-view';
import { ChatService } from '../../../services/chat-service';

@Component({
  selector: 'app-profile',
  imports: [Container, CommonModule, ProductView],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile implements OnInit {
  user = signal<any | null>(null);

  products = signal<any[]>([]);

  favorites = signal<any[]>([]);

  activeTab = signal<'products' | 'favorites'>('products');

  isLoading = signal(true);

  errorMessage = signal('');

  isOwnProfile = signal(true);

  profileImage = signal('');

  userProductsCount = signal(0);

  constructor(
    private readonly productService: ProductService,
    private readonly favoriteService: FavoriteService,
    private readonly authService: AuthService,
    private readonly chatService: ChatService,
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  // ==========================================
  // PERFIL
  // ==========================================

  loadProfile(): void {
    this.isLoading.set(true);

    const user$ = this.authService.getUserByToken();

    if (!user$) {
      this.errorMessage.set('No se ha podido obtener la información del usuario.');

      this.isLoading.set(false);

      return;
    }

    user$.subscribe({
      next: (user: any) => {
        console.log('USUARIO RECIBIDO:', user);

        this.user.set(user);

        this.profileImage.set(this.getUserImage(user));

        this.isOwnProfile.set(true);

        // Cargar productos y favoritos
        this.loadProducts();
        this.loadFavorites();

        this.isLoading.set(false);
      },

      error: (error) => {
        console.error('ERROR OBTENIENDO USUARIO:', error);

        this.errorMessage.set('No se ha podido cargar la información del perfil.');

        this.isLoading.set(false);
      },
    });
  }

  // ==========================================
  // PRODUCTOS
  // ==========================================

  loadProducts(): void {
    this.productService.getProductsAuth().subscribe({
      next: (products: any) => {
        console.log('PRODUCTOS DEL USUARIO:', products);

        const productList = Array.isArray(products) ? products : (products.content ?? []);

        this.products.set(productList);

        this.userProductsCount.set(productList.length);
      },

      error: (error) => {
        console.error('ERROR CARGANDO PRODUCTOS:', error);

        this.products.set([]);

        this.userProductsCount.set(0);
      },
    });
  }

  // ==========================================
  // FAVORITOS
  // ==========================================

  loadFavorites(): void {
    this.favoriteService.getFavorites().subscribe({
      next: (favorites: any[]) => {
        console.log('FAVORITOS:', favorites);

        const favoriteProducts = favorites.map((favorite: any) => ({
          id: favorite.id,

          name: favorite.name,

          category: favorite.category,

          price: favorite.price,

          condition: favorite.condition,

          availability: favorite.availability,

          userId: favorite.user?.id ?? null,

          username: favorite.user?.username ?? '',

          images: favorite.images?.map((image: any) => image.url) ?? [],

          favorite: true,

          description: favorite.description,
        }));

        this.favorites.set(favoriteProducts);

        // Comprobar chats de los favoritos
        if (this.user()) {
          this.loadChatStatus();
        }
      },

      error: (error) => {
        console.error('ERROR CARGANDO FAVORITOS:', error);

        this.favorites.set([]);
      },
    });
  }

  // ==========================================
  // ESTADO DE CHAT DE FAVORITOS
  // ==========================================

  loadChatStatus(): void {
    const currentUser = this.user();

    if (!currentUser) {
      return;
    }

    this.chatService.getConversations(currentUser.id).subscribe({
      next: (conversations) => {
        this.favorites.update((products) =>
          products.map((product) => ({
            ...product,

            isChat: conversations.some(
              (conversation: any) =>
                ((conversation.user1?.id === currentUser.id &&
                  conversation.user2?.id === product.userId) ||
                  (conversation.user1?.id === product.userId &&
                    conversation.user2?.id === currentUser.id)) &&
                conversation.productId === product.id,
            ),
          })),
        );
      },

      error: (error) => {
        console.error('Error obteniendo conversaciones:', error);
      },
    });
  }

  // ==========================================
  // IMAGEN
  // ==========================================

  getUserImage(user: any): string {
    console.log('IMAGEN USUARIO:', user?.profileImage);

    if (!user?.profileImage) {
      return 'assets/images/default-avatar.png';
    }

    if (user.profileImage.startsWith('http')) {
      return user.profileImage;
    }

    return getImage(user.profileImage);
  }

  getNewImage(name: string): string {
    return getImage(name);
  }
}

import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

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

  // true = /profile
  // false = /profile/:username
  isOwnProfile = signal(true);

  profileImage = signal('');

  userProductsCount = signal(0);

  constructor(
    private readonly productService: ProductService,
    private readonly favoriteService: FavoriteService,
    private readonly authService: AuthService,
    private readonly chatService: ChatService,
    private readonly route: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const username = params.get('username');

      this.resetProfile();

      if (username) {
        // Perfil público
        this.isOwnProfile.set(false);
        this.loadPublicProfile(username);
      } else {
        // Perfil propio
        this.isOwnProfile.set(true);
        this.loadOwnProfile();
      }
    });
  }

  resetProfile(): void {
    this.user.set(null);
    this.products.set([]);
    this.favorites.set([]);
    this.profileImage.set('');
    this.userProductsCount.set(0);
    this.errorMessage.set('');
    this.activeTab.set('products');
    this.isLoading.set(true);
  }

  // ==========================================
  // PERFIL PROPIO
  // ==========================================

  loadOwnProfile(): void {
    this.isLoading.set(true);

    const user$ = this.authService.getUserByToken();

    if (!user$) {
      this.errorMessage.set('No se ha podido obtener la información del usuario.');

      this.isLoading.set(false);
      return;
    }

    user$.subscribe({
      next: (user: any) => {
        console.log('USUARIO PROPIO:', user);

        this.user.set(user);
        this.profileImage.set(this.getUserImage(user));

        this.loadMyProducts();
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
  // PERFIL PÚBLICO
  // ==========================================

  loadPublicProfile(username: string): void {
    console.log('CARGANDO PERFIL PÚBLICO:', username);

    this.authService.getUserByUsername(username).subscribe({
      next: (user: any) => {
        console.log('USUARIO PÚBLICO:', user);

        this.user.set(user);
        this.profileImage.set(this.getUserImage(user));

        this.loadPublicProducts(username);

        this.isLoading.set(false);
      },

      error: (error) => {
        console.error('ERROR OBTENIENDO PERFIL PÚBLICO:', error);

        this.user.set(null);
        this.products.set([]);
        this.userProductsCount.set(0);

        this.errorMessage.set('No se ha podido cargar el perfil.');

        this.isLoading.set(false);
      },
    });
  }

  // ==========================================
  // PRODUCTOS PROPIOS
  // ==========================================

  loadMyProducts(): void {
    this.productService.getMyProducts().subscribe({
      next: (products: any) => {
        console.log('MIS PRODUCTOS:', products);

        const productList = Array.isArray(products) ? products : (products.content ?? []);

        this.products.set(productList);

        this.userProductsCount.set(productList.length);
      },

      error: (error) => {
        console.error('ERROR CARGANDO MIS PRODUCTOS:', error);

        this.products.set([]);
        this.userProductsCount.set(0);
      },
    });
  }

  // ==========================================
  // PRODUCTOS PERFIL PÚBLICO
  // ==========================================

  loadPublicProducts(username: string): void {
    this.productService.getProductsByUsername(username).subscribe({
      next: (products: any) => {
        console.log('PRODUCTOS DEL PERFIL PÚBLICO:', products);

        const productList = Array.isArray(products) ? products : (products?.content ?? []);

        this.products.set(productList);

        this.userProductsCount.set(productList.length);

        // Comprobar los chats del usuario que está logueado
        this.loadPublicChatStatus(productList);
      },

      error: (error) => {
        console.error('ERROR CARGANDO PRODUCTOS PÚBLICOS:', error);

        this.products.set([]);
        this.userProductsCount.set(0);
      },
    });
  }

  // ==========================================
  // ESTADO CHAT EN PERFIL PÚBLICO
  // ==========================================

  loadPublicChatStatus(products: any[]): void {
    const currentUser$ = this.authService.getUserByToken();

    if (!currentUser$) {
      return;
    }

    currentUser$.subscribe({
      next: (currentUser: any) => {
        if (!currentUser) {
          return;
        }

        this.chatService.getConversations(currentUser.id).subscribe({
          next: (conversations) => {
            const updatedProducts = products.map((product: any) => ({
              ...product,

              isChat: conversations.some(
                (conversation: any) =>
                  ((conversation.user1?.id === currentUser.id &&
                    conversation.user2?.id === product.userId) ||
                    (conversation.user2?.id === currentUser.id &&
                      conversation.user1?.id === product.userId)) &&
                  conversation.productId === product.id,
              ),
            }));

            this.products.set(updatedProducts);
          },

          error: (error) => {
            console.error('ERROR OBTENIENDO CONVERSACIONES:', error);
          },
        });
      },

      error: (error) => {
        console.error('ERROR OBTENIENDO USUARIO ACTUAL:', error);
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

        this.loadChatStatus();
      },

      error: (error) => {
        console.error('ERROR CARGANDO FAVORITOS:', error);

        this.favorites.set([]);
      },
    });
  }

  // ==========================================
  // ESTADO CHAT DE FAVORITOS
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
        console.error('ERROR OBTENIENDO CONVERSACIONES:', error);
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

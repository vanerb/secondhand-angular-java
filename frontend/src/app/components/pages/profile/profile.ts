import { ChangeDetectorRef, Component } from '@angular/core';
import { Container } from '../../general/container/container';
import { AuthService } from '../../../services/auth-service';
import { ProductService } from '../../../services/product-service';
import { FavoriteService } from '../../../services/favorite-service';
import { CommonModule } from '@angular/common';
import { getImage, sleep } from '../../../services/utilities-service';
import { ProductCard } from '../products/product-card/product-card';
import { ProductView } from '../products/product-view/product-view';
import { ChatService } from '../../../services/chat-service';

@Component({
  selector: 'app-profile',
  imports: [Container, CommonModule, ProductCard, ProductView],
  templateUrl: './profile.html',
  styleUrl: './profile.css',
})
export class Profile {
  user: any = null;

  products: any[] = [];

  favorites: any[] = [];

  activeTab: 'products' | 'favorites' = 'products';

  isLoading = true;

  errorMessage = '';

  isOwnProfile = true;

  profileImage = '';

  userProductsCount = 0;

  constructor(
    private readonly productService: ProductService,
    private readonly favoriteService: FavoriteService,
    private readonly authService: AuthService,
  
    private readonly chatService: ChatService,
  ) {}

  async ngOnInit() {
    this.loadProfile();
  }

  async loadProfile(): Promise<void> {
    this.isLoading = true;

    const user$ = this.authService.getUserByToken();

    if (!user$) {
      this.errorMessage = 'No se ha podido obtener la información del usuario.';
      this.isLoading = false;
      return;
    }

    user$.subscribe({
      next: (user: any) => {
        console.log('USUARIO RECIBIDO:', user);

        this.user = user;

        // IMPORTANTE:
        // En tu Header utilizas user.profileImage
        this.profileImage = this.getUserImage(user);

        this.isOwnProfile = true;

        // Cargar productos y favoritos
        this.loadProducts();

        this.loadFavorites();

        this.isLoading = false;

      
      },

      error: (error) => {
        console.error('ERROR OBTENIENDO USUARIO:', error);

        this.errorMessage = 'No se ha podido cargar la información del perfil.';

        this.isLoading = false;

       
      },
    });
  }

  async loadProducts() {
     this.productService.getProductsAuth().subscribe({
      next: async (products: any) => {
        console.log('PRODUCTOS DEL USUARIO:', products);

        this.products = Array.isArray(products) ? products : (products.content ?? []);

        this.userProductsCount = this.products.length;

       
      },

      error: (error) => {
        console.error('ERROR CARGANDO PRODUCTOS:', error);

        this.products = [];

        this.userProductsCount = 0;
      },
    });
  }

  loadFavorites(): void {
    this.favoriteService.getFavorites().subscribe({
      next: (favorites: any[]) => {
        console.log('FAVORITOS:', favorites);

        this.favorites = favorites.map((favorite: any) => ({
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

        // Primero cargamos los productos y después sus chats
        if (this.user) {
          this.loadChatStatus();
        }

        
      },

      error: (error) => {
        console.error('ERROR CARGANDO FAVORITOS:', error);

        this.favorites = [];
      },
    });
  }

  loadChatStatus() {
    this.chatService.getConversations(this.user.id).subscribe({
      next: (conversations) => {
        this.favorites = this.favorites.map((product) => ({
          ...product,

          isChat: conversations.some(
            (conversation) =>
              ((conversation.user1?.id === this.user.id &&
                conversation.user2?.id === product.userId) ||
                (conversation.user1?.id === product.userId &&
                  conversation.user2?.id === this.user.id)) &&
              conversation.productId === product.id,
          ),
        }));

    
      },

      error: (error) => {
        console.error('Error obteniendo conversaciones:', error);
      },
    });
  }

  getUserImage(user: any): string {
    console.log('IMAGEN USUARIO:', user?.profileImage);

    if (!user?.profileImage) {
      return 'assets/images/default-avatar.png';
    }

    // Si ya viene como URL completa
    if (user.profileImage.startsWith('http')) {
      return user.profileImage;
    }

    // Igual que haces en Header
    return getImage(user.profileImage);
  }

  getNewImage(name: string) {
    return getImage(name);
  }
}

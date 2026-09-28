import { Component, OnInit, signal } from '@angular/core';
import { FavoriteService } from '../../../services/favorite-service';
import { AuthService } from '../../../services/auth-service';
import { ProductCard } from '../products/product-card/product-card';
import { Container } from '../../general/container/container';
import { RouterLink } from '@angular/router';
import { JsonPipe } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { ChatService } from '../../../services/chat-service';
import { ProductView } from '../products/product-view/product-view';

@Component({
  selector: 'app-favorites',
  imports: [ProductCard, Container, RouterLink, JsonPipe, ProductView],
  templateUrl: './favorites.html',
  styleUrl: './favorites.css',
})
export class Favorites implements OnInit {
  favoriteProducts = signal<any[]>([]);

  user = signal<any>(null);

  constructor(
    private favoriteService: FavoriteService,
    private authService: AuthService,
    private chatService: ChatService,
  ) {}

  async ngOnInit(): Promise<void> {
    if (this.authService.getToken()) {
      const user$ = this.authService.getUserByToken();

      if (user$) {
        const user = await firstValueFrom(user$);
        this.user.set(user);
      }
    }

    this.loadFavorites();
  }

  loadChatStatus(): void {
    const currentUser = this.user();

    if (!currentUser) {
      return;
    }

    this.chatService.getConversations(currentUser.id).subscribe({
      next: (conversations) => {
        this.favoriteProducts.update((products) =>
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

  loadFavorites(): void {
    this.favoriteService.getFavorites().subscribe({
      next: (favorites) => {
        const products = favorites.map((favorite: any) => ({
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

        this.favoriteProducts.set(products);

        // Primero cargamos los productos
        // y después comprobamos sus chats.
        if (this.user()) {
          this.loadChatStatus();
        }
      },

      error: (error) => {
        console.error('Error cargando favoritos:', error);

        this.favoriteProducts.set([]);
      },
    });
  }

  action(action: any): void {
    console.log(action);

    switch (action.name) {
      case 'update_interest':
        this.updateInterest(action.item);
        break;
    }
  }

  updateInterest(product: any): void {
    const currentUser = this.user();

    if (!currentUser) {
      return;
    }

    const user1Id = product.userId;
    const user2Id = currentUser.id;

    this.chatService.toggleConversation(user2Id, user1Id, product.id).subscribe({
      next: (result) => {
        console.log('Conversación:', result);

        this.favoriteProducts.update((products) =>
          products.map((p) =>
            p.id === product.id
              ? {
                  ...p,
                  isChat: result.action === 'created',
                }
              : p,
          ),
        );
      },

      error: (error) => {
        console.error('Error al crear conversación:', error);
      },
    });
  }
}

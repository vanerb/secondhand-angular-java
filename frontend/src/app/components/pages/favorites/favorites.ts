import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { FavoriteService } from '../../../services/favorite-service';
import { ProductService } from '../../../services/product-service';
import { AuthService } from '../../../services/auth-service';
import { Product } from '../../../interfaces/product';
import { ProductCard } from '../products/product-card/product-card';
import { Container } from '../../general/container/container';
import { RouterLink } from '@angular/router';
import { JsonPipe } from '@angular/common';
import { getImage, sleep } from '../../../services/utilities-service';
import { firstValueFrom } from 'rxjs';
import { ChatService } from '../../../services/chat-service';
import { ModalService } from '../../../services/modal-service';
import { CreateProduct } from '../products/create-product/create-product';
import { ProductView } from '../products/product-view/product-view';

@Component({
  selector: 'app-favorites',
  imports: [ProductCard, Container, RouterLink, JsonPipe, ProductView],
  templateUrl: './favorites.html',
  styleUrl: './favorites.css',
})
export class Favorites implements OnInit {
  favoriteProducts: any[] = [];
  user!: any;

  constructor(
    private favoriteService: FavoriteService,
    private productService: ProductService,
    private authService: AuthService,

    private chatService: ChatService,
    private modalService: ModalService,
  ) {}

  async ngOnInit(): Promise<void> {
    if (this.authService.getToken()) {
      const user$ = this.authService.getUserByToken();
      if (user$) {
        this.user = await firstValueFrom(user$);
      }
    }

    this.loadFavorites();

 
  }

  loadChatStatus() {
    this.chatService.getConversations(this.user.id).subscribe({
      next: (conversations) => {
        this.favoriteProducts = this.favoriteProducts.map((product) => ({
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

  loadFavorites(): void {
    this.favoriteService.getFavorites().subscribe({
      next: (favorites) => {
        this.favoriteProducts = favorites.map((favorite: any) => ({
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
        console.error('Error cargando favoritos:', error);
        this.favoriteProducts = [];
      },
    });
  }

  action(action: any) {
    console.log(action);
    switch (action.name) {
      case 'update_interest':
        this.updateInterest(action.item);
        break;
    }
  }

  updateInterest(product: any) {
    const user1Id = product.userId;
    const user2Id = this.user.id;

    this.chatService.toggleConversation(user2Id, user1Id, product.id).subscribe({
      next: (result) => {
        console.log('Conversación:', result);

        const index = this.favoriteProducts.findIndex((p: any) => p.id === product.id);

        if (index !== -1) {
          this.favoriteProducts[index] = {
            ...this.favoriteProducts[index],
            isChat: result.action === 'created',
          };

          this.favoriteProducts = [...this.favoriteProducts];

         
        }
      },

      error: (error) => {
        console.error('Error al crear conversación:', error);
      },
    });
  }
}

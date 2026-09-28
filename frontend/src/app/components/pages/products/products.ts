
import { Component, Input, OnInit, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { ModalService } from '../../../services/modal-service';
import { ProductService } from '../../../services/product-service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth-service';
import { FavoriteService } from '../../../services/favorite-service';
import { ChatService } from '../../../services/chat-service';

import { Container } from '../../general/container/container';
import { ProductView } from './product-view/product-view';

@Component({
  selector: 'app-products',
  imports: [
    Container,
    CommonModule,
    ProductView
  ],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products implements OnInit {

  @Input() isContainer = false;

  /**
   * Estado reactivo de los productos.
   *
   * Al estar leído desde la plantilla mediante products(),
   * Angular sabe que debe actualizar la vista cuando cambia.
   */
  products = signal<any[]>([]);

  user: any = null;

  constructor(
    private modalService: ModalService,
    private productService: ProductService,
    private authService: AuthService,
    private favoriteService: FavoriteService,
    private chatService: ChatService,
  ) {}

  async ngOnInit(): Promise<void> {

    if (this.authService.getToken()) {

      const user$ = this.authService.getUserByToken();

      if (user$) {
        this.user = await firstValueFrom(user$);
      }
    }

    this.updateLayaout();
  }

  loadChatStatus(): void {

    if (!this.user) {
      return;
    }

    this.chatService.getConversations(this.user.id).subscribe({

      next: (conversations) => {

        this.products.update((products) =>
          products.map((product) => ({
            ...product,

            isChat: conversations.some(
              (conversation: any) =>
                (
                  (
                    conversation.user1?.id === this.user.id &&
                    conversation.user2?.id === product.userId
                  )
                  ||
                  (
                    conversation.user1?.id === product.userId &&
                    conversation.user2?.id === this.user.id
                  )
                )
                &&
                conversation.productId === product.id
            ),
          }))
        );

      },

      error: (error) => {
        console.error(
          'Error obteniendo conversaciones:',
          error
        );
      },

    });
  }

  updateLayaout(): void {

    const request = this.user
      ? this.productService.getProductsAuth()
      : this.productService.getProducts();

    request.subscribe({

      next: (response) => {

        const products = response.content ?? response ?? [];

        this.products.set(products);

        console.log(
          'PRODUCTOS:',
          this.products()
        );

        if (this.user) {
          this.loadChatStatus();
        }
      },

      error: (error) => {
        console.error(
          'Error al obtener productos:',
          error
        );
      },

    });
  }
}


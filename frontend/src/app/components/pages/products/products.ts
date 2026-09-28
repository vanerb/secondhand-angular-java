import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { ModalService } from '../../../services/modal-service';
import { CreateProduct } from './create-product/create-product';
import { ChipCategory } from '../home/chip-category/chip-category';
import { ProductCard } from './product-card/product-card';
import { Container } from '../../general/container/container';
import { ProductService } from '../../../services/product-service';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth-service';
import { firstValueFrom } from 'rxjs';
import { sleep } from '../../../services/utilities-service';
import { FavoriteService } from '../../../services/favorite-service';
import { ChatService } from '../../../services/chat-service';
import { UpdateProduct } from './update-product/update-product';
import { ProductView } from './product-view/product-view';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  condition: string;
  seller: string;
  image: string;
  badge?: string;
  favorite: boolean;
  interested: boolean;
}

@Component({
  selector: 'app-products',
  imports: [Container, CommonModule, ProductView],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products implements OnInit {
  @Input() isContainer: boolean = false;

  products: any[] = [];

  user!: any;

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

  loadChatStatus() {
    this.chatService.getConversations(this.user.id).subscribe({
      next: (conversations) => {
        this.products = this.products.map((product) => ({
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

  updateLayaout() {
    const request = this.user
      ? this.productService.getProductsAuth()
      : this.productService.getProducts();

    request.subscribe({
      next: (response) => {
        this.products = response.content ?? response;

        console.log('PRODUCTOS:', this.products);

        if (this.user) {
          this.loadChatStatus();
        }
      },

      error: (error) => {
        console.error('Error al obtener productos:', error);
      },
    });
  }
}

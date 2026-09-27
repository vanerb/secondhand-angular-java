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
  imports: [ChipCategory, ProductCard, Container, CommonModule],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products implements OnInit {
  @Input() isHome: boolean = false;

  query = '';
  activeCategory = 'Todo';

  readonly categories = [
    { name: 'Todo', value: '', icon: 'bi-grid' },
    { name: 'Electrónica', value: 'ELECTRONICS', icon: 'bi-headphones' },
    { name: 'Informática', value: 'COMPUTERS', icon: 'bi-pc-display' },
    { name: 'Videojuegos', value: 'VIDEO_GAMES', icon: 'bi-controller' },
    { name: 'Móviles', value: 'MOBILE', icon: 'bi-phone' },
    { name: 'Ropa', value: 'CLOTHING', icon: 'bi-bag' },
    { name: 'Hogar', value: 'HOME', icon: 'bi-lamp' },
    { name: 'Deporte', value: 'SPORTS', icon: 'bi-bicycle' },
    { name: 'Libros', value: 'BOOKS', icon: 'bi-book' },
    { name: 'Otros', value: 'OTHER', icon: 'bi-three-dots' },
  ];

  products: any[] = [];

  user!: any;

  constructor(
    private modalService: ModalService,
    private productService: ProductService,
    private authService: AuthService,
    private favoriteService: FavoriteService,
    private chatService: ChatService,
    private cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit(): Promise<void> {
    if (this.authService.getToken()) {
      const user$ = this.authService.getUserByToken();
      if (user$) {
        this.user = await firstValueFrom(user$);
      }
    }

    this.updateLayaout();

    await sleep(1000);
    this.cdr.detectChanges();
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

        this.cdr.detectChanges();
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

  get filteredProducts(): Product[] {
    const term = this.query.trim().toLocaleLowerCase('es');
    return this.products.filter((product) => {
      const matchesCategory =
        this.activeCategory === 'Todo' || product.category === this.activeCategory;
      const matchesQuery =
        !term ||
        `${product.name} ${product.category} ${product.seller}`
          .toLocaleLowerCase('es')
          .includes(term);
      return matchesCategory && matchesQuery;
    });
  }

  onSearch(event: Event): void {
    this.query = (event.target as HTMLInputElement).value;
  }

  clearFilters(): void {
    this.query = '';
    this.activeCategory = 'Todo';
  }

  action(action: any) {
    console.log(action);
    switch (action.name) {
      case 'update':
        this.updateProduct(action.item);
        break;
      case 'delete':
        this.removeProduct(action.item);
        break;
      case 'update_favorite':
        this.updateFavorite(action.item);
        break;
      case 'update_interest':
        this.updateInterest(action.item);
        break;
    }
  }

  createProduct() {
    this.modalService
      .open(
        CreateProduct,
        {
          width: '180vh',
          height: '90vh',
        },
        {},
      )
      .then((formData: FormData) => {
        this.productService.createProduct(formData).subscribe({
          next: (product) => {
            console.log('Producto creado:', product);

            this.products.unshift(product);
            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Error al crear producto:', error);
          },
        });
      })
      .catch(() => {
        this.modalService.close();
      });
  }

  updateFavorite(product: any) {
    this.favoriteService.toggleFavorite(product).subscribe({
      next: () => {
        const index = this.products.findIndex((p: any) => p.id === product.id);

        if (index !== -1) {
          this.products[index] = {
            ...this.products[index],
            favorite: !this.products[index].favorite,
          };

          this.products = [...this.products];

          this.cdr.detectChanges();
        }
      },

      error: (error) => {
        console.error('Error al añadir a favoritos:', error);
      },
    });
  }

  updateInterest(product: any) {
    const user1Id = product.userId;
    const user2Id = this.user.id;

    this.chatService.toggleConversation(user2Id, user1Id, product.id).subscribe({
      next: (result) => {
        console.log('Conversación:', result);

        const index = this.products.findIndex((p: any) => p.id === product.id);

        if (index !== -1) {
          this.products[index] = {
            ...this.products[index],
            isChat: result.action === 'created',
          };

          this.products = [...this.products];

          this.cdr.detectChanges();
        }
      },

      error: (error) => {
        console.error('Error al crear conversación:', error);
      },
    });
  }

  updateProduct(product: any) {
    this.modalService
      .open(
        UpdateProduct,
        {
          width: '180vh',
          height: '90vh',
        },
        {
          item: product,
        },
      )
      .then((formData: FormData) => {
        this.productService.updateProduct(product.id, formData).subscribe({
          next: (product) => {
            console.log('Producto actualizado:', product);

            const index = this.products.findIndex((p) => p.id === product.id);

            if (index !== -1) {
              this.products[index] = product;
            }

            this.cdr.detectChanges();
          },
          error: (error) => {
            console.error('Error al crear producto:', error);
          },
        });
      })
      .catch(() => {
        this.modalService.close();
      });
  }

  removeProduct(product: any) {
    if (!confirm(`¿Seguro que quieres eliminar "${product.name}"?`)) {
      return;
    }

    this.productService.deleteProduct(product.id).subscribe({
      next: () => {
        this.products = this.products.filter((p) => p.id !== product.id);
        this.cdr.detectChanges();

        console.log('Producto eliminado');
      },
      error: (error) => {
        console.error('Error al eliminar producto:', error);
      },
    });
  }

  removeChat(product: any) {
    console.log('Eliminar chat del producto:', product);
  }
}

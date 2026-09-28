import { ChangeDetectorRef, Component, Input } from '@angular/core';
import { ModalService } from '../../../../services/modal-service';
import { ProductService } from '../../../../services/product-service';
import { AuthService } from '../../../../services/auth-service';
import { FavoriteService } from '../../../../services/favorite-service';
import { ChatService } from '../../../../services/chat-service';
import { firstValueFrom } from 'rxjs';
import { sleep } from '../../../../services/utilities-service';
import { Product } from '../../../../interfaces/product';
import { CreateProduct } from '../create-product/create-product';
import { UpdateProduct } from '../update-product/update-product';
import { ProductCard } from '../product-card/product-card';
import { ChipCategory } from '../../home/chip-category/chip-category';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-product-view',
  imports: [ProductCard, ChipCategory, CommonModule],
  templateUrl: './product-view.html',
  styleUrl: './product-view.css',
})
export class ProductView {
  @Input() products: any[] = [];
  @Input() readOnly = false;
  @Input() cardsOnly = false;

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
  }

  get filteredProducts(): Product[] {
    const products = this.products ?? [];

    const term = this.query.trim().toLocaleLowerCase('es');

    return products.filter((product: any) => {
      const matchesCategory =
        this.activeCategory === 'Todo' || product.category === this.activeCategory;

      const matchesQuery =
        !term ||
        `${product.name ?? ''} ${product.category ?? ''} ${product.seller ?? ''}`
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
      

        console.log('Producto eliminado');
      },
      error: (error) => {
        console.error('Error al eliminar producto:', error);
      },
    });
  }
}

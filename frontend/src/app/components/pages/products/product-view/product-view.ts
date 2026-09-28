import { Component, Input, OnInit, signal } from '@angular/core';

import { ModalService } from '../../../../services/modal-service';
import { ProductService } from '../../../../services/product-service';
import { AuthService } from '../../../../services/auth-service';
import { FavoriteService } from '../../../../services/favorite-service';
import { ChatService } from '../../../../services/chat-service';

import { firstValueFrom } from 'rxjs';

import { Product } from '../../../../interfaces/product';

import { CreateProduct } from '../create-product/create-product';
import { UpdateProduct } from '../update-product/update-product';
import { ProductCard } from '../product-card/product-card';
import { ChipCategory } from '../../home/chip-category/chip-category';

import { CommonModule } from '@angular/common';
import { WarningModal } from '../../../general/warning-modal/warning-modal';
import { Router } from '@angular/router';

@Component({
  selector: 'app-product-view',
  imports: [ProductCard, ChipCategory, CommonModule],
  templateUrl: './product-view.html',
  styleUrl: './product-view.css',
})
export class ProductView implements OnInit {
  /**
   * Estado interno de los productos.
   */
  private readonly productsState = signal<any[]>([]);

  /**
   * Input de productos.
   */
  @Input()
  set products(value: any[]) {
    this.productsState.set(value ?? []);
  }

  get products(): any[] {
    return this.productsState();
  }

  /**
   * Configuración de la vista.
   */
  @Input() readOnly = false;
  @Input() cardsOnly = false;

  /**
   * Usuario logueado.
   */
  user = signal<any | null>(null);

  /**
   * Filtros.
   */
  query = '';
  activeCategory = 'Todo';

  /**
   * Categorías.
   */
  readonly categories = [
    {
      name: 'Todo',
      value: 'Todo',
      icon: 'bi-grid',
    },
    {
      name: 'Electrónica',
      value: 'ELECTRONICS',
      icon: 'bi-headphones',
    },
    {
      name: 'Informática',
      value: 'COMPUTERS',
      icon: 'bi-pc-display',
    },
    {
      name: 'Videojuegos',
      value: 'VIDEO_GAMES',
      icon: 'bi-controller',
    },
    {
      name: 'Móviles',
      value: 'MOBILE',
      icon: 'bi-phone',
    },
    {
      name: 'Ropa',
      value: 'CLOTHING',
      icon: 'bi-bag',
    },
    {
      name: 'Hogar',
      value: 'HOME',
      icon: 'bi-lamp',
    },
    {
      name: 'Deporte',
      value: 'SPORTS',
      icon: 'bi-bicycle',
    },
    {
      name: 'Libros',
      value: 'BOOKS',
      icon: 'bi-book',
    },
    {
      name: 'Otros',
      value: 'OTHER',
      icon: 'bi-three-dots',
    },
  ];

  constructor(
    private modalService: ModalService,
    private productService: ProductService,
    private authService: AuthService,
    private favoriteService: FavoriteService,
    private chatService: ChatService,
    private router: Router,
  ) {}

  // ==========================================
  // INICIALIZACIÓN
  // ==========================================

  async ngOnInit(): Promise<void> {
    if (!this.authService.getToken()) {
      return;
    }

    const user$ = this.authService.getUserByToken();

    if (!user$) {
      return;
    }

    const user = await firstValueFrom(user$);

    this.user.set(user);
  }

  // ==========================================
  // PRODUCTOS FILTRADOS
  // ==========================================

  get filteredProducts(): Product[] {
    const products = this.productsState();

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

  // ==========================================
  // BÚSQUEDA
  // ==========================================

  onSearch(event: Event): void {
    this.query = (event.target as HTMLInputElement).value;
  }

  clearFilters(): void {
    this.query = '';
    this.activeCategory = 'Todo';
  }

  // ==========================================
  // ACCIONES
  // ==========================================

  action(action: any): void {
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

      case 'view':
        this.viewProduct(action.item);
        break;
    }
  }

  // ==========================================
  // CREAR PRODUCTO
  // ==========================================

  createProduct(): void {
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

            this.productsState.update((products) => [product, ...products]);
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

  // ==========================================
  // FAVORITO
  // ==========================================

  updateFavorite(product: any): void {
    this.favoriteService.toggleFavorite(product).subscribe({
      next: () => {
        this.productsState.update((products) =>
          products.map((item) => {
            if (item.id !== product.id) {
              return item;
            }

            return {
              ...item,
              favorite: !item.favorite,
            };
          }),
        );
      },

      error: (error) => {
        console.error('Error al añadir a favoritos:', error);
      },
    });
  }

  // ==========================================
  // INTERÉS / CHAT
  // ==========================================

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

        this.productsState.update((products) =>
          products.map((item) => {
            if (item.id !== product.id) {
              return item;
            }

            return {
              ...item,
              isChat: result.action === 'created',
            };
          }),
        );
      },

      error: (error) => {
        console.error('Error al crear conversación:', error);
      },
    });
  }

  // ==========================================
  // ACTUALIZAR PRODUCTO
  // ==========================================

  updateProduct(product: any): void {
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
          next: (updatedProduct) => {
            console.log('Producto actualizado:', updatedProduct);

            this.productsState.update((products) =>
              products.map((item) => (item.id === updatedProduct.id ? updatedProduct : item)),
            );
          },

          error: (error) => {
            console.error('Error al actualizar producto:', error);
          },
        });
      })
      .catch(() => {
        this.modalService.close();
      });
  }

  // ==========================================
  // ELIMINAR PRODUCTO
  // ==========================================

  removeProduct(product: any): void {
    this.modalService
      .open(
        WarningModal,
        { width: '60vh' },
        {
          props: {
            title: 'Eliminar',
            message: `¿Está seguro de que quiere eliminar ${product.name}?`,
            type: 'delete',
          },
        },
      )
      .then(() => {
        this.productService.deleteProduct(product.id).subscribe({
          next: () => {
            this.productsState.update((products) =>
              products.filter((item) => item.id !== product.id),
            );

            console.log('Producto eliminado');
          },

          error: (error) => {
            console.error('Error al eliminar producto:', error);
          },
        });
      })
      .catch(() => this.modalService.close());
  }

  viewProduct(product: any) {
    this.router.navigate(['/product', product.id]);
  }
}

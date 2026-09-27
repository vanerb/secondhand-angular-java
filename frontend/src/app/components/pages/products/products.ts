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

  updateLayaout() {
    if (this.user) {
      this.productService.getProductsAuth().subscribe({
        next: (response) => {
          console.log(response);
          this.products = response.content ?? response;
          console.log(this.products);
        },
        error: (error) => {
          console.error('Error al obtener productos:', error);
        },
      });
    } else {
      this.productService.getProducts().subscribe({
        next: (response) => {
          console.log(response);
          this.products = response.content ?? response;
          console.log(this.products);
        },
        error: (error) => {
          console.error('Error al obtener productos:', error);
        },
      });
    }
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

      case 'add_interest':
        this.createChat(action.item);
        break;
      case 'remove_interest':
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
    console.log('HOLA', product);
    this.favoriteService.toggleFavorite(product).subscribe({
      next: () => {
        this.cdr.detectChanges();

        console.log('Producto añadido a favoritos');
      },
      error: (error) => {
        console.error('Error al añadir a favoritos:', error);
      },
    });
  }

  createChat(product: any) {
    const user1Id = product.userId;

    // Aquí tienes que poner el ID del usuario
    // actualmente logueado.
    const user2Id = 1;

    this.chatService.getOrCreateConversation(user2Id, user1Id).subscribe({
      next: (conversation) => {
        console.log('Conversación creada:', conversation);
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

  removeChat(product: any) {
    console.log('Eliminar chat del producto:', product);
  }
}

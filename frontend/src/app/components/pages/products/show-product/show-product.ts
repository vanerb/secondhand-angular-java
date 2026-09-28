
import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf, NgFor, CurrencyPipe, DatePipe } from '@angular/common';
import { firstValueFrom } from 'rxjs';

import { ProductService } from '../../../../services/product-service';
import { FavoriteService } from '../../../../services/favorite-service';
import { AuthService } from '../../../../services/auth-service';
import { Product } from '../../../../interfaces/product';
import { Container } from '../../../general/container/container';
import { getImage } from '../../../../services/utilities-service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    NgIf,
    NgFor,
    CurrencyPipe,
    DatePipe,
    RouterLink,
    Container
  ],
  templateUrl: './show-product.html',
  styleUrl: './show-product.css'
})
export class ShowProduct implements OnInit {

  // Estado reactivo
  product = signal<any | null>(null);

  loading = signal(true);
  error = signal(false);

  currentImageIndex = signal(0);
  isFavorite = signal(false);

  user: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private favoriteService: FavoriteService,
    private authService: AuthService,
  ) {}

  async ngOnInit(): Promise<void> {

    if (this.authService.getToken()) {
      const user$ = this.authService.getUserByToken();

      if (user$) {
        this.user = await firstValueFrom(user$);
      }
    }

    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error.set(true);
      this.loading.set(false);
      return;
    }

    this.loadProduct(Number(id));
  }

  loadProduct(id: number): void {

    this.loading.set(true);

    this.productService.getProduct(id).subscribe({

      next: (product: Product) => {

        this.product.set(product);

        this.currentImageIndex.set(0);

        this.loading.set(false);

        this.loadFavoriteStatus();
      },

      error: (error) => {

        console.error('Error cargando producto:', error);

        this.loading.set(false);
        this.error.set(true);
      }

    });
  }

  get currentImage(): string {

    const product = this.product();

    if (!product?.images?.length) {
      return '/assets/images/product-placeholder.jpg';
    }

    return product.images[this.currentImageIndex()];
  }

  nextImage(): void {

    const product = this.product();

    if (!product?.images?.length) {
      return;
    }

    this.currentImageIndex.update(
      (index) => (index + 1) % product.images.length
    );
  }

  previousImage(): void {

    const product = this.product();

    if (!product?.images?.length) {
      return;
    }

    this.currentImageIndex.update(
      (index) =>
        (index - 1 + product.images.length) %
        product.images.length
    );
  }

  selectImage(index: number): void {
    this.currentImageIndex.set(index);
  }

  loadFavoriteStatus(): void {

    const product = this.product();

    if (!product || !this.user) {
      return;
    }

    this.favoriteService.isFavorite(product.id).subscribe({

      next: (result: boolean) => {
        this.isFavorite.set(result);
      },

      error: () => {
        this.isFavorite.set(false);
      }

    });
  }

  toggleFavorite(): void {

    const product = this.product();

    if (!product) {
      return;
    }

    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }

    this.favoriteService.toggleFavorite(product).subscribe({

      next: () => {
        this.isFavorite.update(
          (favorite) => !favorite
        );
      },

      error: (error) => {
        console.error(
          'Error al cambiar favorito:',
          error
        );
      }

    });
  }

  contactSeller(): void {

    const product = this.product();

    if (!product) {
      return;
    }

    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }

    console.log(
      'Contactar con vendedor:',
      product
    );
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  getConditionLabel(
    condition: string | undefined
  ): string {

    switch (condition) {

      case 'NEW':
        return 'Nuevo';

      case 'LIKE_NEW':
        return 'Como nuevo';

      case 'GOOD':
        return 'Buen estado';

      case 'USED':
        return 'Usado';

      default:
        return condition ?? 'Sin especificar';
    }
  }

  getAvailabilityLabel(
    availability: string | undefined
  ): string {

    switch (availability) {

      case 'AVAILABLE':
        return 'Disponible';

      case 'SOLD':
        return 'Vendido';

      case 'RESERVED':
        return 'Reservado';

      default:
        return availability ?? 'Sin especificar';
    }
  }

  getNewImage(name: string): string {
    return getImage(name);
  }
}


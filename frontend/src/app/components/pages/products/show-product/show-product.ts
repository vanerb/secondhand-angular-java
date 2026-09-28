import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIf, NgFor, CurrencyPipe, DatePipe } from '@angular/common';
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

  product: any | null = null;

  loading = true;
  error = false;

  currentImageIndex = 0;
  isFavorite = false;

  user: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private productService: ProductService,
    private favoriteService: FavoriteService,
    private authService: AuthService,
   
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUserByToken();

    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.error = true;
      this.loading = false;
      return;
    }

    this.loadProduct(Number(id));
  }

  loadProduct(id: number): void {
    this.loading = true;

    this.productService.getProduct(id).subscribe({
      next: (product: Product) => {
        this.product = product;
        this.currentImageIndex = 0;

        this.loading = false;

        this.loadFavoriteStatus();

       
      },
      error: (error) => {
        console.error('Error cargando producto:', error);

        this.loading = false;
        this.error = true;

      
      }
    });
  }

  get currentImage(): string {
    if (!this.product?.images?.length) {
      return '/assets/images/product-placeholder.jpg';
    }

    return this.product.images[this.currentImageIndex];
  }

  nextImage(): void {
    if (!this.product?.images?.length) {
      return;
    }

    this.currentImageIndex =
      (this.currentImageIndex + 1) % this.product.images.length;
  }

  previousImage(): void {
    if (!this.product?.images?.length) {
      return;
    }

    this.currentImageIndex =
      (this.currentImageIndex - 1 + this.product.images.length) %
      this.product.images.length;
  }

  selectImage(index: number): void {
    this.currentImageIndex = index;
  }

  loadFavoriteStatus(): void {
    if (!this.product || !this.user) {
      return;
    }

    // Si ya tienes un método para comprobar favoritos,
    // puedes sustituir esta llamada por él.
    this.favoriteService.isFavorite(this.product.id).subscribe({
      next: (result: boolean) => {
        this.isFavorite = result;
       
      },
      error: () => {
        this.isFavorite = false;
      }
    });
  }

  toggleFavorite(): void {
    if (!this.product) {
      return;
    }

    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }

    this.favoriteService.toggleFavorite(this.product).subscribe({
      next: () => {
        this.isFavorite = !this.isFavorite;
      
      },
      error: (error) => {
        console.error('Error al cambiar favorito:', error);
      }
    });
  }

  contactSeller(): void {
    if (!this.product) {
      return;
    }

    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }

    /*
     * Aquí puedes conectar tu ChatService.
     *
     * Por ejemplo:
     *
     * this.chatService.createOrGetChat(
     *   this.product.userId,
     *   this.product.id
     * ).subscribe(...)
     */

    console.log('Contactar con vendedor:', this.product);
  }

  goBack(): void {
    this.router.navigate(['/home']);
  }

  getConditionLabel(condition: string | undefined): string {
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

  getAvailabilityLabel(availability: string | undefined): string {
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

  getNewImage(name: string){
    return getImage(name)
  }
}
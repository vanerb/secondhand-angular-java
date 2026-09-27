import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FavoriteService } from '../../../services/favorite-service';
import { ProductService } from '../../../services/product-service';
import { AuthService } from '../../../services/auth-service';
import { Product } from '../../../interfaces/product';
import { ProductCard } from '../products/product-card/product-card';
import { Container } from '../../general/container/container';
import { RouterLink } from '@angular/router';
import { JsonPipe } from '@angular/common';
import { getImage, sleep } from '../../../services/utilities-service';

@Component({
  selector: 'app-favorites',
  imports: [ProductCard, Container, RouterLink, JsonPipe],
  templateUrl: './favorites.html',
  styleUrl: './favorites.css',
})
export class Favorites implements OnInit {
  favoriteProducts: Product[] = [];
  user: any = null;

  constructor(
    private favoriteService: FavoriteService,
    private productService: ProductService,
    private authService: AuthService,
    private cdr: ChangeDetectorRef,
  ) {}

  async ngOnInit(): Promise<void> {
    this.user = this.authService.getUserByToken();
    this.loadFavorites();

    await sleep(1000);

    this.cdr.detectChanges();
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
      },
      error: (error) => {
        console.error('Error cargando favoritos:', error);
        this.favoriteProducts = [];
      },
    });

    this.cdr.detectChanges();
  }

  action(event: any): void {
    console.log('Acción:', event);
  }
}

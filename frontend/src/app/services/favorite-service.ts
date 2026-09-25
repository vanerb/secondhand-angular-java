import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { Product } from '../interfaces/product';



@Injectable({
  providedIn: 'root'
})
export class FavoriteService {

  private apiUrl =
    'http://localhost:8080/api/favorites';

  constructor(
    private http: HttpClient
  ) {}

  addFavorite(
    productId: number
  ): Observable<void> {

    return this.http.post<void>(
      `${this.apiUrl}/${productId}`,
      {}
    );
  }

  removeFavorite(
    productId: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${productId}`
    );
  }

  getFavorites(): Observable<Product[]> {

    return this.http.get<Product[]>(
      this.apiUrl
    );
  }

  isFavorite(
    productId: number
  ): Observable<boolean> {

    return this.http.get<boolean>(
      `${this.apiUrl}/${productId}/exists`
    );
  }

  toggleFavorite(
    product: Product
  ): Observable<void> {

    if (product.favorite) {

      return this.removeFavorite(
        product.id
      );

    } else {

      return this.addFavorite(
        product.id
      );
    }
  }
}
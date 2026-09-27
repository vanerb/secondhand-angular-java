import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs';
import { Product } from '../interfaces/product';
import { AuthService } from './auth-service';

@Injectable({
  providedIn: 'root',
})
export class FavoriteService {
  private apiUrl = 'http://localhost:8080/api/favorites';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  addFavorite(productId: number): Observable<void> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`,
    });

    console.log('HOLA 3', productId);

    return this.http.post<void>(`${this.apiUrl}/${productId}`, null, { headers });
  }

  removeFavorite(productId: number): Observable<void> {
    const token = this.authService.getToken();

  console.log('TOKEN:', token);
  console.log('PRODUCT ID:', productId);

  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`,
  });

  return this.http.delete<void>(
    `${this.apiUrl}/${productId}`,
    { headers }
  );
  }

  getFavorites(): Observable<Product[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`,
    });
    return this.http.get<Product[]>(this.apiUrl, { headers });
  }

  isFavorite(productId: number): Observable<boolean> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`,
    });
    return this.http.get<boolean>(`${this.apiUrl}/${productId}/exists`, { headers });
  }

 toggleFavorite(product: any): Observable<void> {

  if (product.favorite) {
    return this.removeFavorite(product.id);
  } else {
    return this.addFavorite(product.id);
  }
}

}

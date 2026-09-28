import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';
import { Product } from '../interfaces/product';
import { ProductFilter } from '../interfaces/product-filter';
import { AuthService } from './auth-service';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'http://localhost:8080/api/products';

  constructor(
    private http: HttpClient,
    private authService: AuthService,
  ) {}

  // =========================================================
  // PRODUCTOS PÚBLICOS - SIN TOKEN
  // =========================================================

  getProducts(filters?: ProductFilter): Observable<any> {
    const params = this.buildParams(filters);

    return this.http.get<any>(this.apiUrl, { params });
  }

  // =========================================================
  // PRODUCTOS - CON TOKEN
  // =========================================================

  getProductsAuth(filters?: ProductFilter): Observable<any> {
    const params = this.buildParams(filters);

    const headers = this.getAuthHeaders();

    return this.http.get<any>(
      `${this.apiUrl}/auth`,
      {
        params,
        headers,
      }
    );
  }

  // =========================================================
  // PRODUCTO POR ID
  // =========================================================

  getProduct(id: number): Observable<Product> {
    const headers = this.getAuthHeaders();

    return this.http.get<Product>(
      `${this.apiUrl}/${id}`,
      { headers }
    );
  }

  // =========================================================
  // PRODUCTOS POR ID DE USUARIO
  // =========================================================

  getProductsByUserId(userId: number): Observable<Product[]> {
    const headers = this.getAuthHeaders();

    return this.http.get<Product[]>(
      `${this.apiUrl}/user/id/${userId}`,
      { headers }
    );
  }

  // =========================================================
  // PRODUCTOS POR USERNAME
  // =========================================================

  getProductsByUsername(username: string): Observable<Product[]> {
    const headers = this.getAuthHeaders();

    return this.http.get<Product[]>(
      `${this.apiUrl}/user/${encodeURIComponent(username)}`,
      { headers }
    );
  }

  // =========================================================
  // MIS PRODUCTOS - USANDO EL TOKEN
  // =========================================================

  getMyProducts(): Observable<Product[]> {
    const headers = this.getAuthHeaders();

    return this.http.get<Product[]>(
      `${this.apiUrl}/me`,
      { headers }
    );
  }

  // =========================================================
  // CREAR PRODUCTO
  // =========================================================

  createProduct(formData: FormData): Observable<Product> {
    const headers = this.getAuthHeaders();

    return this.http.post<Product>(
      this.apiUrl,
      formData,
      { headers }
    );
  }

  // =========================================================
  // ACTUALIZAR PRODUCTO
  // =========================================================

  updateProduct(
    id: number,
    formData: FormData
  ): Observable<Product> {

    const headers = this.getAuthHeaders();

    return this.http.put<Product>(
      `${this.apiUrl}/${id}`,
      formData,
      { headers }
    );
  }

  // =========================================================
  // ELIMINAR PRODUCTO
  // =========================================================

  deleteProduct(id: number): Observable<void> {
    const headers = this.getAuthHeaders();

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`,
      { headers }
    );
  }

  // =========================================================
  // CONSTRUIR PARÁMETROS DE BÚSQUEDA
  // =========================================================

  private buildParams(filters?: ProductFilter): HttpParams {
    let params = new HttpParams();

    if (!filters) {
      return params;
    }

    if (filters.name) {
      params = params.set('name', filters.name);
    }

    if (filters.category) {
      params = params.set('category', filters.category);
    }

    if (filters.minPrice !== undefined) {
      params = params.set('minPrice', filters.minPrice);
    }

    if (filters.maxPrice !== undefined) {
      params = params.set('maxPrice', filters.maxPrice);
    }

    if (filters.condition) {
      params = params.set('condition', filters.condition);
    }

    if (filters.availability) {
      params = params.set('availability', filters.availability);
    }

    if (filters.userId !== undefined) {
      params = params.set('userId', filters.userId);
    }

    if (filters.page !== undefined) {
      params = params.set('page', filters.page);
    }

    if (filters.size !== undefined) {
      params = params.set('size', filters.size);
    }

    if (filters.sort) {
      params = params.set('sort', filters.sort);
    }

    return params;
  }

  // =========================================================
  // HEADERS DE AUTENTICACIÓN
  // =========================================================

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`,
    });
  }
}
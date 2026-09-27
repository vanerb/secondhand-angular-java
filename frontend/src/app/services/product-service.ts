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

  // Productos públicos - SIN TOKEN
  getProducts(filters?: ProductFilter): Observable<any> {
    const params = this.buildParams(filters);

    return this.http.get<any>(this.apiUrl, { params });
  }

  // Productos para usuarios logueados - CON TOKEN
  getProductsAuth(filters?: ProductFilter): Observable<any> {
    const params = this.buildParams(filters);

 const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`,
    });


    return this.http.get<any>(`${this.apiUrl}/auth`, { params, headers });
  }

  // Construye los parámetros de búsqueda
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

  getProduct(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/${id}`);
  }

  createProduct(formData: FormData): Observable<Product> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`,
    });
    return this.http.post<Product>(this.apiUrl, formData, { headers });
  }

  updateProduct(id: number, formData: FormData): Observable<Product> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`,
    });
    return this.http.put<Product>(`${this.apiUrl}/${id}`, formData, { headers });
  }

  deleteProduct(id: number): Observable<void> {
     const headers = new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`,
    });
    return this.http.delete<void>(`${this.apiUrl}/${id}`, {headers});
  }
}

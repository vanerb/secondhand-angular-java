import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable } from 'rxjs';
import { Product } from '../interfaces/product';

import { ProductFilter } from '../interfaces/product-filter';


@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private apiUrl = 'http://localhost:8080/api/products';

  constructor(
    private http: HttpClient
  ) {}

  getProducts(
    filters?: ProductFilter
  ): Observable<any> {

    let params = new HttpParams();

    if (filters) {

      if (filters.name) {
        params = params.set(
          'name',
          filters.name
        );
      }

      if (filters.category) {
        params = params.set(
          'category',
          filters.category
        );
      }

      if (filters.minPrice !== undefined) {
        params = params.set(
          'minPrice',
          filters.minPrice
        );
      }

      if (filters.maxPrice !== undefined) {
        params = params.set(
          'maxPrice',
          filters.maxPrice
        );
      }

      if (filters.condition) {
        params = params.set(
          'condition',
          filters.condition
        );
      }

      if (filters.availability) {
        params = params.set(
          'availability',
          filters.availability
        );
      }

      if (filters.userId !== undefined) {
        params = params.set(
          'userId',
          filters.userId
        );
      }

      if (filters.page !== undefined) {
        params = params.set(
          'page',
          filters.page
        );
      }

      if (filters.size !== undefined) {
        params = params.set(
          'size',
          filters.size
        );
      }

      if (filters.sort) {
        params = params.set(
          'sort',
          filters.sort
        );
      }
    }

    return this.http.get<any>(
      this.apiUrl,
      { params }
    );
  }

  getProduct(
    id: number
  ): Observable<Product> {

    return this.http.get<Product>(
      `${this.apiUrl}/${id}`
    );
  }

  createProduct(
    formData: FormData
  ): Observable<Product> {

    return this.http.post<Product>(
      this.apiUrl,
      formData
    );
  }

  updateProduct(
    id: number,
    formData: FormData
  ): Observable<Product> {

    return this.http.put<Product>(
      `${this.apiUrl}/${id}`,
      formData
    );
  }

  deleteProduct(
    id: number
  ): Observable<void> {

    return this.http.delete<void>(
      `${this.apiUrl}/${id}`
    );
  }
}
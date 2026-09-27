import { Component } from '@angular/core';
import { ProductCard } from '../products/product-card/product-card';
import { ChipCategory } from './chip-category/chip-category';
import { ModalService } from '../../../services/modal-service';
import { CreateProduct } from '../products/create-product/create-product';
import { UpdateProduct } from '../products/update-product/update-product';
import { Products } from '../products/products';
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
  selector: 'app-home',
  imports: [ProductCard, ChipCategory, Products],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  query = '';



  constructor(private modalService: ModalService) {}


  onSearch(event: Event): void {
    this.query = (event.target as HTMLInputElement).value;
  }

  clearFilters(): void {
    this.query = '';

  }

 
}

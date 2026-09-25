import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-product-card',
  imports: [],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  @Input() product: any;
  @Input() index: number = 0;

  toggleFavorite(product: any): void {
    product.favorite = !product.favorite;
  }

  toggleInterest(product: any): void {
    product.interested = !product.interested;
  }
}

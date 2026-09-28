import { Component, EventEmitter, HostListener, input, Output } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { getImage } from '../../../../services/utilities-service';

@Component({
  selector: 'app-product-card',
  imports: [NgForOf, NgIf],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  product = input.required<any>();

  index = input(0);

  user = input<any>(null);

  readOnly = input(false);

  actionsOpen = false;

  @Output() actions = new EventEmitter<any>();

  toggleActions(event: Event): void {
    event.stopPropagation();

    this.actionsOpen = !this.actionsOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (!target.closest('.product-actions')) {
      this.actionsOpen = false;
    }
  }

  editProduct(product: any): void {
    this.actionsOpen = false;

    this.actions.emit({
      name: 'update',
      item: product,
    });
  }

  deleteProduct(product: any): void {
    this.actionsOpen = false;

    this.actions.emit({
      name: 'delete',
      item: product,
    });
  }

  toggleFavorite(product: any): void {
    this.actions.emit({
      name: 'update_favorite',
      item: product,
    });
  }

  toggleInterest(product: any): void {
    this.actions.emit({
      name: 'update_interest',
      item: product,
    });
  }

  getNewImage(name: string): string {
    return getImage(name);
  }

  view(product: any){
     this.actions.emit({
      name: 'view',
      item: product,
    });
  }
}

import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { getImage } from '../../../../services/utilities-service';
import {NgForOf, NgIf} from '@angular/common';

@Component({
  selector: 'app-product-card',
  imports: [NgForOf, NgIf],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  @Input() product: any;
  @Input() index: number = 0;
  @Input() user: any
  @Input() view: string = 'pro'

  actionsOpen = false;

  @Output() actions = new EventEmitter();

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

    console.log('Editar producto:', product);
  }

  deleteProduct(product: any): void {
    this.actionsOpen = false;

    this.actions.emit({
      name: 'delete',
      item: product,
    });

    console.log('Eliminar producto:', product);
  }

  toggleFavorite(product: any): void {
    this.actions.emit({
      name: 'update_favorite',
      item: product,
    });
    product.favorite = !product.favorite;
  }

  toggleInterest(product: any): void {
    product.interested = !product.interested;
    if ((product.favorite = true)) {
      this.actions.emit({
        name: 'add_interest',
        item: product,
      });
    } else {
      this.actions.emit({
        name: 'remove_interest',
        item: product,
      });
    }
  }

  getNewImage(name: string) {
    return getImage(name);
  }
}

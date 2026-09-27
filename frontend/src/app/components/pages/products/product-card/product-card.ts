import { Component, EventEmitter, HostListener, Input, OnInit, Output } from '@angular/core';
import { getImage, sleep } from '../../../../services/utilities-service';
import { NgForOf, NgIf } from '@angular/common';
import { ChatService } from '../../../../services/chat-service';

@Component({
  selector: 'app-product-card',
  imports: [NgForOf, NgIf],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  @Input() product: any;
  @Input() index: number = 0;
  @Input() user: any;
  @Input() view: string = 'pro';

  actionsOpen = false;

  @Output() actions = new EventEmitter();

  constructor() {}

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

  getNewImage(name: string) {
    return getImage(name);
  }
}

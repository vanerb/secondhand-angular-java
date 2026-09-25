import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-chip-category',
  imports: [],
  templateUrl: './chip-category.html',
  styleUrl: './chip-category.css',
})
export class ChipCategory {
  @Input() category: any;
  @Input() activeCategory: string = '';
  @Output() categorySelected = new EventEmitter<string>();

  selectCategory(category: string): void {
    this.activeCategory = category;
    this.categorySelected.emit(category);
  } 
}

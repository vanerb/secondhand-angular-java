import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-chip-category',
  imports: [],
  templateUrl: './chip-category.html',
  styleUrl: './chip-category.css',
})
export class ChipCategory {

  category = input.required<any>();

  activeCategory = input('');

  categorySelected = output<string>();

  selectCategory(category: string): void {
    this.categorySelected.emit(category);
  }
}
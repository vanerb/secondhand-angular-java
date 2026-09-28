import { Component } from '@angular/core';
import { Products } from '../products/products';

@Component({
  selector: 'app-home',
  imports: [Products],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

  query = '';

  onSearch(event: Event): void {
    this.query = (event.target as HTMLInputElement).value;
  }

  clearFilters(): void {
    this.query = '';
  }
}
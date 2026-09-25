import { Component } from '@angular/core';
import { ProductCard } from './product-card/product-card';
import { ChipCategory } from './chip-category/chip-category';
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
  imports: [ProductCard, ChipCategory],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  query = '';
  activeCategory = 'Todo';

  readonly categories = [
    { name: 'Todo', icon: 'bi-grid' },
    { name: 'Ropa', icon: 'bi-bag' },
    { name: 'Hogar', icon: 'bi-lamp' },
    { name: 'Tecnología', icon: 'bi-headphones' },
    { name: 'Accesorios', icon: 'bi-watch' },
    { name: 'Deporte', icon: 'bi-bicycle' },
  ];

  readonly products: Product[] = [
    { id: 1, name: 'Cámara analógica Minolta', category: 'Tecnología', price: 68, condition: 'Muy buen estado', seller: 'Clara M.', image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=900&q=85', badge: 'Hallazgo', favorite: false, interested: false },
    { id: 2, name: 'Bolso de piel color coñac', category: 'Accesorios', price: 42, condition: 'Como nuevo', seller: 'Lucía R.', image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=900&q=85', favorite: false, interested: false },
    { id: 3, name: 'Lámpara de sobremesa vintage', category: 'Hogar', price: 35, condition: 'Buen estado', seller: 'Pablo G.', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85', badge: 'Pieza única', favorite: false, interested: false },
    { id: 4, name: 'Chaqueta vaquera oversize', category: 'Ropa', price: 29, condition: 'Muy buen estado', seller: 'Marta S.', image: 'https://images.unsplash.com/photo-1543076447-215ad9ba6923?auto=format&fit=crop&w=900&q=85', favorite: false, interested: false },
    { id: 5, name: 'Auriculares inalámbricos', category: 'Tecnología', price: 54, condition: 'Como nuevo', seller: 'Diego P.', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=85', favorite: false, interested: false },
    { id: 6, name: 'Jarrón artesanal de cerámica', category: 'Hogar', price: 24, condition: 'Buen estado', seller: 'Ana V.', image: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=900&q=85', favorite: false, interested: false },
    { id: 7, name: 'Zapatillas retro de lona', category: 'Ropa', price: 32, condition: 'Buen estado', seller: 'Sergio L.', image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=900&q=85', badge: 'Tendencia', favorite: false, interested: false },
    { id: 8, name: 'Reloj clásico de acero', category: 'Accesorios', price: 48, condition: 'Muy buen estado', seller: 'Elena C.', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=85', favorite: false, interested: false },
  ];

  get filteredProducts(): Product[] {
    const term = this.query.trim().toLocaleLowerCase('es');
    return this.products.filter((product) => {
      const matchesCategory = this.activeCategory === 'Todo' || product.category === this.activeCategory;
      const matchesQuery = !term || `${product.name} ${product.category} ${product.seller}`.toLocaleLowerCase('es').includes(term);
      return matchesCategory && matchesQuery;
    });
  }

  onSearch(event: Event): void {
    this.query = (event.target as HTMLInputElement).value;
  }

  clearFilters(): void {
    this.query = '';
    this.activeCategory = 'Todo';
  }
}

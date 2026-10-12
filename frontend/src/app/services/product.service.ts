import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../../interfaces/product';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);

  products = signal<Product[]>([]);
  loading = signal(false);
  private loaded = false;

  loadProducts() {
    if (this.loaded || this.loading()) return;

    this.loading.set(true);

    this.http.get<Product[]>('/api/products').subscribe({
      next: (products) => {
        this.products.set(products);
        this.loaded = true;
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Nie udało się pobrać produktów:', error);
        this.loading.set(false);
      },
    });
  }
}
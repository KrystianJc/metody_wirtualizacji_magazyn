import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../interfaces/product';

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);

  products = signal<Product[]>([]);
  loading = signal(false);

  loadProducts() {
    this.loading.set(true);

    this.http.get<Product[]>('/api/products').subscribe({
      next: (products) => {
        this.products.set(products);
        this.loading.set(false);
      },
      error: (error) => {
        console.error("Couldn't fetch data:", error);
        this.loading.set(false);
      },
    });
  }

  deleteProduct(id: number) {
    return this.http.delete<void>(`/api/products/${id}`);
  }

  pickup(id: number, amount: number) {
    return this.http.patch<void>(`/api/products/${id}/stock`, { amount });
  }

  createProduct(product: Omit<Product, 'id'>) {
    return this.http.post<Product>('/api/products', product);
  }
}

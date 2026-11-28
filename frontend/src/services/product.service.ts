import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Product, ProductHistoryEntry } from '../interfaces/product';

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

  getProductById(id: number) {
    return this.http.get<Product>(`/api/products/${id}`);
  }

  deleteProduct(id: number, actor: string) {
    return this.http.delete<void>(`/api/products/${id}`, { headers: this.userHeaders(actor) });
  }

  pickup(id: number, amount: number, actor: string) {
    return this.http.patch<void>(`/api/products/${id}/stock`, { amount }, { headers: this.userHeaders(actor) });
  }

  createProduct(product: Omit<Product, 'id'> & { actor: string }) {
    const { actor, ...body } = product;
    return this.http.post<Product>('/api/products', body, { headers: this.userHeaders(actor) });
  }

  getProductHistory(id: number) {
    return this.http.get<ProductHistoryEntry[]>(`/api/products/${id}/history`);
  }

  private userHeaders(user: string) {
    return new HttpHeaders({ 'X-User': user });
  }
}

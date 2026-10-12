import { Component, inject, signal } from '@angular/core';
import { Product } from '../../interfaces/product';
import { HttpClient } from '@angular/common/http';

@Component({
  imports: [],
  selector: 'app-main-page',
  styleUrl: './main-page.css',
  templateUrl: './main-page.html',
})
export class MainPage {
  private http = inject(HttpClient);
  backendData = signal<Product[] | null>(null);

  ngOnInit() {
    this.http.get<Product[]>('/api/products').subscribe({
      next: (data) => {
        this.backendData.set(data);
      },
      error: (err) => {
        console.error('Something unexpected happened:', err);
      },
    });
  }
}

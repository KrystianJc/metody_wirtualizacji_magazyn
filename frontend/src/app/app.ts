import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Product } from '../interfaces/product';
import { JsonPipe } from '@angular/common';

@Component({
  imports: [RouterOutlet, JsonPipe],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('frontend');
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

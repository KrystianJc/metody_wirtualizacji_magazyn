import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject, signal } from '@angular/core';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';

interface StockMovement {
  id: number;
  amount: number;
  created_at: string;
  product_id: number | null;
  product_name: string;
  event_type: 'product_added' | 'stock_withdrawn' | 'product_deleted';
}

@Component({
  imports: [DatePipe],
  selector: 'app-stock-history-page',
  styleUrl: './stock-history-page.css',
  templateUrl: './stock-history-page.html',
})
export class StockHistoryPage implements OnInit {
  private readonly http = inject(HttpClient);
  protected readonly movements = signal<StockMovement[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal(false);

  ngOnInit(): void {
    this.http.get<StockMovement[]>('/api/stock-movements').pipe(
      catchError((error) => {
        console.error('Nie udało się pobrać historii stanów:', error);
        this.error.set(true);
        return of([]);
      }),
    ).subscribe((items) => {
      this.movements.set(items);
      this.loading.set(false);
    });
  }
}

import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Product, ProductHistoryEntry } from '../../interfaces/product';
import { LoadingPage } from '../loading-page/loading-page';

@Component({
  imports: [LoadingPage, DatePipe],
  selector: 'app-main-page',
  styleUrl: './main-page.css',
  templateUrl: './main-page.html',
})
export class MainPage {
  private productService = inject(ProductService);
  backendData = this.productService.products;
  loading = this.productService.loading;

  selectedCategoryMain = signal('');
  searchedProduct = signal<Product | null>(null);
  searchError = signal('');
  historyProduct = signal<Product | null>(null);
  productHistory = signal<ProductHistoryEntry[]>([]);
  historyLoading = signal(false);
  historyError = signal(false);

  categories = computed(() => [
    ...new Set((this.backendData() ?? []).map((item) => item.category)),
  ]);

  filteredMainProducts = computed(() => {
    const products = this.backendData() ?? [];
    const category = this.selectedCategoryMain();

    return category ? products.filter((item) => item.category === category) : products;
  });

  onMainCategoryChange(event: Event) {
    this.selectedCategoryMain.set((event.target as HTMLSelectElement).value);
  }

  onSearch(event: Event, idValue: string) {
    event.preventDefault();

    const id = Number(idValue);
    this.searchError.set('');
    this.searchedProduct.set(null);

    if (!Number.isInteger(id) || id < 1) {
      this.searchError.set('Wpisz poprawne ID produktu.');
      return;
    }

    this.productService.getProductById(id).subscribe({
      next: (product) => {
        this.searchedProduct.set(product);
      },
      error: (error) => {
        this.searchError.set(
          error.status === 404
            ? 'Nie znaleziono produktu.'
            : 'Nie udało się wyszukać produktu.',
        );
      },
    });
  }

  onPickup(id: number, amountValue: string, available: number) {
    const amount = Number(amountValue);
  
    if (!Number.isInteger(amount) || amount < 1 || amount > available) {
      return;
    }

    const actor = window.prompt('Kto wykonuje tę zmianę?');
    if (!actor?.trim()) return;

    const request = amount === available
      ? this.productService.deleteProduct(id, actor.trim())
      : this.productService.pickup(id, amount, actor.trim());

    request.subscribe({
      next: () => this.productService.loadProducts(),
      error: (error) => console.error('Nie udało się usunąć produktu:', error),
    });
  }

  showHistory(product: Product) {
    this.historyProduct.set(product);
    this.productHistory.set([]);
    this.historyLoading.set(true);
    this.historyError.set(false);
    this.productService.getProductHistory(product.id).subscribe({
      next: (entries) => {
        this.productHistory.set(entries);
        this.historyLoading.set(false);
      },
      error: (error) => {
        console.error('Nie udało się pobrać historii produktu:', error);
        this.historyError.set(true);
        this.historyLoading.set(false);
      },
    });
  }

  closeHistory() {
    this.historyProduct.set(null);
  }

  historyChanges(entry: ProductHistoryEntry): string[] {
    if (!entry.before_data) {
      return [`Dodano ${entry.after_data?.amount ?? 0} szt. produktu.`];
    }
    if (!entry.after_data) return ['Usunięto rekord produktu.'];
    const labels: Record<string, string> = {
      name: 'Nazwa', category: 'Kategoria', amount: 'Ilość',
      section: 'Sekcja', rack: 'Regał', shelf: 'Półka', placement: 'Miejsce',
    };
    return Object.keys(labels)
      .filter((key) => entry.before_data?.[key as keyof Product] !== entry.after_data?.[key as keyof Product])
      .map((key) => `${labels[key]}: ${entry.before_data?.[key as keyof Product]} → ${entry.after_data?.[key as keyof Product]}`);
  }

  ngOnInit() {
    this.productService.loadProducts();
  }
}

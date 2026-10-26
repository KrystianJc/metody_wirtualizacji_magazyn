import { Component, computed, inject, signal } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { Product } from '../../interfaces/product';
import { LoadingPage } from '../loading-page/loading-page';

@Component({
  imports: [LoadingPage],
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

    const request = amount === available
      ? this.productService.deleteProduct(id)
      : this.productService.pickup(id, amount);

    request.subscribe({
      next: () => this.productService.loadProducts(),
      error: (error) => console.error('Nie udało się usunąć produktu:', error),
    });
  }

  ngOnInit() {
    this.productService.loadProducts();
  }
}

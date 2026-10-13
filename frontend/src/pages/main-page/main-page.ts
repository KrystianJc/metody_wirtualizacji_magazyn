import { Component, computed, inject, signal } from '@angular/core';
import { ProductService } from '../../services/product.service';

@Component({
  imports: [],
  selector: 'app-main-page',
  styleUrl: './main-page.css',
  templateUrl: './main-page.html',
})
export class MainPage {
  private productService = inject(ProductService);
  backendData = this.productService.products

  selectedCategoryMain = signal('');

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
  };

  ngOnInit() {
    this.productService.loadProducts();
  }
}

import { Component, computed, inject, input, signal } from '@angular/core';
import { ProductService } from '../../services/product.service';
import { LoadingPage } from '../loading-page/loading-page';

@Component({
  imports: [LoadingPage],
  selector: 'app-redeem-page',
  styleUrl: './redeem-page.css',
  templateUrl: './redeem-page.html',
})
export class RedeemPage {
  private productService = inject(ProductService);
  backendData = this.productService.products;
  loading = this.productService.loading;

  selectedCategoryRedeem = signal('');

  categories = computed(() => [
    ...new Set((this.backendData() ?? []).map((item) => item.category)),
  ]);

  filteredRedeemProducts = computed(() => {
    const products = this.backendData() ?? [];
    const category = this.selectedCategoryRedeem();

    return category ? products.filter((item) => item.category === category) : products;
  });

  onRedeemCategoryChange(event: Event) {
    this.selectedCategoryRedeem.set((event.target as HTMLSelectElement).value);
  }

  ngOnInit() {
    this.productService.loadProducts();
  }
}

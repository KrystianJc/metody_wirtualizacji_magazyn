import { Component, computed, inject, input, signal } from '@angular/core';
import { Product } from '../../../interfaces/product';
import { ProductService } from '../../services/product.service';

@Component({
  imports: [],
  selector: 'app-redeem-page',
  styleUrl: './redeem-page.css',
  templateUrl: './redeem-page.html',
})
export class RedeemPage {
  private productService = inject(ProductService);
  backendData = this.productService.products;

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

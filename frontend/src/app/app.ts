import { Component, computed, inject, signal } from '@angular/core';
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
  activePage = signal<'main' | 'add' | 'redeem'>('main');
  isInMagazine = signal(false);

  selectedCategoryMain = signal('');
  selectedCategoryRedeem = signal('');

  categories = computed(() => [
    ...new Set((this.backendData() ?? []).map((item) => item.category)),
  ]);

  filteredMainProducts = computed(() => {
    const products = this.backendData() ?? [];
    const category = this.selectedCategoryMain();

    return category ? products.filter((item) => item.category === category) : products;
  });

  filteredRedeemProducts = computed(() => {
    const products = this.backendData() ?? [];
    const category = this.selectedCategoryRedeem();

    return category ? products.filter((item) => item.category === category) : products;
  });

  onMainCategoryChange(event: Event) {
    this.selectedCategoryMain.set((event.target as HTMLSelectElement).value);
  }

  onRedeemCategoryChange(event: Event) {
    this.selectedCategoryRedeem.set((event.target as HTMLSelectElement).value);
  }

  onIsInMagazineChange(event: Event) {
    this.isInMagazine.set((event.target as HTMLInputElement).checked);
  }

  openPage(page: 'main' | 'add' | 'redeem') {
    this.activePage.set(page);

    if (page === 'main') {
      this.selectedCategoryMain.set('');
    } else if (page === 'redeem') {
      this.selectedCategoryRedeem.set('');
    }
  }
}

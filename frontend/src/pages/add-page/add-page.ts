import { Component, computed, inject } from '@angular/core';
import { ProductService } from '../../services/product.service';

// AI-assisted: product loading, category list, and form validation developed with ChatGPT (OpenAI), 2026-10-26.
// Purpose: loads products to populate categories, prevents submission while loading, and validates required fields, whole numbers, and location availability.
@Component({
  imports: [],
  selector: 'app-add-page',
  styleUrl: './add-page.css',
  templateUrl: './add-page.html',
})
export class AddPage {
  private productService = inject(ProductService);
  backendData = this.productService.products;
  loading = this.productService.loading;
  categories = computed(() =>
    [...new Set(this.backendData().map((product) => product.category))].sort(
      (a, b) => a.localeCompare(b, 'pl'),
    ),
  );

  ngOnInit() {
    this.productService.loadProducts();
  }


  onSubmit(event: Event, form: HTMLFormElement) {
    event.preventDefault();

    const values = new FormData(form);
    const name = String(values.get('name') ?? '').trim();
    const category = String(values.get('category') ?? '').trim();
    const readInteger = (field: string) => {
      const value = String(values.get(field) ?? '').trim();
      return /^\d+$/.test(value) ? Number(value) : null;
    };

    const amount = readInteger('amount');
    const section = readInteger('section');
    const rack = readInteger('rack');
    const shelf = readInteger('shelf');
    const placement = readInteger('placement');

    if (
      !name ||
      !category ||
      amount === null ||
      section === null ||
      rack === null ||
      shelf === null ||
      placement === null
    ) {
      window.alert('Uzupełnij wszystkie pola. Ilości i lokalizacja muszą być nieujemnymi liczbami całkowitymi.');
      return;
    }

    if (this.loading()) {
      window.alert('Poczekaj, aż produkty zostaną wczytane, aby sprawdzić dostępność miejsca.');
      return;
    }

    const locationOccupied = this.backendData().some(
      (product) =>
        product.section === section &&
        product.rack === rack &&
        product.shelf === shelf &&
        product.placement === placement,
    );

    if (locationOccupied) {
      window.alert('To miejsce na półce jest już zajęte.');
      return;
    }

    this.productService.createProduct({
      name,
      category,
      amount,
      section,
      rack,
      shelf,
      placement,
    }).subscribe({
      next: (product) => {
        this.productService.products.update((products) => [...products, product]);
        form.reset();
        window.alert('Produkt został dodany.');
      },
      error: (error) => {
        window.alert(error.error?.error ?? 'Nie udało się dodać produktu.');
      },
    });
  }
}

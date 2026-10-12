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

  #backendData = signal<Product[] | null>(null);
  backendData = signal<Product[] | null>([ //Dane przykładowe do testowania, w przyszłości pobierane z backendu
    {
      id: 1,
      name: 'Wiertarka Bosch',
      category: 'Elektronarzędzia',
      amount: 15,
      section: 2,
      rack: 4,
      shelf: 3,
      placement: 10
    },
    {
      id: 2,
      name: 'Młotek Stanley',
      category: 'Narzędzia ręczne',
      amount: 40,
      section: 2,
      rack: 4,
      shelf: 1,
      placement: 12
    },
    {
      id: 3,
      name: 'Zestaw śrub M8',
      category: 'Elementy złączne',
      amount: 150,
      section: 5,
      rack: 1,
      shelf: 2,
      placement: 5
    },
    {
      id: 4,
      name: 'Klucz nastawny 250 mm',
      category: 'Narzędzia ręczne',
      amount: 18,
      section: 2,
      rack: 3,
      shelf: 2,
      placement: 7
    },
    {
      id: 5,
      name: 'Wkrety do drewna 4 x 50 mm',
      category: 'Elementy złączne',
      amount: 320,
      section: 5,
      rack: 2,
      shelf: 1,
      placement: 3
    },
    {
      id: 6,
      name: 'Szlifierka katowa Makita',
      category: 'Elektronarzędzia',
      amount: 7,
      section: 2,
      rack: 5,
      shelf: 3,
      placement: 11
    },
    {
      id: 7,
      name: 'Tasma miernicza 5 m',
      category: 'Narzędzia pomiarowe',
      amount: 24,
      section: 3,
      rack: 1,
      shelf: 2,
      placement: 4
    },
    {
      id: 8,
      name: 'Rekawice robocze',
      category: 'BHP',
      amount: 45,
      section: 1,
      rack: 2,
      shelf: 1,
      placement: 6
    },
    {
      id: 9,
      name: 'Poziomica aluminiowa 60 cm',
      category: 'Narzędzia pomiarowe',
      amount: 12,
      section: 3,
      rack: 2,
      shelf: 3,
      placement: 8
    },
    {
      id: 10,
      name: 'Przedluzacz bebnowy 25 m',
      category: 'Osprzęt elektryczny',
      amount: 9,
      section: 4,
      rack: 1,
      shelf: 2,
      placement: 2
    }
  ]);
  activePage = signal<'main' | 'add' | 'redeem'>('main');
  isInMagazine = signal(false);

  selectedCategoryMain = signal('');
  selectedCategoryRedeem = signal('');

  categories = computed(() =>
    [...new Set((this.backendData() ?? []).map(item => item.category))]
  );
  
  filteredMainProducts = computed(() => {
    const products = this.backendData() ?? [];
    const category = this.selectedCategoryMain();
  
    return category
      ? products.filter(item => item.category === category)
      : products;
  });

  filteredRedeemProducts = computed(() => {
    const products = this.backendData() ?? [];
    const category = this.selectedCategoryRedeem();

    return category
      ? products.filter(item => item.category === category)
      : products;
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

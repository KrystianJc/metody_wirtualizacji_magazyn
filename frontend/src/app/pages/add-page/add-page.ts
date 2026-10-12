import { Component, input, inject, signal } from '@angular/core';
import { Product } from '../../../interfaces/product';
import { ProductService } from '../../services/product.service';

@Component({
  imports: [],
  selector: 'app-add-page',
  styleUrl: './add-page.css',
  templateUrl: './add-page.html',
})
export class AddPage {
  private productService = inject(ProductService);
  backendData = this.productService.products;
  isInMagazine = signal(false);

  onIsInMagazineChange(event: Event) {
  this.isInMagazine.set((event.target as HTMLInputElement).checked);
  }

  ngOnInit() {
  this.productService.loadProducts();
}
}

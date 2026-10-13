import { Component, input, inject, signal } from '@angular/core';
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

  ngOnInit() {
  this.productService.loadProducts();
}
}

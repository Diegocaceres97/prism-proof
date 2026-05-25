import { Injectable, inject } from '@angular/core';
import { Product, ProductFilters } from '../../entities';
import { ProductRepositoryProtocol } from '../../protocols';
import { PRODUCT_REPOSITORY_TOKEN } from '../../protocols/tokens';

@Injectable({
  providedIn: 'root'
})
export class GetProductsUseCase {
  private productRepository = inject(PRODUCT_REPOSITORY_TOKEN);

  async execute(filters?: ProductFilters): Promise<Product[]> {
    return this.productRepository.getProducts(filters);
  }
}

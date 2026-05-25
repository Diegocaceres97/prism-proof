import { Injectable, inject } from '@angular/core';
import { Product } from '../../entities';
import { ProductRepositoryProtocol } from '../../protocols';
import { PRODUCT_REPOSITORY_TOKEN } from '../../protocols/tokens';

@Injectable({
  providedIn: 'root'
})
export class GetProductByIdUseCase {
  private productRepository = inject(PRODUCT_REPOSITORY_TOKEN);

  async execute(id: string): Promise<Product> {
    return this.productRepository.getProductById(id);
  }
}

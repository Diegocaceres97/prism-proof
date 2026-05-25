import { Product, ProductFilters } from '../entities';

export interface ProductRepositoryProtocol {
  getProducts(filters?: ProductFilters): Promise<Product[]>;
  getProductById(id: string): Promise<Product>;
}

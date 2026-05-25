import { Injectable, inject } from '@angular/core';
import { ProductRepositoryInterface } from '../../gateway/repositories';
import { Product, ProductFilters } from '../../../domain/entities';
import { HttpClientInterface } from '../../gateway/data-sources/http-client.interface';
import { HTTP_CLIENT_TOKEN } from '../../gateway/data-sources/tokens';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProductRepositoryImpl implements ProductRepositoryInterface {
  private httpClient = inject(HTTP_CLIENT_TOKEN);

  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    const params = new URLSearchParams();
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const url = `${environment.apiBaseUrl}/products${params.toString() ? '?' + params.toString() : ''}`;
    const response = await this.httpClient.get<Product[]>(url, {
      headers: { Authorization: `Bearer ${this.getToken()}` }
    });
    return response.data;
  }

  async getProductById(id: string): Promise<Product> {
    const response = await this.httpClient.get<Product>(
      `${environment.apiBaseUrl}/products/${id}`,
      {
        headers: { Authorization: `Bearer ${this.getToken()}` }
      }
    );
    return response.data;
  }

  private getToken(): string | null {
    // En una implementación real, esto vendría de un servicio de tokens
    // Por ahora retornamos el token mock
    return 'mock-token-123';
  }
}

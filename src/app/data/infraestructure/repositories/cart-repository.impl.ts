import { Injectable, inject } from '@angular/core';
import { CartRepositoryInterface } from '../../gateway/repositories';
import { Cart, CartItem, AddToCartRequest, UpdateCartItemRequest } from '../../../domain/entities';
import { HttpClientInterface } from '../../gateway/data-sources/http-client.interface';
import { HTTP_CLIENT_TOKEN } from '../../gateway/data-sources/tokens';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CartRepositoryImpl implements CartRepositoryInterface {
  private httpClient = inject(HTTP_CLIENT_TOKEN);

  async getCart(userId: string): Promise<Cart> {
    const response = await this.httpClient.get<Cart>(
      `${environment.apiBaseUrl}/cart/${userId}`,
      {
        headers: { Authorization: `Bearer ${this.getToken()}` }
      }
    );
    return response.data;
  }

  async addToCart(request: AddToCartRequest): Promise<CartItem> {
    const response = await this.httpClient.post<CartItem>(
      `${environment.apiBaseUrl}/cart/add`,
      request,
      {
        headers: { Authorization: `Bearer ${this.getToken()}` }
      }
    );
    return response.data;
  }

  async updateCartItem(request: UpdateCartItemRequest): Promise<CartItem> {
    const response = await this.httpClient.put<CartItem>(
      `${environment.apiBaseUrl}/cart/update`,
      request,
      {
        headers: { Authorization: `Bearer ${this.getToken()}` }
      }
    );
    return response.data;
  }

  async removeFromCart(itemId: string): Promise<void> {
    await this.httpClient.delete(
      `${environment.apiBaseUrl}/cart/remove/${itemId}`,
      {
        headers: { Authorization: `Bearer ${this.getToken()}` }
      }
    );
  }

  private getToken(): string | null {
    // En una implementación real, esto vendría de un servicio de tokens
    // Por ahora retornamos el token mock
    return 'mock-token-123';
  }
}


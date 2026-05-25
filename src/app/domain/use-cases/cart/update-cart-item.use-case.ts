import { Injectable, inject } from '@angular/core';
import { UpdateCartItemRequest, CartItem } from '../../entities';
import { CartRepositoryProtocol } from '../../protocols';
import { CART_REPOSITORY_TOKEN } from '../../protocols/tokens';

@Injectable({
  providedIn: 'root'
})
export class UpdateCartItemUseCase {
  private cartRepository = inject(CART_REPOSITORY_TOKEN);

  async execute(request: UpdateCartItemRequest): Promise<CartItem> {
    return this.cartRepository.updateCartItem(request);
  }
}


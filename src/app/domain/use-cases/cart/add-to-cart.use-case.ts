import { Injectable, inject } from '@angular/core';
import { AddToCartRequest, CartItem } from '../../entities';
import { CartRepositoryProtocol } from '../../protocols';
import { CART_REPOSITORY_TOKEN } from '../../protocols/tokens';

@Injectable({
  providedIn: 'root'
})
export class AddToCartUseCase {
  private cartRepository = inject(CART_REPOSITORY_TOKEN);

  async execute(request: AddToCartRequest): Promise<CartItem> {
    return this.cartRepository.addToCart(request);
  }
}


import { Injectable, inject } from '@angular/core';
import { CartRepositoryProtocol } from '../../protocols';
import { CART_REPOSITORY_TOKEN } from '../../protocols/tokens';

@Injectable({
  providedIn: 'root'
})
export class RemoveFromCartUseCase {
  private cartRepository = inject(CART_REPOSITORY_TOKEN);

  async execute(itemId: string): Promise<void> {
    return this.cartRepository.removeFromCart(itemId);
  }
}


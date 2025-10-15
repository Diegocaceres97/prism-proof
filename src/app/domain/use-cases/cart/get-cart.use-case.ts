import { Injectable, inject } from '@angular/core';
import { Cart } from '../../entities';
import { CartRepositoryProtocol } from '../../protocols';
import { CART_REPOSITORY_TOKEN } from '../../protocols/tokens';

@Injectable({
  providedIn: 'root'
})
export class GetCartUseCase {
  private cartRepository = inject(CART_REPOSITORY_TOKEN);

  async execute(userId: string): Promise<Cart> {
    return this.cartRepository.getCart(userId);
  }
}


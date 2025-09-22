import { Cart, AddToCartRequest } from '../entities';

export interface CartRepositoryProtocol {
  getCart(): Promise<Cart>;
  addToCart(request: AddToCartRequest): Promise<Cart>;
}

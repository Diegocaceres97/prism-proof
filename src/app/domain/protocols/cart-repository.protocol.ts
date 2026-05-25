import { Cart, CartItem, AddToCartRequest, UpdateCartItemRequest } from '../entities';

export interface CartRepositoryProtocol {
  getCart(userId: string): Promise<Cart>;
  addToCart(request: AddToCartRequest): Promise<CartItem>;
  updateCartItem(request: UpdateCartItemRequest): Promise<CartItem>;
  removeFromCart(itemId: string): Promise<void>;
}

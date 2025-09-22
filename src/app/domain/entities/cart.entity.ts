export interface CartItem {
  productId: string;
  quantity: number;
  subtotal: number;
}

export interface Cart {
  userId: string;
  cartItems: CartItem[];
  totalAmount: number;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

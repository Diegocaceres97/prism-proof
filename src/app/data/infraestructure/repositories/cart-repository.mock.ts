import { Injectable } from '@angular/core';
import { CartRepositoryInterface } from '../../gateway/repositories';
import { Cart, CartItem, AddToCartRequest, UpdateCartItemRequest } from '../../../domain/entities';

@Injectable({
  providedIn: 'root'
})
export class CartRepositoryMock implements CartRepositoryInterface {
  private cart: Cart = {
    userId: 'user-123',
    items: [],
    subtotal: 0,
    vat: 0,
    shipping: 0,
    total: 0
  };

  async getCart(userId: string): Promise<Cart> {
    // Simulate API delay
    await this.delay(300);
    return { ...this.cart };
  }

  async addToCart(request: AddToCartRequest): Promise<CartItem> {
    // Simulate API delay
    await this.delay(500);

    // Mock product data
    const mockProducts = [
      {
        id: '1',
        name: 'Running Shoes',
        price: 89.99,
        imageUrl: 'https://images.pexels.com/photos/5872357/pexels-photo-5872357.jpeg'
      },
      {
        id: '2',
        name: 'Wireless Headphones',
        price: 129.99,
        imageUrl: 'https://images.pexels.com/photos/5872357/pexels-photo-5872357.jpeg'
      },
      {
        id: '3',
        name: 'Smart Watch',
        price: 199.99,
        imageUrl: 'https://images.pexels.com/photos/5872357/pexels-photo-5872357.jpeg'
      }
    ];

    // Find or create product
    const product = mockProducts.find(p => p.id === request.productId) || {
      id: request.productId,
      name: 'Product',
      price: 99.99,
      imageUrl: 'https://images.pexels.com/photos/5872357/pexels-photo-5872357.jpeg'
    };

    // Check if item already exists
    const existingItemIndex = this.cart.items.findIndex(
      item => item.productId === request.productId && item.size === request.size
    );

    if (existingItemIndex >= 0) {
      // Update existing item
      this.cart.items[existingItemIndex].quantity += request.quantity;
      this.cart.items[existingItemIndex].subtotal = this.cart.items[existingItemIndex].product.price * this.cart.items[existingItemIndex].quantity;
    } else {
      // Add new item
      const newItem: CartItem = {
        id: `item-${Date.now()}`,
        productId: request.productId,
        product: {
          id: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.imageUrl
        },
        size: request.size,
        quantity: request.quantity,
        subtotal: product.price * request.quantity
      };
      this.cart.items.push(newItem);
    }

    this.calculateTotals();
    return this.cart.items[this.cart.items.length - 1];
  }

  async updateCartItem(request: UpdateCartItemRequest): Promise<CartItem> {
    // Simulate API delay
    await this.delay(300);

    const itemIndex = this.cart.items.findIndex(item => item.id === request.itemId);
    if (itemIndex >= 0) {
      this.cart.items[itemIndex].quantity = request.quantity;
      this.cart.items[itemIndex].subtotal = this.cart.items[itemIndex].product.price * request.quantity;
      this.calculateTotals();
      return this.cart.items[itemIndex];
    }
    throw new Error('Item not found');
  }

  async removeFromCart(itemId: string): Promise<void> {
    // Simulate API delay
    await this.delay(300);

    const itemIndex = this.cart.items.findIndex(item => item.id === itemId);
    if (itemIndex >= 0) {
      this.cart.items.splice(itemIndex, 1);
      this.calculateTotals();
    }
  }

  private calculateTotals() {
    this.cart.subtotal = this.cart.items.reduce((sum, item) => sum + item.subtotal, 0);
    this.cart.vat = this.cart.subtotal * 0.1; // 10% VAT
    this.cart.shipping = this.cart.subtotal > 100 ? 0 : 9.99; // Free shipping over $100
    this.cart.total = this.cart.subtotal + this.cart.vat + this.cart.shipping;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}


import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { GetCartUseCase, UpdateCartItemUseCase, RemoveFromCartUseCase } from '../../../domain/use-cases';
import { Cart, CartItem, UpdateCartItemRequest } from '../../../domain/entities';

@Injectable({
  providedIn: 'root'
})
export class CartPresenter {
  private getCartUseCase = inject(GetCartUseCase);
  private updateCartItemUseCase = inject(UpdateCartItemUseCase);
  private removeFromCartUseCase = inject(RemoveFromCartUseCase);
  private router = inject(Router);

  // State signals
  cart = signal<Cart | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);

  // Computed signals
  cartItems = computed(() => this.cart()?.items || []);
  cartTotal = computed(() => this.cart()?.total || 0);
  cartSubtotal = computed(() => this.cart()?.subtotal || 0);
  cartVat = computed(() => this.cart()?.vat || 0);
  cartShipping = computed(() => this.cart()?.shipping || 0);
  hasItems = computed(() => this.cartItems().length > 0);
  itemCount = computed(() => this.cartItems().length);

  async loadCart() {
    this.loading.set(true);
    this.error.set(null);

    try {
      // Mock user ID for demo
      const userId = 'user-123';
      const cart = await this.getCartUseCase.execute(userId);
      this.cart.set(cart);
    } catch (error: any) {
      this.error.set(error?.message ?? 'Error loading cart');
      console.error('Error loading cart:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async updateItemQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) {
      await this.removeItem(itemId);
      return;
    }

    try {
      const request: UpdateCartItemRequest = {
        itemId,
        quantity
      };

      await this.updateCartItemUseCase.execute(request);
      // Reload cart to get updated data
      await this.loadCart();
    } catch (error: any) {
      this.error.set(error?.message ?? 'Error updating item');
      console.error('Error updating item:', error);
    }
  }

  async removeItem(itemId: string) {
    try {
      await this.removeFromCartUseCase.execute(itemId);
      // Reload cart to get updated data
      await this.loadCart();
    } catch (error: any) {
      this.error.set(error?.message ?? 'Error removing item');
      console.error('Error removing item:', error);
    }
  }

  async proceedToCheckout() {
    if (!this.hasItems()) {
      this.error.set('Cart is empty');
      return;
    }

    this.router.navigate(['/checkout']);
  }

  async continueShopping() {
    this.router.navigate(['/home']);
  }

  getItemSubtotal(item: CartItem): number {
    return item.product.price * item.quantity;
  }
}


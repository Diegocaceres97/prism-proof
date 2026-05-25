import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { GetCartUseCase } from '../../../domain/use-cases';
import { Cart, CartItem } from '../../../domain/entities';

export interface CheckoutForm {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  zipCode: string;
  country: string;
  phone: string;
  paymentMethod: 'card' | 'paypal' | 'apple_pay';
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CheckoutPresenter {
  private getCartUseCase = inject(GetCartUseCase);
  private router = inject(Router);
  private toastController = inject(ToastController);

  // State signals
  cart = signal<Cart | null>(null);
  loading = signal(false);
  error = signal<string | null>(null);
  isProcessing = signal(false);

  // Form signals
  email = signal('');
  firstName = signal('');
  lastName = signal('');
  address = signal('');
  city = signal('');
  zipCode = signal('');
  country = signal('');
  phone = signal('');
  paymentMethod = signal<'card' | 'paypal' | 'apple_pay'>('card');
  cardNumber = signal('');
  expiryDate = signal('');
  cvv = signal('');
  cardName = signal('');

  // Computed signals
  hasItems = computed(() => (this.cart()?.items.length || 0) > 0);
  cartTotal = computed(() => this.cart()?.total || 0);
  cartSubtotal = computed(() => this.cart()?.subtotal || 0);
  cartVat = computed(() => this.cart()?.vat || 0);
  cartShipping = computed(() => this.cart()?.shipping || 0);

  isFormValid = computed(() => {
    return this.email().length > 0 &&
           this.firstName().length > 0 &&
           this.lastName().length > 0 &&
           this.address().length > 0 &&
           this.city().length > 0 &&
           this.zipCode().length > 0 &&
           this.country().length > 0 &&
           this.phone().length > 0 &&
           this.isPaymentValid();
  });

  private isPaymentValid = computed(() => {
    const method = this.paymentMethod();
    if (method === 'card') {
      return this.cardNumber().length >= 16 &&
             this.expiryDate().length >= 5 &&
             this.cvv().length >= 3 &&
             this.cardName().length > 0;
    }
    return true; // PayPal and Apple Pay don't need additional validation
  });

  async loadCart(userId: string) {
    this.loading.set(true);
    this.error.set(null);
    try {
      const cart = await this.getCartUseCase.execute(userId);
      this.cart.set(cart);
    } catch (error: any) {
      this.error.set(error?.message ?? 'Error loading cart');
      console.error('Error loading cart:', error);
    } finally {
      this.loading.set(false);
    }
  }

  updateEmail(value: string) {
    this.email.set(value);
  }

  updateFirstName(value: string) {
    this.firstName.set(value);
  }

  updateLastName(value: string) {
    this.lastName.set(value);
  }

  updateAddress(value: string) {
    this.address.set(value);
  }

  updateCity(value: string) {
    this.city.set(value);
  }

  updateZipCode(value: string) {
    this.zipCode.set(value);
  }

  updateCountry(value: string) {
    this.country.set(value);
  }

  updatePhone(value: string) {
    this.phone.set(value);
  }

  updatePaymentMethod(method: 'card' | 'paypal' | 'apple_pay') {
    this.paymentMethod.set(method);
  }

  updateCardNumber(value: string) {
    // Remove non-numeric characters and limit to 16 digits
    const cleaned = value.replace(/\D/g, '').slice(0, 16);
    this.cardNumber.set(cleaned);
  }

  updateExpiryDate(value: string) {
    // Format as MM/YY
    const cleaned = value.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      const formatted = cleaned.slice(0, 2) + (cleaned.length > 2 ? '/' + cleaned.slice(2, 4) : '');
      this.expiryDate.set(formatted);
    } else {
      this.expiryDate.set(cleaned);
    }
  }

  updateCvv(value: string) {
    // Limit to 3-4 digits
    const cleaned = value.replace(/\D/g, '').slice(0, 4);
    this.cvv.set(cleaned);
  }

  updateCardName(value: string) {
    this.cardName.set(value);
  }

  async processCheckout() {
    if (!this.isFormValid()) {
      await this.showErrorToast('Please fill in all required fields');
      return;
    }

    this.isProcessing.set(true);
    this.error.set(null);

    try {
      // Simulate payment processing
      await this.simulatePaymentProcessing();

      // Show success message
      await this.showSuccessToast('Order placed successfully!');

      // Navigate to success page or home
      this.router.navigate(['/home']);

    } catch (error: any) {
      this.error.set(error?.message ?? 'Error processing checkout');
      await this.showErrorToast('Payment failed. Please try again.');
      console.error('Error processing checkout:', error);
    } finally {
      this.isProcessing.set(false);
    }
  }

  goBack() {
    this.router.navigate(['/cart']);
  }

  private async simulatePaymentProcessing(): Promise<void> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulate 10% chance of failure for demo purposes
    if (Math.random() < 0.1) {
      throw new Error('Payment processing failed');
    }
  }

  private async showSuccessToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top',
      color: 'success',
      buttons: [
        {
          text: 'View Orders',
          handler: () => {
            // TODO: Navigate to orders page
            this.router.navigate(['/home']);
          }
        }
      ]
    });
    await toast.present();
  }

  private async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 4000,
      position: 'top',
      color: 'danger'
    });
    await toast.present();
  }
}




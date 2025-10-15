import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon,
  IonSpinner, IonText, IonCard, IonCardContent,
  IonGrid, IonRow, IonCol, IonBadge
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronBack, trash, add, remove, bagOutline } from 'ionicons/icons';

import { CartPresenter } from './cart.presenter';
import { CartItem } from '../../../domain/entities';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon,
    IonSpinner, IonText, IonCard, IonCardContent,
    IonGrid, IonRow, IonCol, IonBadge
  ]
})
export class CartPage implements OnInit {
  presenter = inject(CartPresenter);

  // Expose presenter signals to template
  cart = this.presenter.cart;
  cartItems = this.presenter.cartItems;
  cartTotal = this.presenter.cartTotal;
  cartSubtotal = this.presenter.cartSubtotal;
  cartVat = this.presenter.cartVat;
  cartShipping = this.presenter.cartShipping;
  hasItems = this.presenter.hasItems;
  itemCount = this.presenter.itemCount;
  loading = this.presenter.loading;
  error = this.presenter.error;

  constructor() {
    addIcons({ chevronBack, trash, add, remove, bagOutline });
  }

  ngOnInit() {
    this.presenter.loadCart();
  }

  onQuantityChange(item: CartItem, quantity: number) {
    this.presenter.updateItemQuantity(item.id, quantity);
  }

  onRemoveItem(itemId: string) {
    this.presenter.removeItem(itemId);
  }

  onProceedToCheckout() {
    this.presenter.proceedToCheckout();
  }

  onContinueShopping() {
    this.presenter.continueShopping();
  }

  onGoBack() {
    this.presenter.continueShopping();
  }

  getItemSubtotal(item: CartItem): number {
    return this.presenter.getItemSubtotal(item);
  }
}

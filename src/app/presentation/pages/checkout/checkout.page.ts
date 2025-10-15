import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon,
  IonSpinner, IonText, IonCard, IonCardContent, IonInput, IonSelect, IonSelectOption,
  IonGrid, IonRow, IonCol
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronBack, card, logoPaypal, logoApple, checkmarkCircle } from 'ionicons/icons';

import { CheckoutPresenter } from './checkout.presenter';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.page.html',
  styleUrls: ['./checkout.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon,
    IonSpinner, IonText, IonCard, IonCardContent, IonInput, IonSelect, IonSelectOption,
    IonGrid, IonRow, IonCol
  ],
})
export class CheckoutPage implements OnInit {
  presenter = inject(CheckoutPresenter);

  // Expose presenter signals to template
  cart = this.presenter.cart;
  loading = this.presenter.loading;
  error = this.presenter.error;
  isProcessing = this.presenter.isProcessing;
  hasItems = this.presenter.hasItems;
  cartTotal = this.presenter.cartTotal;
  cartSubtotal = this.presenter.cartSubtotal;
  cartVat = this.presenter.cartVat;
  cartShipping = this.presenter.cartShipping;

  // Form signals
  email = this.presenter.email;
  firstName = this.presenter.firstName;
  lastName = this.presenter.lastName;
  address = this.presenter.address;
  city = this.presenter.city;
  zipCode = this.presenter.zipCode;
  country = this.presenter.country;
  phone = this.presenter.phone;
  paymentMethod = this.presenter.paymentMethod;
  cardNumber = this.presenter.cardNumber;
  expiryDate = this.presenter.expiryDate;
  cvv = this.presenter.cvv;
  cardName = this.presenter.cardName;
  isFormValid = this.presenter.isFormValid;

  constructor() {
    addIcons({ chevronBack, card, logoPaypal, logoApple, checkmarkCircle });
  }

  ngOnInit() {
    this.presenter.loadCart('user-123'); // Mock user ID
  }

  onGoBack() {
    this.presenter.goBack();
  }

  onEmailChange(event: any) {
    this.presenter.updateEmail(event.detail.value);
  }

  onFirstNameChange(event: any) {
    this.presenter.updateFirstName(event.detail.value);
  }

  onLastNameChange(event: any) {
    this.presenter.updateLastName(event.detail.value);
  }

  onAddressChange(event: any) {
    this.presenter.updateAddress(event.detail.value);
  }

  onCityChange(event: any) {
    this.presenter.updateCity(event.detail.value);
  }

  onZipCodeChange(event: any) {
    this.presenter.updateZipCode(event.detail.value);
  }

  onCountryChange(event: any) {
    this.presenter.updateCountry(event.detail.value);
  }

  onPhoneChange(event: any) {
    this.presenter.updatePhone(event.detail.value);
  }

  onPaymentMethodChange(event: any) {
    this.presenter.updatePaymentMethod(event.detail.value);
  }

  onCardNumberChange(event: any) {
    this.presenter.updateCardNumber(event.detail.value);
  }

  onExpiryDateChange(event: any) {
    this.presenter.updateExpiryDate(event.detail.value);
  }

  onCvvChange(event: any) {
    this.presenter.updateCvv(event.detail.value);
  }

  onCardNameChange(event: any) {
    this.presenter.updateCardName(event.detail.value);
  }

  onProcessCheckout() {
    this.presenter.processCheckout();
  }
}

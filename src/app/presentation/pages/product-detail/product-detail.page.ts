import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon,
  IonSpinner, IonText, IonCard, IonCardContent, IonChip, IonBadge
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { notificationsOutline, heartOutline, heart, star, chevronBack, checkmarkCircle, returnUpBack, shieldCheckmark } from 'ionicons/icons';

import { ProductDetailPresenter } from './product-detail.presenter';
import { SizeSelectorComponent, QuantitySelectorComponent, BottomNavigationComponent } from '../../components';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.page.html',
  styleUrls: ['./product-detail.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon,
    IonSpinner, IonText, IonChip,
    SizeSelectorComponent, QuantitySelectorComponent, BottomNavigationComponent
  ]
})
export class ProductDetailPage implements OnInit {
  presenter = inject(ProductDetailPresenter);
  route = inject(ActivatedRoute);

  // Expose presenter signals to template
  product = this.presenter.product;
  selectedSize = this.presenter.selectedSize;
  quantity = this.presenter.quantity;
  loading = this.presenter.loading;
  error = this.presenter.error;
  availableSizes = this.presenter.availableSizes;
  canAddToCart = this.presenter.canAddToCart;
  totalPrice = this.presenter.totalPrice;

  constructor() {
    addIcons({chevronBack,notificationsOutline,heartOutline,star,checkmarkCircle,returnUpBack,shieldCheckmark,heart});
  }

  ngOnInit() {
    const productId = this.route.snapshot.params['id'];
    if (productId) {
      this.presenter.loadProduct(productId);
    }
  }

  onSizeSelect(size: string) {
    this.presenter.selectSize(size);
  }

  onQuantityChange(quantity: number) {
    this.presenter.updateQuantity(quantity);
  }

  onAddToCart() {
    this.presenter.addToCart();
  }

  onGoBack() {
    this.presenter.goBack();
  }
}

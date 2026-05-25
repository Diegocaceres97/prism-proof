import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonCard, IonCardContent, IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { heart, heartOutline, star } from 'ionicons/icons';
import { Product } from '../../../domain/entities';

@Component({
  selector: 'app-product-card',
  templateUrl: './product-card.component.html',
  styleUrls: ['./product-card.component.scss'],
  standalone: true,
  imports: [CommonModule, IonCard, IonCardContent, IonButton, IonIcon]
})
export class ProductCardComponent {
  product = input.required<Product>();
  isFavorite = signal(false);

  // Outputs
  cardClick = output<Product>();
  favoriteToggle = output<{ product: Product; isFavorite: boolean }>();

  constructor() {
    addIcons({star,heart,heartOutline});
  }

  onCardClick() {
    this.cardClick.emit(this.product());
  }

  onFavoriteClick(event: Event) {
    event.stopPropagation(); // Prevent card click
    this.isFavorite.update(current => !current);
    this.favoriteToggle.emit({
      product: this.product(),
      isFavorite: this.isFavorite()
    });
  }

  get hasDiscount(): boolean {
    return !!(this.product().originalPrice && this.product().discount);
  }
}

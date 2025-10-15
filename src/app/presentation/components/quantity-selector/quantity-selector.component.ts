import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { remove, add } from 'ionicons/icons';

@Component({
  selector: 'app-quantity-selector',
  templateUrl: './quantity-selector.component.html',
  styleUrls: ['./quantity-selector.component.scss'],
  standalone: true,
  imports: [CommonModule, IonButton, IonIcon]
})
export class QuantitySelectorComponent {
  quantity = signal(1);
  minQuantity = input(1);
  maxQuantity = input(10);

  // Outputs
  quantityChange = output<number>();

  constructor() {
    addIcons({ remove, add });
  }

  onDecrease() {
    const current = this.quantity();
    if (current > this.minQuantity()) {
      const newQuantity = current - 1;
      this.quantity.set(newQuantity);
      this.quantityChange.emit(newQuantity);
    }
  }

  onIncrease() {
    const current = this.quantity();
    if (current < this.maxQuantity()) {
      const newQuantity = current + 1;
      this.quantity.set(newQuantity);
      this.quantityChange.emit(newQuantity);
    }
  }

  canDecrease(): boolean {
    return this.quantity() > this.minQuantity();
  }

  canIncrease(): boolean {
    return this.quantity() < this.maxQuantity();
  }
}

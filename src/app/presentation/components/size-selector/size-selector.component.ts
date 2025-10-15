import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonButton } from '@ionic/angular/standalone';

@Component({
  selector: 'app-size-selector',
  templateUrl: './size-selector.component.html',
  styleUrls: ['./size-selector.component.scss'],
  standalone: true,
  imports: [CommonModule, IonButton]
})
export class SizeSelectorComponent {
  sizes = input.required<string[]>();
  selectedSize = signal<string | null>(null);

  // Outputs
  sizeChange = output<string>();

  onSizeSelect(size: string) {
    this.selectedSize.set(size);
    this.sizeChange.emit(size);
  }

  isSelected(size: string): boolean {
    return this.selectedSize() === size;
  }
}

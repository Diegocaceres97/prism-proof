import { Component, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonSegment, IonSegmentButton, IonLabel } from '@ionic/angular/standalone';

export type CategoryType = 'all' | 'tshirts' | 'jeans' | 'shoes';

@Component({
  selector: 'app-category-filter',
  templateUrl: './category-filter.component.html',
  styleUrls: ['./category-filter.component.scss'],
  standalone: true,
  imports: [CommonModule, IonSegment, IonSegmentButton, IonLabel]
})
export class CategoryFilterComponent {
  selectedCategory = signal<CategoryType>('all');

  // Outputs
  categoryChange = output<CategoryType>();

  categories = [
    { value: 'all' as CategoryType, label: 'All' },
    { value: 'tshirts' as CategoryType, label: 'T-shirts' },
    { value: 'jeans' as CategoryType, label: 'Jeans' },
    { value: 'shoes' as CategoryType, label: 'Shoes' }
  ];

  onCategoryChange(event: any) {
    const category = event.detail.value as CategoryType;
    this.selectedCategory.set(category);
    this.categoryChange.emit(category);
  }
}

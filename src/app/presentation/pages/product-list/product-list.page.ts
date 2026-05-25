import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon,
  IonGrid, IonRow, IonCol, IonSpinner, IonText
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { notificationsOutline } from 'ionicons/icons';

import { ProductListPresenter } from './product-list.presenter';
import {
  ProductCardComponent,
  SearchBarComponent,
  CategoryFilterComponent,
  BottomNavigationComponent
} from '../../components';
import { CategoryType } from '../../components/category-filter/category-filter.component';
import { Product } from '../../../domain/entities';

@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.page.html',
  styleUrls: ['./product-list.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon,
    IonGrid, IonRow, IonCol, IonSpinner, IonText,
    ProductCardComponent,
    SearchBarComponent,
    CategoryFilterComponent,
    BottomNavigationComponent
  ]
})
export class ProductListPage implements OnInit {
  presenter = inject(ProductListPresenter);

  // Expose presenter signals to template
  products = this.presenter.products;
  filteredProducts = this.presenter.filteredProducts;
  loading = this.presenter.loading;
  error = this.presenter.error;
  hasProducts = this.presenter.hasProducts;

  constructor() {
    addIcons({ notificationsOutline });
  }

  ngOnInit() {
    this.presenter.loadProducts();
  }

  onSearchChange(searchTerm: string) {
    this.presenter.updateSearch(searchTerm);
  }

  onCategoryChange(category: CategoryType) {
    this.presenter.updateCategory(category);
  }

  onProductClick(product: Product) {
    this.presenter.navigateToProduct(product.id);
  }

  onProductFavorite(data: { product: Product; isFavorite: boolean }) {
    this.presenter.onProductFavorite(data);
  }

  onFilterClick() {
    this.presenter.onFilterClick();
  }

  onRefresh(event: any) {
    this.presenter.loadProducts().finally(() => {
      event.target.complete();
    });
  }
}

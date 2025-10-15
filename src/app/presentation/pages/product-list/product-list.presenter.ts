import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { GetProductsUseCase } from '../../../domain/use-cases';
import { Product, ProductFilters } from '../../../domain/entities';
import { CategoryType } from '../../components/category-filter/category-filter.component';

@Injectable({
  providedIn: 'root'
})
export class ProductListPresenter {
  private getProductsUseCase = inject(GetProductsUseCase);
  private router = inject(Router);

  // State signals
  products = signal<Product[]>([]);
  searchTerm = signal('');
  selectedCategory = signal<CategoryType>('all');
  loading = signal(false);
  error = signal<string | null>(null);

  // Computed signals
  filteredProducts = computed(() => {
    const products = this.products();
    const search = this.searchTerm().toLowerCase().trim();
    const category = this.selectedCategory();

    return products.filter(product => {
      // Search filter
      const matchesSearch = !search ||
        product.name.toLowerCase().includes(search) ||
        product.description.toLowerCase().includes(search);

      // Category filter
      const matchesCategory = category === 'all' || product.category === category;

      return matchesSearch && matchesCategory && product.inStock;
    });
  });

  hasProducts = computed(() => this.filteredProducts().length > 0);

  async loadProducts() {
    this.loading.set(true);
    this.error.set(null);

    try {
      const filters: ProductFilters = {
        limit: 50 // Load more products for demo
      };

      const products = await this.getProductsUseCase.execute(filters);

      // Add mock data to make it more realistic
      const enhancedProducts = this.enhanceProductsWithMockData(products);
      this.products.set(enhancedProducts);

    } catch (error: any) {
      this.error.set(error?.message ?? 'Error loading products');
      console.error('Error loading products:', error);
    } finally {
      this.loading.set(false);
    }
  }

  updateSearch(searchTerm: string) {
    this.searchTerm.set(searchTerm);
  }

  updateCategory(category: CategoryType) {
    this.selectedCategory.set(category);
  }

  navigateToProduct(productId: string) {
    this.router.navigate(['/product', productId]);
  }

  onProductFavorite(data: { product: Product; isFavorite: boolean }) {
    // TODO: Implement favorite functionality
    console.log('Product favorite toggled:', data);
  }

  onFilterClick() {
    // TODO: Implement advanced filters modal
    console.log('Filter clicked');
  }

  private enhanceProductsWithMockData(products: Product[]): Product[] {
    const categories: Array<'tshirts' | 'jeans' | 'shoes' | 'other'> = ['tshirts', 'jeans', 'shoes', 'other'];

    return products.map((product, index) => ({
      ...product,
      category: categories[index % categories.length],
      rating: 3.5 + (Math.random() * 1.5), // Random rating between 3.5-5
      reviewCount: Math.floor(Math.random() * 100) + 10, // Random reviews 10-110
      originalPrice: Math.random() > 0.7 ? product.price * 1.2 : undefined, // 30% chance of discount
      discount: Math.random() > 0.7 ? Math.floor(Math.random() * 30) + 10 : undefined, // 10-40% discount
      inStock: Math.random() > 0.1, // 90% in stock
      sizes: ['S', 'M', 'L', 'XL'],
      colors: ['Black', 'White', 'Navy', 'Gray']
    }));
  }
}

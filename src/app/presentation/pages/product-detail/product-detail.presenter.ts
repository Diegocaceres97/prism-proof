import { Injectable, inject, signal, computed } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { GetProductByIdUseCase, AddToCartUseCase } from '../../../domain/use-cases';
import { Product, AddToCartRequest } from '../../../domain/entities';

@Injectable({
  providedIn: 'root'
})
export class ProductDetailPresenter {
  private getProductByIdUseCase = inject(GetProductByIdUseCase);
  private addToCartUseCase = inject(AddToCartUseCase);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastController = inject(ToastController);

  // State signals
  product = signal<Product | null>(null);
  selectedSize = signal<string | null>(null);
  quantity = signal(1);
  loading = signal(false);
  error = signal<string | null>(null);

  // Computed signals
  availableSizes = computed(() => {
    const product = this.product();
    return product?.sizes || ['S', 'M', 'L', 'XL'];
  });

  canAddToCart = computed(() => {
    return this.product() !== null &&
           this.selectedSize() !== null &&
           this.quantity() > 0;
  });

  totalPrice = computed(() => {
    const product = this.product();
    const qty = this.quantity();
    if (!product) return 0;
    return product.price * qty;
  });

  async loadProduct(productId: string) {
    this.loading.set(true);
    this.error.set(null);

    try {
      const product = await this.getProductByIdUseCase.execute(productId);

      // Enhance product with mock data
      const enhancedProduct = this.enhanceProductWithMockData(product);
      this.product.set(enhancedProduct);

    } catch (error: any) {
      this.error.set(error?.message ?? 'Error loading product');
      console.error('Error loading product:', error);
    } finally {
      this.loading.set(false);
    }
  }

  selectSize(size: string) {
    this.selectedSize.set(size);
  }

  updateQuantity(newQuantity: number) {
    this.quantity.set(newQuantity);
  }

  async addToCart() {
    if (!this.canAddToCart()) {
      console.warn('Cannot add to cart: missing product, size, or quantity');
      return;
    }

    const product = this.product();
    const size = this.selectedSize();
    const qty = this.quantity();

    try {
      const request: AddToCartRequest = {
        productId: product!.id,
        size: size!,
        quantity: qty
      };

      await this.addToCartUseCase.execute(request);

      // Show success toast and navigate to cart
      await this.showSuccessToast(`${qty}x ${product!.name} (${size}) added to cart!`);
      this.router.navigate(['/cart']);

    } catch (error: any) {
      this.error.set(error?.message ?? 'Error adding to cart');
      console.error('Error adding to cart:', error);
    }
  }

  goBack() {
    this.router.navigate(['/products']);
  }

  private async showSuccessToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top',
      color: 'success',
      buttons: [
        {
          text: 'View Cart',
          handler: () => {
            this.router.navigate(['/cart']);
          }
        }
      ]
    });
    await toast.present();
  }

  private enhanceProductWithMockData(product: Product): Product {
    return {
      ...product,
      // Use Picsum for product detail image
      imageUrl: 'https://images.pexels.com/photos/5872357/pexels-photo-5872357.jpeg',
      rating: 4.0 + (Math.random() * 1.0), // Random rating between 4.0-5.0
      reviewCount: Math.floor(Math.random() * 200) + 50, // Random reviews 50-250
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      colors: ['Black', 'White', 'Navy', 'Gray', 'Red'],
      inStock: true,
      originalPrice: Math.random() > 0.6 ? product.price * 1.3 : undefined,
      discount: Math.random() > 0.6 ? Math.floor(Math.random() * 25) + 10 : undefined
    };
  }
}

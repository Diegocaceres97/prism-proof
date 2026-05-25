import { Injectable, inject, signal } from '@angular/core';
import { LoginUseCase, GetProductsUseCase } from '../../../domain/use-cases';
import { Product, AuthCredentials } from '../../../domain/entities';

@Injectable({
  providedIn: 'root'
})
export class HomePresenter {
  // Use cases
  private loginUseCase = inject(LoginUseCase);
  private getProductsUseCase = inject(GetProductsUseCase);

  // UI State signals
  token = signal<string | null>(null);
  loading = signal<boolean>(false);
  products = signal<Product[]>([]);
  error = signal<string | null>(null);

  async login(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);

    try {
      const credentials: AuthCredentials = {
        email: 'user@example.com',
        password: 'strong_password_123'
      };

      const result = await this.loginUseCase.execute(credentials);
      this.token.set(result.token);
    } catch (error: any) {
      this.error.set(error?.message ?? 'Login error');
    } finally {
      this.loading.set(false);
    }
  }

  async loadProducts(): Promise<void> {
    if (!this.token()) {
      this.error.set('Primero realiza login');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      const products = await this.getProductsUseCase.execute();
      this.products.set(products);
    } catch (error: any) {
      this.error.set(error?.message ?? 'Products error');
    } finally {
      this.loading.set(false);
    }
  }

  // UI helper methods
  get isAuthenticated(): boolean {
    return !!this.token();
  }

  get hasProducts(): boolean {
    return this.products().length > 0;
  }
}

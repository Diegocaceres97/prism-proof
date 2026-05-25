import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LoginPresenter {
  private router = inject(Router);

  // State signals
  email = signal('');
  password = signal('');
  showPassword = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);

  // Computed signals
  canLogin = computed(() => {
    return this.email().trim().length > 0 && this.password().trim().length > 0;
  });

  updateEmail(email: string) {
    this.email.set(email);
    this.error.set(null); // Clear error when user types
  }

  updatePassword(password: string) {
    this.password.set(password);
    this.error.set(null); // Clear error when user types
  }

  togglePasswordVisibility() {
    this.showPassword.update(current => !current);
  }

  async login() {
    if (!this.canLogin()) {
      this.error.set('Please enter both email and password');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      // Simulate login API call
      await this.simulateLogin();

      // Navigate to home page after successful login
      this.router.navigate(['/home']);

    } catch (error: any) {
      this.error.set(error?.message ?? 'Login failed. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  loginWithGoogle() {
    // Simulate Google login
    console.log('Google login clicked');
    this.router.navigate(['/home']);
  }

  loginWithApple() {
    // Simulate Apple login
    console.log('Apple login clicked');
    this.router.navigate(['/home']);
  }

  forgotPassword() {
    // TODO: Implement forgot password functionality
    console.log('Forgot password clicked');
    // For now, just show an alert
    alert('Forgot password functionality will be implemented');
  }

  navigateToSignUp() {
    // TODO: Navigate to sign up page
    console.log('Sign up clicked');
    // For now, just show an alert
    alert('Sign up functionality will be implemented');
  }

  private async simulateLogin(): Promise<void> {
    // Simulate API call delay
    return new Promise((resolve) => {
      setTimeout(() => {
        // Always succeed for demo purposes
        resolve();
      }, 1000);
    });
  }
}

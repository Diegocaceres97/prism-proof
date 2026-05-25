import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./presentation/pages/product-list/product-list.page').then((m) => m.ProductListPage),
  },
  {
    path: 'login',
    loadComponent: () => import('./presentation/pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'products',
    loadComponent: () => import('./presentation/pages/product-list/product-list.page').then((m) => m.ProductListPage),
  },
  {
    path: 'product/:id',
    loadComponent: () => import('./presentation/pages/product-detail/product-detail.page').then((m) => m.ProductDetailPage),
  },
  {
    path: 'cart',
    loadComponent: () => import('./presentation/pages/cart/cart.page').then((m) => m.CartPage),
  },
  {
    path: 'checkout',
    loadComponent: () => import('./presentation/pages/checkout/checkout.page').then((m) => m.CheckoutPage),
  },
  {
    path: 'home',
    loadComponent: () => import('./presentation/presenters/home/home.page').then((m) => m.HomePage),
  },
  // Placeholder routes for bottom navigation
  {
    path: 'search',
    redirectTo: '/products',
  },
  {
    path: 'favorites',
    redirectTo: '/products', // TODO: Implement favorites page
  },
  {
    path: 'account',
    redirectTo: '/home', // TODO: Implement account page
  },
];

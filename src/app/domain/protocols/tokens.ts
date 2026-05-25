import { InjectionToken } from '@angular/core';
import { AuthRepositoryProtocol } from './auth-repository.protocol';
import { ProductRepositoryProtocol } from './product-repository.protocol';
import { CartRepositoryProtocol } from './cart-repository.protocol';

// Injection tokens for repository protocols
export const AUTH_REPOSITORY_TOKEN = new InjectionToken<AuthRepositoryProtocol>('AuthRepositoryProtocol');
export const PRODUCT_REPOSITORY_TOKEN = new InjectionToken<ProductRepositoryProtocol>('ProductRepositoryProtocol');
export const CART_REPOSITORY_TOKEN = new InjectionToken<CartRepositoryProtocol>('CartRepositoryProtocol');

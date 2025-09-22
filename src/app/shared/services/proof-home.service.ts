import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { AuthResponse, Product } from '../interfaces/proof-home.interface';

@Injectable({
  providedIn: 'root'
})
export class ProofHomeService {
  token = signal<string | null>(null);
  loading = signal<boolean>(false);
  products = signal<Product[]>([]);
  error = signal<string | null>(null);


  constructor(private http: HttpClient) { }

  async login() {
    this.loading.set(true);
    this.error.set(null);
    try {
      const res = await this.http.post<AuthResponse>(`${environment.apiBaseUrl}/auth/login`, {
        email: 'user@example.com',
        password: 'strong_password_123'
      }).toPromise();
      this.token.set(res?.token ?? null);
    } catch (e: any) {
      this.error.set(e?.message ?? 'Login error');
    } finally {
      this.loading.set(false);
    }
  }

  async getAllProducts() {
    if (!this.token()) { this.error.set('Primero realiza login'); return; }
    this.loading.set(true); this.error.set(null);
    try {
      const headers = new HttpHeaders({ Authorization: `Bearer ${this.token()}` });
      const res = await this.http.get<Product[]>(`${environment.apiBaseUrl}/products`, { headers }).toPromise();
      this.products.set(res ?? []);
    } catch (e: any) {
      this.error.set(e?.message ?? 'Products error');
    } finally {
      this.loading.set(false);
    }
  }
}

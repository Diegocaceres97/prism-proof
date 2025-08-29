import { Component, inject } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonList, IonItem, IonLabel, IonSpinner } from '@ionic/angular/standalone';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { environment } from '../../environments/environment';

interface AuthResponse { token: string; userId: string }
interface Product { id: string; name: string; price: number; description: string; imageUrl: string }

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonList, IonItem, IonLabel, IonSpinner, CommonModule],
})
export class HomePage {
  private http = inject(HttpClient);

  token: string | null = null;
  loading = false;
  products: Product[] = [];
  error: string | null = null;

  async demoLogin() {
    this.loading = true; this.error = null;
    try {
      const res = await this.http.post<AuthResponse>(`${environment.apiBaseUrl}/auth/login`, {
        email: 'user@example.com',
        password: 'strong_password_123'
      }).toPromise();
      this.token = res?.token ?? null;
    } catch (e: any) {
      this.error = e?.message ?? 'Login error';
    } finally {
      this.loading = false;
    }
  }

  async demoListProducts() {
    if (!this.token) { this.error = 'Primero realiza login'; return; }
    this.loading = true; this.error = null;
    try {
      const headers = new HttpHeaders({ Authorization: `Bearer ${this.token}` });
      const res = await this.http.get<Product[]>(`${environment.apiBaseUrl}/products`, { headers }).toPromise();
      this.products = res ?? [];
    } catch (e: any) {
      this.error = e?.message ?? 'Products error';
    } finally {
      this.loading = false;
    }
  }
}

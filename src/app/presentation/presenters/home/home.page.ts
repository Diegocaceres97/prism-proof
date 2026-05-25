import { Component, inject } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonList, IonItem, IonLabel, IonSpinner } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { HomePresenter } from './home.presenter';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonList, IonItem, IonLabel, IonSpinner, CommonModule],
})
export class HomePage {

  presenter = inject(HomePresenter);

  // Expose presenter signals to template
  loading = this.presenter.loading;
  error = this.presenter.error;
  token = this.presenter.token;
  products = this.presenter.products;

  async demoLogin() {
    console.log('demoLogin');
    await this.presenter.login();
    console.log('demoLogin completed, token:', this.token());
  }

  async demoListProducts() {
    await this.presenter.loadProducts();
  }
}

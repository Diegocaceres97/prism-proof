import { Component, inject } from '@angular/core';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonList, IonItem, IonLabel, IonSpinner } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { ProofHomeService } from '../shared/services/proof-home.service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonHeader, IonToolbar, IonTitle, IonContent, IonButton, IonList, IonItem, IonLabel, IonSpinner, CommonModule],
})
export class HomePage {

  injectProofService = inject(ProofHomeService);
  loading = this.injectProofService.loading;
  error = this.injectProofService.error;
  token = this.injectProofService.token;
  products = this.injectProofService.products;

  async demoLogin() {
    console.log('demoLogin');
    await this.injectProofService.login();
    console.log('demoLogin', this.token);
  }

  async demoListProducts() {
    await this.injectProofService.getAllProducts();
  }
}

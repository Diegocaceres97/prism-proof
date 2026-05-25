import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
  IonInput, IonIcon, IonText
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { eye, eyeOff, logoGoogle, logoApple } from 'ionicons/icons';

import { LoginPresenter } from './login.presenter';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent, IonButton,
    IonInput, IonIcon, IonText
  ]
})
export class LoginPage {
  presenter = inject(LoginPresenter);
  router = inject(Router);

  // Expose presenter signals to template
  email = this.presenter.email;
  password = this.presenter.password;
  showPassword = this.presenter.showPassword;
  loading = this.presenter.loading;
  error = this.presenter.error;

  constructor() {
    addIcons({ eye, eyeOff, logoGoogle, logoApple });
  }

  onEmailChange(event: any) {
    this.presenter.updateEmail(event.target.value);
  }

  onPasswordChange(event: any) {
    this.presenter.updatePassword(event.target.value);
  }

  togglePasswordVisibility() {
    this.presenter.togglePasswordVisibility();
  }

  async onLogin() {
    await this.presenter.login();
  }

  onGoogleLogin() {
    this.presenter.loginWithGoogle();
  }

  onAppleLogin() {
    this.presenter.loginWithApple();
  }

  onForgotPassword() {
    this.presenter.forgotPassword();
  }

  onSignUp() {
    this.presenter.navigateToSignUp();
  }
}

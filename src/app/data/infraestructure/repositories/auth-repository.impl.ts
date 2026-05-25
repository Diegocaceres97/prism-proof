import { Injectable, inject } from '@angular/core';
import { AuthRepositoryInterface } from '../../gateway/repositories';
import { AuthCredentials, AuthResult } from '../../../domain/entities';
import { HttpClientInterface } from '../../gateway/data-sources/http-client.interface';
import { HTTP_CLIENT_TOKEN } from '../../gateway/data-sources/tokens';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthRepositoryImpl implements AuthRepositoryInterface {
  private httpClient = inject(HTTP_CLIENT_TOKEN);

  async login(credentials: AuthCredentials): Promise<AuthResult> {
    const response = await this.httpClient.post<AuthResult>(
      `${environment.apiBaseUrl}/auth/login`,
      credentials
    );
    return response.data;
  }

  async logout(): Promise<void> {
    // Implementar lógica de logout si es necesario
    return Promise.resolve();
  }
}

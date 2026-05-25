import { Injectable, inject } from '@angular/core';
import { AuthCredentials, AuthResult } from '../../entities';
import { AuthRepositoryProtocol } from '../../protocols';
import { AUTH_REPOSITORY_TOKEN } from '../../protocols/tokens';

@Injectable({
  providedIn: 'root'
})
export class LoginUseCase {
  private authRepository = inject(AUTH_REPOSITORY_TOKEN);

  async execute(credentials: AuthCredentials): Promise<AuthResult> {
    return this.authRepository.login(credentials);
  }
}

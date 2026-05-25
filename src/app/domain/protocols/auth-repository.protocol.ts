import { AuthCredentials, AuthResult } from '../entities';

export interface AuthRepositoryProtocol {
  login(credentials: AuthCredentials): Promise<AuthResult>;
  logout(): Promise<void>;
}

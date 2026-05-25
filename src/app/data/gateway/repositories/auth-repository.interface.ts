import { AuthRepositoryProtocol } from '../../../domain/protocols';

// Re-export del protocolo del dominio para la capa de datos
export interface AuthRepositoryInterface extends AuthRepositoryProtocol {}

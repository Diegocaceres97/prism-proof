export interface User {
  id: string;
  email: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthResult {
  token: string;
  userId: string;
}

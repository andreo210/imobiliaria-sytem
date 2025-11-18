export interface Usuario {
  id: number;
  nome: string;
  email: string;
  papel: 'admin' | 'corretor';
  criado_em: Date;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface AuthResponse {
  token: string;
  usuario: Usuario;
}

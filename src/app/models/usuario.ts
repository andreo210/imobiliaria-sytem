export interface Usuario {
  id: number;
  nome: string;
  email: string;
  senha: string;
  papel: 'admin' | 'corretor' | 'usuario';
  ativo: boolean;
  criado_em: string;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface AuthResponse {
  token: string;
  usuario: Usuario;
}

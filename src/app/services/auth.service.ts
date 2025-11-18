import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from '../services/api';

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface AuthResponse {
  token: string;
  refresh_token: string;
  usuario: {
    id: number;
    nome: string;
    email: string;
    papel: 'admin' | 'corretor';
  };
}

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  papel: 'admin' | 'corretor';
  criado_em: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isAuthenticated = new BehaviorSubject<boolean>(this.hasToken());
  private currentUserSubject = new BehaviorSubject<Usuario | null>(this.getStoredUser());

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  /**
   * Realiza o login do usuário
   */
  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('auth/login', credentials)
      .pipe(
        tap(response => {
          this.setTokens(response.token, response.refresh_token);
         // this.setStoredUser(response.usuario);
          this.isAuthenticated.next(true);
         // this.currentUserSubject.next(response.usuario);
        })
      );
  }

  /**
   * Realiza o logout do usuário
   */
  logout(): void {
    // Tenta fazer logout no backend, mas não bloqueia se falhar
    this.apiService.post('auth/logout', {}).subscribe({
      error: (error) => console.warn('Erro no logout remoto:', error)
    });

    this.clearAuthData();
    this.isAuthenticated.next(false);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  /**
   * Atualiza o token de acesso
   */
  refreshToken(): Observable<{ token: string }> {
    const refreshToken = localStorage.getItem('refresh_token');
    return this.apiService.post<{ token: string }>('auth/refresh', {
      refresh_token: refreshToken
    }).pipe(
      tap(response => {
        localStorage.setItem('auth_token', response.token);
      })
    );
  }

  /**
   * Verifica se o usuário está autenticado
   */
  isLoggedIn(): Observable<boolean> {
    return this.isAuthenticated.asObservable();
  }

  /**
   * Obtém o usuário atual
   */
  getCurrentUser(): Observable<Usuario | null> {
    return this.currentUserSubject.asObservable();
  }

  /**
   * Obtém o token de acesso
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * Obtém o papel do usuário atual
   */
  getUserRole(): 'admin' | 'corretor' | null {
    const user = this.currentUserSubject.value;
    return user ? user.papel : null;
  }

  /**
   * Verifica se o usuário tem permissão de admin
   */
  isAdmin(): boolean {
    return this.getUserRole() === 'admin';
  }

  /**
   * Verifica se o usuário tem permissão de corretor
   */
  isCorretor(): boolean {
    return this.getUserRole() === 'corretor';
  }

  /**
   * Verifica se tem token (para inicialização)
   */
  private hasToken(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  /**
   * Armazena tokens no localStorage
   */
  private setTokens(token: string, refreshToken: string): void {
    localStorage.setItem('auth_token', token);
    localStorage.setItem('refresh_token', refreshToken);
  }

  /**
   * Armazena dados do usuário no localStorage
   */
  private setStoredUser(usuario: Usuario): void {
    localStorage.setItem('current_user', JSON.stringify(usuario));
  }

  /**
   * Obtém usuário armazenado no localStorage
   */
  private getStoredUser(): Usuario | null {
    const userStr = localStorage.getItem('current_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Limpa todos os dados de autenticação
   */
  private clearAuthData(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('current_user');
  }

  /**
   * Inicializa o serviço (chamar no app.component)
   */
  initializeAuthState(): void {
    const token = this.getToken();
    const user = this.getStoredUser();

    if (token && user) {
      this.isAuthenticated.next(true);
      this.currentUserSubject.next(user);
    } else {
      this.clearAuthData();
    }
  }
}

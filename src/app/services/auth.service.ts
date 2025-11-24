import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {BehaviorSubject, Observable, of, tap, throwError} from 'rxjs';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import * as jwt_decode from 'jwt-decode';
import {jwtDecode} from 'jwt-decode';
import {Usuario} from '../models/usuario';
import {Cliente} from '../models/cliente';





export interface LoginData {
  email: string;
  senha: string;
}

export interface RegistroData {
  nome: string;
  email: string;
  senha: string;
  papel: 'admin' | 'corretor' | 'usuario';
}

export interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  usuario: Usuario;
}

export interface TokenRefresh {
  refresh_token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000/';
  private usuarioAtual = new BehaviorSubject<Usuario | null>(null);
  private accessToken: string | null = null;
  private refreshToken: string | null = null;

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.carregarTokensSalvos();
  }

  // =============================== //
  // MÉTODOS PÚBLICOS CORRIGIDOS
  // =============================== //

  /**
   * Realiza login do usuário
   */
  login(loginData: LoginData): Observable<AuthResponse> {
    console.log('🔐 Tentando login:', loginData.email);
    return this.http.post<AuthResponse>(`${this.apiUrl}auth/login`, loginData)
      .pipe(
        tap(response => {
          console.log('✅ Login bem-sucedido:', response.usuario);
          this.salvarTokens(response.access_token, response.refresh_token);
          this.usuarioAtual.next(response.usuario);
        }),
        catchError(error => {
          console.error('❌ Erro no login:', error);
          this.limparTokens();
          return throwError(() => error);
        })
      );
  }


  /**
   * Renova os tokens usando refresh token
   */
  refreshTokens(): Observable<AuthResponse> {
    if (!this.refreshToken) {
      return throwError(() => new Error('Nenhum refresh token disponível'));
    }

    console.log('🔄 Renovando tokens...');
    return this.http.post<AuthResponse>(`${this.apiUrl}auth/refresh`, {
      refresh_token: this.refreshToken
    }).pipe(
      tap(response => {
        console.log('✅ Tokens renovados com sucesso');
        this.salvarTokens(response.access_token, response.refresh_token);
        if (response.usuario) {
          this.usuarioAtual.next(response.usuario);
        }
      }),
      catchError(error => {
        console.error('❌ Erro ao renovar tokens:', error);
        this.logout();
        return throwError(() => error);
      })
    );
  }

  /**
   * Registra novo usuário (apenas para administradores)
   */
  registrar(registroData: RegistroData): Observable<Usuario> {
    console.log('👥 Registrando novo usuário:', registroData.email);
    return this.http.post<Usuario>(`${this.apiUrl}usuarios`, registroData)
      .pipe(
        tap(usuario => {
          console.log('✅ Usuário registrado com sucesso:', usuario);
        }),
        catchError(error => {
          console.error('❌ Erro ao registrar usuário:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Realiza logout
   */
  logout(): void {
    console.log('🚪 Realizando logout...');

    if (this.refreshToken) {
      this.http.post(`${this.apiUrl}auth/logout`, {
        refresh_token: this.refreshToken
      }).subscribe({
        next: () => console.log('✅ Logout no servidor realizado'),
        error: (error) => console.warn('⚠️ Erro ao fazer logout no servidor:', error)
      });
    }

    this.limparTokens();
    this.usuarioAtual.next(null);
    this.router.navigate(['/login']);
  }


  obterUsuarioAtual(): Observable<Usuario | null> {
    console.log('🔍 Solicitando dados do usuário atual...');

    // Se já temos um usuário carregado, retorna imediatamente
    if (this.usuarioAtual.value) {
      console.log('✅ Usuário já carregado:', this.usuarioAtual.value.nome);
      return this.usuarioAtual.asObservable();
    }

    // Se temos tokens mas não temos usuário, tenta carregar
    if (this.accessToken && !this.usuarioAtual.value) {
      console.log('🔄 Carregando usuário do servidor...');
      this.validarEAtualizarUsuario();
    }

    return this.usuarioAtual.asObservable();
  }


  /**
   * Verifica se usuário está autenticado
   */
  estaAutenticado(): boolean {
    const autenticado = !!this.accessToken;
    console.log('🔐 Está autenticado?:', autenticado);
    return autenticado;
  }

  /**
   * Verifica se usuário é administrador
   */
  isAdmin(): boolean {
    const usuario = this.usuarioAtual.value;
    const isAdmin = usuario?.papel === 'admin';
    console.log('👑 É admin?:', isAdmin, 'Papel:', usuario?.papel);
    return isAdmin;
  }

  /**
   * Obtém access token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Obtém refresh token
   */
  getRefreshToken(): string | null {
    return this.refreshToken;
  }

  /**
   * Atualiza dados do usuário (após edição)
   */

  /**
   * Obtém dados do usuário atual do servidor - CORRIGIDO
   *//*
  carregarUsuarioAtual(): Observable<Usuario> {
    console.log('🌐 Buscando usuário do endpoint /eu...');
    return this.http.get<any>(`${this.apiUrl}auth/eu`).pipe(
      tap(usuarioData => {
        console.log('✅ Dados do usuário recebidos:', usuarioData);
      }),
      catchError(error => {
        console.error('❌ Erro ao carregar usuário:', error);
        return throwError(() => error);
      })
    );
  }
*/
  carregarUsuarioAtual(): Observable<Usuario> {
  console.log('🔑 Lendo accessToken do localStorage...');

  const token = localStorage.getItem('access_token');
  if (!token) {
    console.error('❌ Nenhum token encontrado no localStorage');
    return throwError(() => new Error('Token não encontrado'));
  }

  try {
    const usuarioData: Usuario = jwtDecode<Usuario>(token);
    console.log('✅ Token decodificado:', usuarioData);
    return of(usuarioData);
  } catch (error) {
    console.error('❌ Erro ao decodificar token:', error);
    return throwError(() => error);
  }
}
  /**
   * Força a atualização dos dados do usuário
   */
  atualizarDadosUsuario(): void {
    if (this.accessToken) {
      this.validarEAtualizarUsuario();
    }
  }

  // =============================== //
  // MÉTODOS PRIVADOS CORRIGIDOS
  // =============================== //

  /**
   * Carrega tokens salvos no localStorage ao inicializar - CORRIGIDO
   */
  private carregarTokensSalvos(): void {
    const accessToken = localStorage.getItem('access_token');
    const refreshToken = localStorage.getItem('refresh_token');

    console.log('📂 Carregando tokens do localStorage...');
    console.log('   - Access Token:', accessToken ? '✅ Existe' : '❌ Não existe');
    console.log('   - Refresh Token:', refreshToken ? '✅ Existe' : '❌ Não existe');

    if (accessToken && refreshToken) {
      this.accessToken = accessToken;
      this.refreshToken = refreshToken;
      console.log('🚀 Tokens carregados, validando usuário...');
      this.validarEAtualizarUsuario();
    } else {
      console.log('📭 Nenhum token encontrado, usuário não está logado');
      this.usuarioAtual.next(null);
    }
  }

  /**
   * Salva tokens no localStorage e service
   */
  private salvarTokens(accessToken: string, refreshToken: string): void {
    console.log('💾 Salvando tokens...');
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    console.log('✅ Tokens salvos com sucesso');
  }

  /**
   * Limpa tokens (logout)
   */
  private limparTokens(): void {
    console.log('🧹 Limpando tokens...');
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    console.log('✅ Tokens removidos');
  }

  /**
   * Valida token e atualiza dados do usuário - CORRIGIDO
   */
  private validarEAtualizarUsuario(): void {
    console.log('🔐 Validando token e atualizando usuário...');

    this.carregarUsuarioAtual().subscribe({
      next: (usuarioData) => {
        console.log('✅ Token válido, usuário autenticado:', usuarioData);

        // Converte os dados para o formato Usuario
        const usuario: Usuario = {
          id: usuarioData.id,
          nome: usuarioData.nome,
          email: usuarioData.email,
          senha : usuarioData.senha,
          papel: usuarioData.papel,
          ativo: true,
          criado_em: new Date().toISOString()
        };

        console.log('👤 Usuário convertido:', usuario);
        this.usuarioAtual.next(usuario);
      },
      error: (error) => {
        console.error('❌ Erro ao validar token:', error);

        // Se o access token estiver expirado, tenta renovar
        if (this.refreshToken) {
          console.log('🔄 Token expirado, tentando renovar...');
          this.refreshTokens().subscribe({
            error: () => {
              console.log('❌ Não foi possível renovar tokens, fazendo logout...');
              this.logout();
            }
          });
        } else {
          console.log('❌ Sem refresh token, fazendo logout...');
          this.logout();
        }
      }
    });
  }
  obterUsuario(id: number): Observable<Usuario> {
      return this.http.get<Usuario>(`${this.apiUrl}usuarios/${id}`);
    }
  listarUsuario(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(`${this.apiUrl}usuarios`);
  }

  excluirUsuario(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}usuarios/${id}`);


  }
 atualizarUsuario(id: number, usuario: Usuario): Observable<Usuario> {
  return this.http.put<Usuario>(`${this.apiUrl}usuarios/${id}`, usuario);
}


getCurrentUser(): Usuario | null {
  return this.usuarioAtual.value;
}
  // =============================== //
  // MÉTODOS DE DEBUG
  // =============================== //

  /**
   * Método para debug - mostra estado atual do service
   */
  debugEstado(): void {
    console.log('=== 🔍 DEBUG AUTH SERVICE ===');
    console.log('Access Token:', this.accessToken);
    console.log('Refresh Token:', this.refreshToken);
    console.log('Usuário atual:', this.usuarioAtual.value);
    console.log('Está autenticado:', this.estaAutenticado());
    console.log('É admin:', this.isAdmin());
    console.log('LocalStorage access_token:', localStorage.getItem('access_token'));
    console.log('LocalStorage refresh_token:', localStorage.getItem('refresh_token'));
    console.log('================================');
  }

  /**
   * Método para testar conexão com o backend
   */
  testarConexao(): Observable<any> {
    console.log('🧪 Testando conexão com o backend...');
    return this.http.get(`${this.apiUrl}auth/eu`).pipe(
      tap(() => console.log('✅ Conexão com backend OK')),
      catchError(error => {
        console.error('❌ Erro na conexão com backend:', error);
        return throwError(() => error);
      })
    );
  }
}

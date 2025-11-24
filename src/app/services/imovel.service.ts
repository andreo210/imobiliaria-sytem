import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from './auth.service';

export interface TipoImovel {
  id: number;
  nome: string;
  descricao?: string;
}

export interface Amenidade {
  id: number;
  nome: string;
  icone?: string;
}

export interface Foto {
  id?: number;
  url: string;
  imovel_id?: number;
  ordem?: number;
}

export interface Imovel {
  id?: number;
  titulo: string;
  descricao: string;
  preco: number;
  status: 'DISPONIVEL' | 'ALUGADO' | 'VENDIDO' | 'INDISPONIVEL';
  tipo_id: number;
  usuario_id: number;
  amenidades_ids: number[];
  fotos: Foto[];
  created_at?: string;
  updated_at?: string;
}

export interface ImovelResponse {
  data: Imovel[];
  total?: number;
  current_page?: number;
  last_page?: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ImovelService {
  private baseUrl = 'http://127.0.0.1:8000';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private getHeaders(): HttpHeaders {
    const token = this.authService.getAccessToken();
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  private getHeadersMultipart(): HttpHeaders {
    const token = this.authService.getAccessToken();
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
      // Não definir Content-Type para multipart/form-data
    });
  }

  private handleError(error: any): Observable<never> {
    console.error('Erro na requisição:', error);

    let errorMessage = 'Erro desconhecido';
    if (error.error instanceof ErrorEvent) {
      // Erro do cliente
      errorMessage = `Erro: ${error.error.message}`;
    } else {
      // Erro do servidor
      if (error.status === 401) {
        errorMessage = 'Sessão expirada. Faça login novamente.';
        this.authService.logout();
      } else if (error.status === 403) {
        errorMessage = 'Você não tem permissão para realizar esta ação.';
      } else if (error.status === 404) {
        errorMessage = 'Recurso não encontrado.';
      } else {
        errorMessage = `Erro ${error.status}: ${error.message}`;
      }
    }

    return throwError(() => new Error(errorMessage));
  }

  // =============================================
  // TIPOS DE IMÓVEL
  // =============================================

  getTiposImovel(): Observable<TipoImovel[]> {
    return this.http.get<TipoImovel[]>(`${this.baseUrl}/tipoimovel/`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  getTipoImovelById(id: number): Observable<TipoImovel> {
    return this.http.get<TipoImovel>(`${this.baseUrl}/tipoimovel/${id}/`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // =============================================
  // AMENIDADES
  // =============================================

  getAmenidades(): Observable<Amenidade[]> {
    return this.http.get<Amenidade[]>(`${this.baseUrl}/amenidades/`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  getAmenidadeById(id: number): Observable<Amenidade> {
    return this.http.get<Amenidade>(`${this.baseUrl}/amenidades/${id}/`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // =============================================
  // IMÓVEIS
  // =============================================

  getImoveis(params?: {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
    tipo_id?: number;
    min_preco?: number;
    max_preco?: number;
  }): Observable<Imovel[]> {
    let httpParams = new HttpParams();

    if (params) {
      Object.keys(params).forEach(key => {
        const value = params[key as keyof typeof params];
        if (value !== undefined && value !== null && value !== '') {
          httpParams = httpParams.set(key, value.toString());
        }
      });
    }

    return this.http.get<Imovel[]>(`${this.baseUrl}/imoveis/`, {
      headers: this.getHeaders(),
      params: httpParams
    }).pipe(
      catchError(this.handleError)
    );
  }

  getImovelById(id: number): Observable<Imovel> {
    return this.http.get<Imovel>(`${this.baseUrl}/imoveis/${id}/`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  createImovel(imovel: Imovel): Observable<Imovel> {
    return this.http.post<Imovel>(`${this.baseUrl}/imoveis/`, imovel, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  updateImovel(id: number, imovel: Partial<Imovel>): Observable<Imovel> {
    return this.http.put<Imovel>(`${this.baseUrl}/imoveis/${id}/`, imovel, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  deleteImovel(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/imoveis/${id}/`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // =============================================
  // FOTOS
  // =============================================

  uploadFoto(imovelId: number, file: File): Observable<Foto> {
    const formData = new FormData();
    formData.append('foto', file);
    formData.append('imovel_id', imovelId.toString());

    return this.http.post<Foto>(`${this.baseUrl}/imoveis/${imovelId}/fotos/`, formData, {
      headers: this.getHeadersMultipart()
    }).pipe(
      catchError(this.handleError)
    );
  }

  uploadFotos(imovelId: number, files: File[]): Observable<Foto[]> {
    const uploadRequests = files.map(file => this.uploadFoto(imovelId, file));

    // Executa todos os uploads em paralelo
    return new Observable<Foto[]>(observer => {
      const results: Foto[] = [];
      let completed = 0;

      uploadRequests.forEach((request, index) => {
        request.subscribe({
          next: (foto) => {
            results[index] = foto;
            completed++;

            if (completed === files.length) {
              observer.next(results);
              observer.complete();
            }
          },
          error: (error) => {
            observer.error(error);
          }
        });
      });
    });
  }

  deleteFoto(imovelId: number, fotoId: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/imoveis/${imovelId}/fotos/${fotoId}/`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  getFotosImovel(imovelId: number): Observable<Foto[]> {
    return this.http.get<Foto[]>(`${this.baseUrl}/imoveis/${imovelId}/fotos/`, {
      headers: this.getHeaders()
    }).pipe(
      catchError(this.handleError)
    );
  }

  // =============================================
  // MÉTODOS AUXILIARES
  // =============================================

  /**
   * Obtém o ID do usuário atual do AuthService
   */
  getCurrentUserId(): number {
    // Você pode precisar ajustar isso conforme sua implementação do AuthService
    // Se o AuthService não tiver o ID diretamente, você pode obter do token
    const token = this.authService.getAccessToken();
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        return decoded.user_id || decoded.id;
      } catch (error) {
        console.error('Erro ao decodificar token:', error);
      }
    }
    return 0; // Fallback
  }

  /**
   * Verifica se o usuário atual tem permissão para gerenciar imóveis
   */
  canManageImoveis(): boolean {
    return this.authService.estaAutenticado() &&
           (this.authService.isAdmin() || this.getCurrentUserRole() === 'corretor');
  }

  /**
   * Obtém o papel do usuário atual
   */
  private getCurrentUserRole(): string {
    const token = this.authService.getAccessToken();
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        return decoded.role || decoded.papel;
      } catch (error) {
        console.error('Erro ao decodificar token:', error);
      }
    }
    return '';
  }
}

// Função auxiliar para decodificar JWT
function jwtDecode(token: string): any {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (error) {
    console.error('Erro ao decodificar JWT:', error);
    return {};
  }
}

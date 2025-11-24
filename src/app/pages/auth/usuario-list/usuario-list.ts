import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Usuario } from '../../../models/usuario';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-usuario-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './usuario-list.html', // ajuste no nome do arquivo
  styleUrls: ['./usuario-list.css']   // ajuste no nome do arquivo
})
export class UsuarioListComponent implements OnInit {
  usuarios: Usuario[] = [];
  loading: boolean = true;
  successMessage: string | null = null;

  constructor(
    private usuarioService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Verificar mensagem de sucesso
    this.route.queryParams.subscribe(params => {
      this.successMessage = params['success'] || null;

      // Remover mensagem após 5 segundos
      if (this.successMessage) {
        setTimeout(() => {
          this.successMessage = null;
        }, 5000);
      }
    });

    this.carregarUsuario();
  }

  carregarUsuario() {
    this.loading = true;
    this.usuarioService.listarUsuario().subscribe({
      next: (usu) => {
        this.usuarios = usu;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar usuários:', error);
        this.loading = false;
      }
    });
  }

  editarUsuario(usuario: Usuario) {
    this.router.navigate(['/usuarios/edit', usuario.id]);
  }

  excluirUsuario(usuario: Usuario) {
    if (confirm(`Tem certeza que deseja excluir o usuário "${usuario.nome}"?`)) {
      if (usuario.id) {
        this.usuarioService.excluirUsuario(usuario.id).subscribe({
          next: () => {
            this.carregarUsuario(); // Recarregar a lista
          },
          error: (error) => {
            console.error('Erro ao excluir usuário:', error);
            alert('Erro ao excluir usuário');
          }
        });
      }
    }
  }

  formatarData(data: string): string {
    return new Date(data).toLocaleDateString('pt-BR');
  }
}

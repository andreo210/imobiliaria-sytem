import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {ActivatedRoute, Router, RouterModule} from '@angular/router';
import { AuthService, RegistroData } from '../../../services/auth.service';
import {Usuario} from '../../../models/usuario';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './registro.html',
  styleUrls: ['./registro.css']
})
export class RegistroComponent implements OnInit {
  registroData: RegistroData = {
    nome: '',
    email: '',
    senha: '',
    papel: 'usuario'
  };

   user: Usuario = {
    nome: '',
     id: 0,
     ativo: false,
     criado_em:'',
    email: '',
    senha: '',
    papel: 'usuario'
  };

  confirmarSenha: string = '';
  loading: boolean = false;
  error: string = '';
  success: string = '';
  isEdit: boolean = false;

  papeis = [
    { value: 'corretor', label: 'Corretor' },
    { value: 'admin', label: 'Administrador' }
  ];

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Verifica se usuário é admin
    if (!this.authService.isAdmin()) {
      this.router.navigate(['/dashboard']);
    }
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.carregarUsuario(parseInt(id));
    }
  }
  carregarUsuario(id: number) {
    this.loading = true;
    this.authService.obterUsuario(id).subscribe({
      next: (usuario) => {
        this.user = usuario;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar cliente-form:', error);
        this.loading = false;
        this.error = 'Erro ao carregar dados do cliente-form';
      }
    });
  }

  onSubmit(): void {
    this.loading = true;
    this.error = '';
    this.success = '';

    // Validação de senha
    if (this.user.senha !== this.confirmarSenha) {
      this.error = 'As senhas não coincidem';
      this.loading = false;
      return;
    }

    // Validação de força da senha
    if (this.user.senha.length < 6) {
      this.error = 'A senha deve ter pelo menos 6 caracteres';
      this.loading = false;
      return;
    }
    if (this.isEdit && this.user.id) {
      this.atualizarUsuario();
    } else {

      this.authService.registrar(this.user).subscribe({
        next: (usuario) => {
          this.loading = false;
          this.success = `Usuário ${usuario.nome} criado com sucesso!`;

          // Limpa o formulário após sucesso
          setTimeout(() => {
            this.registroData = {
              nome: '',
              email: '',
              senha: '',
              papel: 'usuario'
            };
            this.confirmarSenha = '';
          }, 2000);
        },
        error: (error) => {
          this.loading = false;
          this.error = error.error?.detail || 'Erro ao criar usuário. Tente novamente.';
        }
      });
    }
  }

  isFormValid(): boolean {
    return !!this.user.nome &&
           !!this.user.email &&
           !!this.user.senha &&
           !!this.confirmarSenha &&
           this.user.senha.length >= 6;
  }

  formatarPapel(papel: string): string {
    const papeis: { [key: string]: string } = {
      'admin': 'Administrador',
      'corretor': 'Corretor',
      'usuario': 'Usuário'
    };
    return papeis[papel] || papel;
  }

  voltarParaLista(): void {
    this.router.navigate(['/usuarios']);
  }

  atualizarUsuario() {
    if (!this.user.id) return;

    this.authService.atualizarUsuario(this.user.id,this.user).subscribe({
     next: (usua: Usuario) => {
    this.loading = false;
    this.router.navigate(['/usuarios'], {
      queryParams: { success: 'Usuário atualizado com sucesso!' }
    });
  },
  error: (err: any) => {
    this.loading = false;
    this.error = err.error?.detail || 'Erro ao atualizar usuário';
  }
});
  }
}



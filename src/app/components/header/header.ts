import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // ← ADICIONAR ESTA LINHA
import { AuthService} from '../../services/auth.service';
import { Usuario } from '../../models/usuario';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule // ← ADICIONAR ESTA LINHA
  ],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent implements OnInit {
  searchTerm: string = '';
  userName: string = 'Usuário';
  userRole: string = 'Carregando...';
  userInitials: string = 'U';
  showUserMenu: boolean = false;
  showNotifications: boolean = false;
  unreadNotifications: number = 0;

  usuario: Usuario | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Observar mudanças no usuário
    this.authService.obterUsuarioAtual().subscribe(usuario => {
      this.usuario = usuario;
      if (usuario) {
        this.userName = usuario.nome;
        this.userRole = this.formatarPapel(usuario.papel);
        this.userInitials = this.gerarIniciais(usuario.nome);
      } else {
        this.userName = 'Usuário';
        this.userRole = 'Não logado';
        this.userInitials = 'U';
      }
    });
  }

  private formatarPapel(papel: string): string {
    const papeis: { [key: string]: string } = {
      'admin': 'Administrador',
      'corretor': 'Corretor',
      'usuario': 'Usuário'
    };
    return papeis[papel] || 'Usuário';
  }

  private gerarIniciais(nome: string): string {
    return nome
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  onSearch() {
    console.log('Searching for:', this.searchTerm);
    // Implementar lógica de busca aqui
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
    this.showNotifications = false;
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    this.showUserMenu = false;
  }

  navigateToProfile() {
    this.showUserMenu = false;
    console.log('Navegar para perfil');
    // this.router.navigate(['/profile']);
  }

  openSettings() {
    this.showUserMenu = false;
    console.log('Abrir configurações');
    // this.router.navigate(['/settings']);
  }

  logout() {
    this.showUserMenu = false;
    this.authService.logout();
  }
  // No HeaderComponent, adicione:
  testarAuthService() {
    console.log('=== TESTE AUTH SERVICE ===');
    console.log('Access Token:', this.authService.getAccessToken());
    console.log('Refresh Token:', this.authService.getRefreshToken());
    console.log('Está autenticado:', this.authService.estaAutenticado());
    console.log('É admin:', this.authService.isAdmin());

    this.authService.obterUsuarioAtual().subscribe(
      usuario => console.log('Usuário do Observable:', usuario),
      error => console.error('Erro no Observable:', error)
    );
  }
}

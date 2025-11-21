import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header';
import { Sidebar } from './components/sidebar/sidebar';
import { Footer } from './components/footer/footer';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    HeaderComponent,
    Sidebar,
    Footer
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit {
  title = 'InnoveL - Sistema Imobiliário';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    console.log('🚀 AppComponent: Inicializando aplicação...');

    // Isso força o carregamento do usuário ao iniciar a aplicação
    this.authService.obterUsuarioAtual().subscribe({
      next: (usuario) => {
        console.log('✅ AppComponent: Usuário carregado:', usuario);
      },
      error: (error) => {
        console.error('❌ AppComponent: Erro ao carregar usuário:', error);
      }
    });
  }
}

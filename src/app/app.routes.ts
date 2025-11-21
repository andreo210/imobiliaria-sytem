import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { LoginComponent } from './pages/auth/login/login';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  // REMOVA esta linha duplicada: { path: '', component: Home },

  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },

  // Rotas Públicas
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login').then(m => m.LoginComponent)
  },

  // Rotas Protegidas
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [AuthGuard]
  },

  // Rotas de Clientes
  {
    path: 'clientes',
    loadComponent: () => import('./pages/clientes/cliente-list/cliente-list').then(m => m.ClienteListComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'clientes/new',
    loadComponent: () => import('./pages/clientes/cliente-form/cliente-form').then(m => m.ClienteFormComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'clientes/view/:id',
    loadComponent: () => import('./pages/clientes/cliente-view/cliente-view').then(m => m.ClienteViewComponent),
    canActivate: [AuthGuard]
  },
  {
    path: 'clientes/edit/:id',
    loadComponent: () => import('./pages/clientes/cliente-form/cliente-form').then(m => m.ClienteFormComponent),
    canActivate: [AuthGuard]
  },

  // Rotas de Usuários (Apenas Admin) - DESCOMENTE
  {
    path: 'usuarios',
    loadComponent: () => import('./pages/auth/usuario-list/usuario-list').then(m => m.UsuarioListComponent),
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'usuarios/novo',
    loadComponent: () => import('./pages/auth/registro/registro').then(m => m.RegistroComponent),
    canActivate: [AuthGuard, AdminGuard]
  },
  {
    path: 'usuarios/edit/:id',
    loadComponent: () => import('./pages/auth/registro/registro').then(m => m.RegistroComponent),
    canActivate: [AuthGuard, AdminGuard]
  },

  // Rota fallback - APENAS UMA
  { path: '**', redirectTo: '/dashboard' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { LoginComponent} from './pages/login/login';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'login', component: LoginComponent},
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
   {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard').then(m => m.DashboardComponent)
  },
   {
    path: 'clientes/new',
    loadComponent: () => import('./pages/clientes/cliente-form/cliente-form').then(m => m.ClienteFormComponent)
  },
   {
    path: 'clientes',
    loadComponent: () => import('./pages/clientes/cliente-list/cliente-list').then(m => m.ClienteListComponent)
  },
  {
    path: 'clientes/edit/:id',
    loadComponent: () => import('./pages/clientes/cliente-form/cliente-form').then(m => m.ClienteFormComponent)
  },


  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import {NgForOf} from '@angular/common';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  active: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  templateUrl: './sidebar.html',
  imports: [
    NgForOf
  ],
  styleUrls: ['./sidebar.css']
})
export class Sidebar {
  menuItems: MenuItem[] = [
    { icon: '📊', label: 'Dashboard', route: '/dashboard', active: true },
    { icon: '🏠', label: 'Imóveis', route: '/properties', active: false },
    { icon: '👥', label: 'Clientes', route: '/clients', active: false },
    { icon: '📝', label: 'Contratos', route: '/contracts', active: false },
    { icon: '💰', label: 'Pagamentos', route: '/payments', active: false },
    { icon: '📅', label: 'Visitas', route: '/visits', active: false },
    { icon: '👨‍💼', label: 'Usuários', route: '/users', active: false },
    { icon: '⚙️', label: 'Configurações', route: '/settings', active: false }
  ];

  constructor(private router: Router) {}

  navigateTo(route: string, item: MenuItem) {
    this.menuItems.forEach(menu => menu.active = false);
    item.active = true;
    this.router.navigate([route]);
  }
}

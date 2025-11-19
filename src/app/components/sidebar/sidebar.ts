import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

interface MenuItem {
  icon: string;
  label: string;
  route?: string;
  active: boolean;
  expanded?: boolean;
  children?: SubMenuItem[];
}

interface SubMenuItem {
  label: string;
  route: string;
  active: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class Sidebar {
  menuItems: MenuItem[] = [
    {
      icon: '📊',
      label: 'Dashboard',
      route: '/dashboard',
      active: true
    },
    {
      icon: '🏠',
      label: 'Imóveis',
      route: '/properties',
      active: false
    },
    {
      icon: '👥',
      label: 'Clientes',
      active: false,
      expanded: false,
      children: [
        { label: 'Exibir Todos', route: '/clientes', active: false },
        { label: 'Novo Cliente', route: '/clientes/new', active: false }
      ]
    },
    {
      icon: '📝',
      label: 'Contratos',
      route: '/contracts',
      active: false
    },
    {
      icon: '💰',
      label: 'Pagamentos',
      route: '/payments',
      active: false
    },
    {
      icon: '📅',
      label: 'Visitas',
      route: '/visits',
      active: false
    },
    {
      icon: '👨‍💼',
      label: 'Usuários',
      route: '/users',
      active: false
    },
    {
      icon: '⚙️',
      label: 'Configurações',
      route: '/settings',
      active: false
    }
  ];

  constructor(private router: Router) {}

  navigateTo(route: string, item: MenuItem) {
    // Se for um item sem filhos, navega diretamente
    if (!item.children) {
      this.menuItems.forEach(menu => menu.active = false);
      item.active = true;
      this.router.navigate([route]);
    } else {
      // Se for um item com filhos, apenas expande/contrai
      this.toggleSubmenu(item);
    }
  }

  navigateToSubmenu(parentItem: MenuItem, subItem: SubMenuItem, event: Event) {
    event.stopPropagation();

    // Fecha todos os menus
    this.menuItems.forEach(menu => {
      menu.active = false;
      if (menu.children) {
        menu.children.forEach(child => child.active = false);
      }
    });

    // Ativa o pai e o item filho
    parentItem.active = true;
    parentItem.expanded = true;
    subItem.active = true;

    this.router.navigate([subItem.route]);
  }

  toggleSubmenu(item: MenuItem) {
    // Fecha outros submenus abertos
    this.menuItems.forEach(menu => {
      if (menu !== item && menu.children) {
        menu.expanded = false;
      }
    });

    // Alterna o estado do submenu atual
    item.expanded = !item.expanded;
  }

  isActive(route: string): boolean {
    return this.router.url === route;
  }

  // Verifica se algum subitem está ativo
  hasActiveChild(children: SubMenuItem[]): boolean {
    return children.some(child => this.router.url === child.route);
  }
}

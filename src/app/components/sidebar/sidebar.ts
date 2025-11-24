import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

interface MenuItem {
  icon: string;
  label: string;
  route?: string;
  active: boolean;
  expanded?: boolean;
  children?: SubMenuItem[];
  requiredRole?: 'admin' | 'corretor' | 'usuario';
}

interface SubMenuItem {
  label: string;
  route: string;
  active: boolean;
  requiredRole?: 'admin' | 'corretor' | 'usuario';
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class Sidebar implements OnInit {
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
      route: '/imoveis/novo',
      active: false
    },
    {
      icon: '👥',
      label: 'Clientes',
      active: false,
      expanded: false,
      children: [
        { label: 'Listar Clientes', route: '/clientes', active: false },
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
      icon: '👥',
      label: 'Usuários',
      active: false,
      expanded: false,
      requiredRole: 'admin',
      children: [
        { label: 'Listar Usuários', route: '/usuarios', active: false, requiredRole: 'admin' },
        { label: 'Novo Usuário', route: '/usuarios/novo', active: false, requiredRole: 'admin' }
      ]
    },
    {
      icon: '⚙️',
      label: 'Configurações',
      route: '/settings',
      active: false
    }
  ];

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.updateActiveState();

    this.router.events.subscribe(() => {
      this.updateActiveState();
    });
  }

  updateActiveState() {
    const currentUrl = this.router.url;

    this.menuItems.forEach(item => {
      item.active = item.route === currentUrl;

      if (item.children) {
        const hasActiveChild = item.children.some(child => {
          const isActive = child.route === currentUrl;
          if (isActive) {
            child.active = true;
          }
          return isActive;
        });

        if (hasActiveChild) {
          item.active = true;
          item.expanded = true;
        }
      }
    });
  }

  hasActiveChild(children: SubMenuItem[]): boolean {
    return children.some(child => this.router.url === child.route);
  }

  navigateTo(route: string, item: MenuItem) {
    if (item.requiredRole && !this.hasPermission(item.requiredRole)) {
      return;
    }

    if (!item.children) {
      this.closeAllMenus();
      item.active = true;
      this.router.navigate([route]);
    } else {
      this.toggleSubmenu(item);
    }
  }

  navigateToSubmenu(parentItem: MenuItem, subItem: SubMenuItem, event: Event) {
    event.stopPropagation();

    if (subItem.requiredRole && !this.hasPermission(subItem.requiredRole)) {
      return;
    }

    this.closeAllMenus();
    parentItem.active = true;
    parentItem.expanded = true;
    subItem.active = true;

    this.router.navigate([subItem.route]);
  }

  toggleSubmenu(item: MenuItem) {
    console.log('Abrindo/fechando submenu:', item.label);
    item.expanded = !item.expanded;

    if (item.expanded) {
      this.menuItems.forEach(menu => {
        if (menu !== item && menu.children) {
          menu.expanded = false;
        }
      });
    }
  }

  closeAllMenus() {
    this.menuItems.forEach(menu => {
      menu.active = false;
      if (menu.children) {
        menu.children.forEach(child => child.active = false);
      }
    });
  }

  hasPermission(requiredRole: string): boolean {
    if (requiredRole === 'admin') {
      return this.authService.isAdmin();
    }
    return true;
  }

  shouldShowItem(item: MenuItem): boolean {
    if (item.requiredRole) {
      return this.hasPermission(item.requiredRole);
    }

    if (item.children) {
      return item.children.some(child =>
        !child.requiredRole || this.hasPermission(child.requiredRole)
      );
    }

    return true;
  }

  shouldShowSubitem(subItem: SubMenuItem): boolean {
    if (subItem.requiredRole) {
      return this.hasPermission(subItem.requiredRole);
    }
    return true;
  }
}

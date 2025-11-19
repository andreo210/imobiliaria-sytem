import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent {
  searchTerm: string = '';
  userName: string = 'João Silva';
  userRole: string = 'Administrador';
  userInitials: string = 'JS';
  showUserMenu: boolean = false;
  showNotifications: boolean = false;
  unreadNotifications: number = 3;

  notifications = [
    { text: 'Novo contrato criado para Apartamento Centro', time: '5 min ago', read: false },
    { text: 'Visita agendada para Casa Jardins amanhã', time: '1 hora atrás', read: true },
    { text: 'Pagamento recebido de Maria Silva', time: '2 horas atrás', read: true },
    { text: 'Novo cliente-form cadastrado no sistema', time: '1 dia atrás', read: true }
  ];

  constructor(private router: Router) {}

  onSearch() {
    console.log('Searching for:', this.searchTerm);
  }

  toggleUserMenu() {
    this.showUserMenu = !this.showUserMenu;
    if (this.showUserMenu) {
      this.showNotifications = false;
    }
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      this.showUserMenu = false;
      this.markNotificationsAsRead();
    }
  }

  closeNotifications() {
    this.showNotifications = false;
  }

  markNotificationsAsRead() {
    this.notifications.forEach(notification => notification.read = true);
    this.unreadNotifications = 0;
  }

  navigateToProfile() {
    this.showUserMenu = false;
    this.router.navigate(['/profile']);
  }

  openSettings() {
    this.showUserMenu = false;
    this.router.navigate(['/settings']);
  }

  logout() {
    this.showUserMenu = false;
    this.router.navigate(['/login']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;

    if (!target.closest('.user-actions') && !target.closest('.notifications-panel')) {
      this.showUserMenu = false;
      this.showNotifications = false;
    }
  }
}

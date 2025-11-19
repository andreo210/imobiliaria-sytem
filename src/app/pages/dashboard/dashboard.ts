import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DashboardService, DashboardData, DashboardStats } from '../../services/dashboard.service';

interface StatCard {
  icon: string;
  value: number;
  label: string;
  color: string;
  format?: 'currency' | 'number';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  dashboardData!: DashboardData;
  loading: boolean = true;

  statCards: StatCard[] = [];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.loadDashboardData();
  }

  loadDashboardData() {
    this.loading = true;
    this.dashboardService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.updateStatCards(data.stats);
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar dashboard:', error);
        this.loading = false;
      }
    });
  }

  updateStatCards(stats: DashboardStats) {
    this.statCards = [
      {
        icon: '🏠',
        value: stats.total_properties,
        label: 'Imóveis Ativos',
        color: 'primary'
      },
      {
        icon: '👥',
        value: stats.total_clients,
        label: 'Clientes',
        color: 'success'
      },
      {
        icon: '📝',
        value: stats.active_contracts,
        label: 'Contratos Ativos',
        color: 'warning'
      },
      {
        icon: '💰',
        value: stats.monthly_revenue,
        label: 'Receita do Mês',
        color: 'danger',
        format: 'currency'
      }
    ];
  }

  formatValue(value: number, format?: string): string {
    if (format === 'currency') {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(value);
    }
    return value.toString();
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }
}

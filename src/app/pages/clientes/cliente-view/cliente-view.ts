import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { ClienteService} from '../../../services/cliente.service';
import { Cliente } from '../../../models/cliente';

@Component({
  selector: 'app-cliente-view',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cliente-view.html',
  styleUrls: ['./cliente-view.css']
})
export class ClienteViewComponent implements OnInit {
  cliente: Cliente | null = null;
  loading: boolean = true;
  error: string | null = null;

  constructor(
    private clienteService: ClienteService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.carregarCliente(parseInt(id));
    } else {
      this.error = 'ID do cliente não encontrado';
      this.loading = false;
    }
  }

  carregarCliente(id: number) {
    this.loading = true;
    this.error = null;

    this.clienteService.obterCliente(id).subscribe({
      next: (cliente) => {
        this.cliente = cliente;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar cliente:', error);
        this.error = 'Erro ao carregar dados do cliente';
        this.loading = false;
      }
    });
  }

  editarCliente() {
    if (this.cliente?.id) {
      this.router.navigate(['/clientes/edit', this.cliente.id]);
    }
  }

  voltarParaLista() {
    this.router.navigate(['/clientes']);
  }

  formatarData(data: string): string {
    return new Date(data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatarTelefone(telefone: string): string {
    // Formatação básica de telefone
    const cleaned = telefone.replace(/\D/g, '');
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return telefone;
  }
}

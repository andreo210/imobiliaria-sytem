import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { Cliente } from '../../../models/cliente';
import {ClienteService} from '../../../services/cliente.service';
@Component({
  selector: 'app-cliente-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cliente-list.html',
  styleUrls: ['./cliente-list.css']
})
export class ClienteListComponent implements OnInit {
  clientes: Cliente[] = [];
  loading: boolean = true;
  successMessage: string | null = null;

  constructor(
    private clienteService: ClienteService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Verificar mensagem de sucesso
    this.route.queryParams.subscribe(params => {
      this.successMessage = params['success'] || null;

      // Remover mensagem após 5 segundos
      if (this.successMessage) {
        setTimeout(() => {
          this.successMessage = null;
        }, 5000);
      }
    });

    this.carregarClientes();
  }

  carregarClientes() {
    this.loading = true;
    this.clienteService.listarClientes().subscribe({
      next: (clientes) => {
        this.clientes = clientes;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar clientes:', error);
        this.loading = false;
      }
    });
  }

  editarCliente(cliente: Cliente) {
    this.router.navigate(['/clientes/edit', cliente.id]);
  }

  excluirCliente(cliente: Cliente) {
    if (confirm(`Tem certeza que deseja excluir o cliente "${cliente.nome}"?`)) {
      if (cliente.id) {
        this.clienteService.excluirCliente(cliente.id).subscribe({
          next: () => {
            this.carregarClientes(); // Recarregar a lista
          },
          error: (error) => {
            console.error('Erro ao excluir cliente:', error);
            alert('Erro ao excluir cliente');
          }
        });
      }
    }
  }

  formatarData(data: string): string {
    return new Date(data).toLocaleDateString('pt-BR');
  }
}

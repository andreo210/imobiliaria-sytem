import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Cliente } from '../../../models/cliente';
import { ClienteService } from '../../../services/cliente.service';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl:'./cliente-form.html',
  styleUrls: ['./cliente-form.css']
})
export class ClienteFormComponent implements OnInit {
  cliente: Cliente = {
    nome: '',
    email: '',
    telefone: '',
    observacao: ''
  };

  isEdit: boolean = false;
  loading: boolean = false;
  errors: string[] = [];

  constructor(
    private clienteService: ClienteService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit = true;
      this.carregarCliente(parseInt(id));
    }
  }

  carregarCliente(id: number) {
    this.loading = true;
    this.clienteService.obterCliente(id).subscribe({
      next: (cliente) => {
        this.cliente = cliente;
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar cliente-form:', error);
        this.loading = false;
        this.errors = ['Erro ao carregar dados do cliente-form'];
      }
    });
  }

  onSubmit() {
    this.errors = [];
    this.loading = true;

    if (this.isEdit && this.cliente.id) {
      this.atualizarCliente();
    } else {
      this.criarCliente();
    }
  }

  criarCliente() {
    this.clienteService.criarCliente(this.cliente).subscribe({
      next: (cliente) => {
        this.loading = false;
        this.router.navigate(['/clientes'], {
          queryParams: { success: 'Cliente criado com sucesso!' }
        });
      },
      error: (error) => {
        this.loading = false;
        this.handleError(error);
      }
    });
  }

  atualizarCliente() {
    if (!this.cliente.id) return;

    this.clienteService.atualizarCliente(this.cliente.id, this.cliente).subscribe({
      next: (cliente) => {
        this.loading = false;
        this.router.navigate(['/clientes'], {
          queryParams: { success: 'Cliente atualizado com sucesso!' }
        });
      },
      error: (error) => {
        this.loading = false;
        this.handleError(error);
      }
    });
  }

  handleError(error: any) {
    if (error.status === 400 && error.error?.detail) {
      this.errors = [error.error.detail];
    } else if (error.error && typeof error.error === 'object') {
      this.errors = Object.values(error.error).flat() as string[];
    } else {
      this.errors = ['Erro ao processar a solicitação. Tente novamente.'];
    }
  }

  onCancel() {
    this.router.navigate(['/clientes']);
  }

  isFormValid(): boolean {
    return !!this.cliente.nome && !!this.cliente.email && !!this.cliente.telefone;
  }
}

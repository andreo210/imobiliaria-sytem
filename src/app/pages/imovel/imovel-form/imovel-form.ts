import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ImovelService, TipoImovel, Amenidade, Imovel } from '../../../services/imovel.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-imovel-form',
  templateUrl: './imovel-form.html',
  styleUrls: ['./imovel-form.css'],
  standalone: true, // Se estiver usando módulos tradicionais
  // Se estiver usando componentes standalone, adicione:
  imports: [CommonModule, ReactiveFormsModule]
})
export class ImovelFormComponent implements OnInit {
  imovelForm: FormGroup;
  isSubmitting = false;
  selectedAmenidades: number[] = [];
  uploadedPhotos: File[] = [];
  photoPreviews: string[] = [];

  tiposImovel: TipoImovel[] = [];
  amenidades: Amenidade[] = [];
  loading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private imovelService: ImovelService,
    private authService: AuthService
  ) {
    this.imovelForm = this.createForm();
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  createForm(): FormGroup {
    return this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(5)]],
      descricao: ['', [Validators.required, Validators.minLength(10)]],
      preco: ['', [Validators.required, Validators.min(0)]],
      tipo_id: ['', Validators.required],
      status: ['DISPONIVEL', Validators.required]
    });
  }

  loadInitialData(): void {
    this.loading = true;


  //////////////////////////////////////////////////////////////
  // Carregar tipo Imoveis
  //////////////////////////////////////////////////////////////
    this.imovelService.getTiposImovel().subscribe({
      next: (tipos: TipoImovel[]) => {
        this.tiposImovel = tipos;
        this.checkLoadingComplete();
      },
      error: (error: any) => {
        console.error('Erro ao carregar tipos de imóvel:', error);
        alert('Erro ao carregar tipos de imóvel');
        this.checkLoadingComplete();
      }
    });


   //////////////////////////////////////////////////////////////
  // Carregar Amenidades
  //////////////////////////////////////////////////////////////
    this.imovelService.getAmenidades().subscribe({
      next: (amenidades: Amenidade[]) => {
        this.amenidades = amenidades;
        this.checkLoadingComplete();
      },
      error: (error: any) => {
        console.error('Erro ao carregar amenidades:', error);
        alert('Erro ao carregar amenidades');
        this.checkLoadingComplete();
      }
    });
  }




  private checkLoadingComplete(): void {
    if (this.tiposImovel.length >= 0 && this.amenidades.length >= 0) {
      this.loading = false;
    }
  }

  onAmenidadeChange(event: any, amenidadeId: number): void {
    if (event.target.checked) {
      this.selectedAmenidades.push(amenidadeId);
    } else {
      this.selectedAmenidades = this.selectedAmenidades.filter(id => id !== amenidadeId);
    }
  }

  onFileSelected(event: any): void {
    const files: FileList = event.target.files;
    this.processFiles(files);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files) {
      this.processFiles(files);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  processFiles(files: FileList): void {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        if (!this.uploadedPhotos.some(f => f.name === file.name && f.size === file.size)) {
          this.uploadedPhotos.push(file);
          this.createPreview(file);
        }
      }
    }
  }

  //////////////////////////////////////////////////////////////
  // Preview Umagem
  //////////////////////////////////////////////////////////////
  createPreview(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.photoPreviews.push(e.target.result);
    };
    reader.readAsDataURL(file);
  }


  //////////////////////////////////////////////////////////////
  // Remover Imagem
  //////////////////////////////////////////////////////////////
  removePhoto(index: number): void {
    this.uploadedPhotos.splice(index, 1);
    this.photoPreviews.splice(index, 1);
  }



  //////////////////////////////////////////////////////////////
  // Cadastrar Imovel
  //////////////////////////////////////////////////////////////
  onSubmit(): void {
    if (this.imovelForm.valid && this.authService.estaAutenticado()) {
      this.isSubmitting = true;

      const imovelData: Imovel = {
        titulo: this.imovelForm.value.titulo,
        descricao: this.imovelForm.value.descricao,
        preco: Number(this.imovelForm.value.preco),
        status: this.imovelForm.value.status,
        tipo_id: Number(this.imovelForm.value.tipo_id),
        usuario_id: this.getCurrentUserId(),
        amenidades_ids: this.selectedAmenidades,
        fotos: []
      };

      this.imovelService.createImovel(imovelData).subscribe({
        next: (novoImovel: Imovel) => {
          console.log('✅ Imóvel criado:', novoImovel);

          if (this.uploadedPhotos.length > 0 && novoImovel.id) {
            this.uploadFotos(novoImovel.id).then(() => {
              this.navigateToSuccess();
            }).catch((fotoError: any) => {
              console.error('❌ Erro ao enviar fotos:', fotoError);
              this.navigateToSuccess();
            });
          } else {
            this.navigateToSuccess();
          }
        },
        error: (error: any) => {
          console.error('❌ Erro ao cadastrar imóvel:', error);
          this.handleSubmitError(error);
        }
      });
    } else {
      this.markFormAsTouched();

      if (!this.authService.estaAutenticado()) {
        alert('Você precisa estar logado para cadastrar um imóvel.');
        this.router.navigate(['/login']);
      }
    }
  }




  //////////////////////////////////////////////////////////////
  // Upload de Imagens
  //////////////////////////////////////////////////////////////
  private async uploadFotos(imovelId: number): Promise<void> {
    if (this.uploadedPhotos.length === 0) return;

    try {
      await this.imovelService.uploadFotos(imovelId, this.uploadedPhotos).toPromise();
      console.log('✅ Fotos enviadas com sucesso');
    } catch (error: any) {
      console.error('❌ Erro ao enviar fotos:', error);
      throw error;
    }
  }

  private navigateToSuccess(): void {
    this.isSubmitting = false;
    this.router.navigate(['/imoveis'], {
      queryParams: { success: 'Imóvel cadastrado com sucesso!' }
    });
  }

  private handleSubmitError(error: any): void {
    this.isSubmitting = false;

    if (error.message && error.message.includes('Sessão expirada')) {
      alert('Sessão expirada. Faça login novamente.');
      this.authService.logout();
    } else if (error.status === 403) {
      alert('Você não tem permissão para cadastrar imóveis.');
    } else {
      alert('Erro ao cadastrar imóvel: ' + (error.message || 'Erro desconhecido'));
    }
  }

  private markFormAsTouched(): void {
    Object.keys(this.imovelForm.controls).forEach(key => {
      this.imovelForm.get(key)?.markAsTouched();
    });
  }




  //////////////////////////////////////////////////////////////
  // Obter usuario
  //////////////////////////////////////////////////////////////
  private getCurrentUserId(): number {
    // Tenta obter do usuário atual do AuthService
    const usuario = (this.authService as any).usuarioAtual.value;

    if (usuario && usuario.id) {
      return usuario.id;
    }

    // Fallback do token JWT
    const token = this.authService.getAccessToken();
    if (token) {
      try {
        const decoded: any = this.jwtDecode(token);
        return decoded.sub ||decoded.user_id || decoded.id || decoded.usuario_id || 0;
      } catch (error: any) {
        console.error('Erro ao decodificar token:', error);
      }
    }

    console.warn('⚠️ Não foi possível obter o ID do usuário atual');
    return 0;
  }





  //////////////////////////////////////////////////////////////
  // Dissearilizar token
  ////////////////////////////////////////////////////////////
  private jwtDecode(token: string): any {
    try {
      return JSON.parse(atob(token.split('.')[1]));
    } catch (error: any) {
      console.error('Erro ao decodificar JWT:', error);
      return {};
    }
  }

  // Getters para o template
  get titulo() { return this.imovelForm.get('titulo'); }
  get descricao() { return this.imovelForm.get('descricao'); }
  get preco() { return this.imovelForm.get('preco'); }
  get tipo_id() { return this.imovelForm.get('tipo_id'); }
  get status() { return this.imovelForm.get('status'); }
}

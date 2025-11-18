export interface Imovel {
  id: number;
  titulo: string;
  descricao: string;
  preco: number;
  status: 'disponível' | 'vendido' | 'alugado';
  tipo_id: number;
  localizacao_id: number;
  usuario_id: number;
  criado_em: Date;
  fotos?: FotoImovel[];
  amenidades?: Amenidade[];
  localizacao?: Localizacao;
  tipo?: TipoImovel;
}

export interface TipoImovel {
  id: number;
  nome: string;
}

export interface Localizacao {
  id: number;
  cidade: string;
  bairro: string;
}

export interface FotoImovel {
  id: number;
  imovel_id: number;
  url: string;
  criado_em: Date;
}

export interface Amenidade {
  id: number;
  nome: string;
}

export interface Sessao {
  id: string;
  nome: string;
  createdAt: string;
  updatedAt: string;
  produtos: Produto[];
  midiaUrl?: string[];
}

export interface Produto {
  id: string;
  sessaoId: string;
  nome: string;
  descricao: string;
  tags?: string | null;
  preco: number;
  midiaUrl: string[];
  createdAt: string;
  updatedAt: string;
  sessao: Sessao;
}

export interface FileWithPreview {
  file?: File;
  preview: {
    url: string;
    rawUrl?: string;
    type: string;
  };
}

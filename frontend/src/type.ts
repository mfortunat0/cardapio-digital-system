export interface Sessao {
  id: string;
  nome: string;
  createdAt: string;
  updatedAt: string;
  produtos: Produto[];
}

export interface Produto {
  id: string;
  sessaoId: string;
  nome: string;
  descricao: string;
  tags?: string | null;
  preco: number;
  createdAt: string;
  updatedAt: string;
  sessao: Sessao;
}

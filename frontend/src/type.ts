export interface Sessao {
  id: string;
  nome: string;
  subtitulo: string;
  createdAt: string;
  updatedAt: string;
  produtos: Produto[];
  midiaUrl?: string;
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

export interface MenuItem {
  id: string;
  nome: string;
  descricao: string;
  preco: string;
  tags: string[];
  imagens?: string[];
}

export interface MenuSection {
  id: string;
  titulo: string;
  subtitulo: string;
  videoKey: string;
  items: MenuItem[];
}

export interface VideoData {
  src: string;
  poster: string;
  label: string;
  subtitle: string;
}

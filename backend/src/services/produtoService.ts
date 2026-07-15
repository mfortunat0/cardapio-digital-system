import prisma from "../config/database";

export class ProdutoService {
  static async getAll(sessaoId?: string) {
    const where = sessaoId ? { sessaoId } : {};
    return prisma.produto.findMany({
      where,
      include: { sessao: true },
      orderBy: { createdAt: "asc" },
    });
  }

  static async getById(id: string) {
    return prisma.produto.findUnique({
      where: { id },
      include: { sessao: true },
    });
  }

  static async create(data: {
    sessaoId: string;
    nome: string;
    descricao?: string;
    preco: number;
    tags: string[];
    imagens: string[];
  }) {
    return prisma.produto.create({
      data: {
        sessaoId: data.sessaoId,
        nome: data.nome,
        descricao: data.descricao,
        preco: data.preco,
        tags: JSON.stringify(data.tags),
        imagens: JSON.stringify(data.imagens),
      },
      include: { sessao: true },
    });
  }

  static async update(
    id: string,
    data: {
      nome?: string;
      descricao?: string;
      preco?: number;
      tags?: string[];
      imagens?: string[];
      sessaoId?: string;
    },
  ) {
    const updateData: any = { ...data };
    if (data.tags) updateData.tags = JSON.stringify(data.tags);
    if (data.imagens) updateData.imagens = JSON.stringify(data.imagens);

    return prisma.produto.update({
      where: { id },
      data: updateData,
      include: { sessao: true },
    });
  }

  static async delete(id: string) {
    return prisma.produto.delete({
      where: { id },
    });
  }
}

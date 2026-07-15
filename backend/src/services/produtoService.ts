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
  }) {
    return prisma.produto.create({
      data: {
        sessaoId: data.sessaoId,
        nome: data.nome,
        descricao: data.descricao,
        preco: data.preco,
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
      sessaoId?: string;
    },
  ) {
    const updateData: any = { ...data };

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

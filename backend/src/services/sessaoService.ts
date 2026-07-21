import prisma from "../config/database";

export class SessaoService {
  static async getAll() {
    return prisma.sessao.findMany({
      include: {
        produtos: true,
      },
      orderBy: { createdAt: "asc" },
    });
  }

  static async getById(id: string) {
    return prisma.sessao.findUnique({
      where: { id },
      include: { produtos: true },
    });
  }

  static async create(data: {
    nome: string;
    subtitulo: string;
    midiaUrl: string;
  }) {
    return prisma.sessao.create({
      data,
    });
  }

  static async update(
    id: string,
    data: { nome?: string; slug?: string; videoUrl?: string },
  ) {
    return prisma.sessao.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string) {
    // Os produtos serão deletados em cascata
    return prisma.sessao.delete({
      where: { id },
    });
  }
}

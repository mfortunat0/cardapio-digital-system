import { Request, Response } from "express";
import { ProdutoService } from "../services/produtoService";
import { getSocket } from "../config/socket";

export class ProdutoController {
  static async getAll(req: Request, res: Response) {
    try {
      const { sessaoId } = req.query;
      const produtos = await ProdutoService.getAll(sessaoId as string);
      return res.json(produtos);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const produto = await ProdutoService.getById(id as string);
      if (!produto) {
        return res.status(404).json({ error: "Produto não encontrado" });
      }
      return res.json(produto);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const { sessaoId, nome, descricao, preco, tags, imagens } = req.body;

      if (!sessaoId || !nome || preco === undefined) {
        return res
          .status(400)
          .json({ error: "Sessão, nome e preço são obrigatórios" });
      }

      const tagsArray = tags
        ? Array.isArray(tags)
          ? tags
          : tags.split(",").map((t: string) => t.trim())
        : [];
      const imagensArray = imagens
        ? Array.isArray(imagens)
          ? imagens
          : JSON.parse(imagens)
        : [];

      const produto = await ProdutoService.create({
        sessaoId,
        nome,
        descricao,
        preco: Number(preco),
        tags: tagsArray,
        imagens: imagensArray,
      });

      // Emitir evento via Socket.io
      const io = getSocket();
      io.emit("produto:created", produto);

      return res.status(201).json(produto);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { sessaoId, nome, descricao, preco, tags, imagens } = req.body;

      const tagsArray = tags
        ? Array.isArray(tags)
          ? tags
          : tags.split(",").map((t: string) => t.trim())
        : undefined;
      const imagensArray = imagens
        ? Array.isArray(imagens)
          ? imagens
          : JSON.parse(imagens)
        : undefined;

      const produto = await ProdutoService.update(id as string, {
        sessaoId,
        nome,
        descricao,
        preco: preco !== undefined ? Number(preco) : undefined,
        tags: tagsArray,
        imagens: imagensArray,
      });

      // Emitir evento via Socket.io
      const io = getSocket();
      io.emit("produto:updated", produto);

      return res.json(produto);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await ProdutoService.delete(id as string);

      // Emitir evento via Socket.io
      const io = getSocket();
      io.emit("produto:deleted", id);

      return res.json({ message: "Produto removido com sucesso" });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}

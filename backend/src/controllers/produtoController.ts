import { Request, Response } from "express";
import { ProdutoService } from "../services/produtoService";
import { getSocket } from "../config/socket";

export class ProdutoController {
  static async getAll(req: Request, res: Response) {
    try {
      const { sessaoId } = req.query;
      const produtos = await ProdutoService.getAll(sessaoId as string);
      const formattedProdutos = produtos.map((p) => ({
        ...p,
        midiaUrl: p.midiaUrl ? JSON.parse(p.midiaUrl) : [],
      }));
      return res.json(formattedProdutos);
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
      const formattedProduto = {
        ...produto,
        midiaUrl: produto.midiaUrl ? JSON.parse(produto.midiaUrl) : [],
      };
      return res.json(formattedProduto);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const { sessaoId, nome, descricao, preco, tags, midiaUrl } = req.body;

      if (!sessaoId || !nome || preco === undefined) {
        return res
          .status(400)
          .json({ error: "Sessão, nome e preço são obrigatórios" });
      }

      const produto = await ProdutoService.create({
        sessaoId,
        nome,
        descricao,
        preco: Number(preco),
        tags,
        midiaUrl: midiaUrl ? JSON.stringify(midiaUrl) : undefined,
      });

      // Emitir evento via Socket.io
      const io = getSocket();
      const formattedProduto = {
        ...produto,
        midiaUrl: produto.midiaUrl ? JSON.parse(produto.midiaUrl) : [],
      };
      io.emit("produto:created", formattedProduto);

      return res.status(201).json(formattedProduto);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { sessaoId, nome, descricao, preco, tags, midiaUrl } = req.body;

      const produto = await ProdutoService.update(id as string, {
        sessaoId,
        nome,
        descricao,
        preco: preco !== undefined ? Number(preco) : undefined,
        tags,
        midiaUrl: midiaUrl ? JSON.stringify(midiaUrl) : undefined,
      });

      // Emitir evento via Socket.io
      const io = getSocket();
      const formattedProduto = {
        ...produto,
        midiaUrl: produto.midiaUrl ? JSON.parse(produto.midiaUrl) : [],
      };
      io.emit("produto:updated", formattedProduto);

      return res.json(formattedProduto);
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

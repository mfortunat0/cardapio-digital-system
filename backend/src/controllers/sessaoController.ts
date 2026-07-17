import { Request, Response } from "express";
import { SessaoService } from "../services/sessaoService";
import { getSocket } from "../config/socket";

export class SessaoController {
  static async getAll(req: Request, res: Response) {
    try {
      const sessoes = await SessaoService.getAll();
      return res.json(sessoes);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const sessao = await SessaoService.getById(id as string);
      if (!sessao) {
        return res.status(404).json({ error: "Sessão não encontrada" });
      }
      return res.json(sessao);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async create(req: Request, res: Response) {
    try {
      const { nome, midiaUrl = "" } = req.body;
      if (!nome) {
        return res.status(400).json({ error: "Nome é obrigatório" });
      }

      const sessao = await SessaoService.create({ nome, midiaUrl });

      // Emitir evento via Socket.io
      const io = getSocket();
      io.emit("sessao:created", sessao);

      return res.status(201).json(sessao);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { nome } = req.body;

      const sessao = await SessaoService.update(id as string, {
        nome,
      });

      const io = getSocket();
      io.emit("sessao:updated", sessao);

      return res.json(sessao);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await SessaoService.delete(id as string);

      // Emitir evento via Socket.io
      const io = getSocket();
      io.emit("sessao:deleted", id);

      return res.json({ message: "Sessão removida com sucesso" });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}

import { Request, Response } from "express";
import path from "path";
import fs from "fs";

export class UploadController {
  static async uploadFile(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "Nenhum arquivo enviado" });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      return res.json({
        filename: req.file.filename,
        url: fileUrl,
        size: req.file.size,
        mimetype: req.file.mimetype,
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async uploadMultiple(req: Request, res: Response) {
    try {
      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ error: "Nenhum arquivo enviado" });
      }

      const results = files.map((file) => ({
        filename: file.filename,
        url: `/uploads/${file.filename}`,
        size: file.size,
        mimetype: file.mimetype,
      }));

      return res.json(results);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  static async deleteFile(req: Request, res: Response) {
    try {
      const { filename } = req.params as { filename: string };
      const filePath = path.join(__dirname, "../../uploads", filename);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "Arquivo não encontrado" });
      }

      fs.unlinkSync(filePath);
      return res.json({ message: "Arquivo removido com sucesso" });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}

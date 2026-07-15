import { Request, Response } from "express";
import { AuthService } from "../services/authService";

export class AuthController {
  static async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res
          .status(400)
          .json({ error: "Usuário e senha são obrigatórios" });
      }

      const result = await AuthService.login(username, password);

      return res.json({ token: result.accessToken });
    } catch (error: any) {
      return res.status(401).json({ error: error.message });
    }
  }
}

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

  static async logout(req: Request, res: Response) {
    // Sem refresh token e cookies, o logout é feito apenas no frontend
    // apagando o accessToken armazenado.
    return res.json({ message: "Logout realizado com sucesso no backend" });
  }

  static async me(req: Request, res: Response) {
    try {
      const userId = (req as any).userId;

      // Como agora temos apenas um usuário fixo via .env, não precisamos buscar no BD.
      // O token já validou a identidade.
      return res.json({
        id: userId,
        username: process.env.ADMIN_USERNAME || "admin",
        role: "admin",
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}

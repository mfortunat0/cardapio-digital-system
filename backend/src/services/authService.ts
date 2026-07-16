import { generateAccessToken } from "../utils/jwt";

export class AuthService {
  static async login(username: string, password: string) {
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminUsername || !adminPassword) {
      throw new Error(
        "Credenciais do administrador não configuradas no servidor",
      );
    }

    if (username !== adminUsername || password !== adminPassword) {
      throw new Error("Usuário ou senha inválidos");
    }

    const userId = "admin-fixed-id"; // Um ID fixo já que há apenas 1 usuário
    const accessToken = generateAccessToken(userId);

    return {
      accessToken,
      user: { id: userId, username: adminUsername, role: "admin" },
    };
  }
}

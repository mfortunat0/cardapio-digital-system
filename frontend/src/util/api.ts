import axios from "axios";
import type { Produto, Sessao } from "../type";

export const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_API,
});

export const apiGetSessoes = async () => {
  try {
    const response = await api.get<Sessao[]>("/sessoes");
    return response.data;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const apiGetProdutos = async () => {
  try {
    const response = await api.get<Produto[]>("/produtos");
    return response.data;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const apiCreateProduto = async (
  produto: Pick<Produto, "nome" | "descricao" | "preco" | "tags" | "sessaoId">,
) => {
  try {
    const response = await api.post("/produtos", produto);
    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const apiLogin = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  try {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const apiValidateToken = async ({ token }: { token: string }) => {
  try {
    const response = await api.post(
      "/auth/login/validate",
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    return response;
  } catch (error) {
    console.log(error);
    return null;
  }
};

import axios from "axios";
import type { Produto, Sessao } from "../type";
import { socket } from "./socket";

export const api = axios.create({
  baseURL: import.meta.env.VITE_SERVER_API,
});

export const apiGetProdutos = async () => {
  try {
    const response = await api.get<Produto[]>("/produtos");
    return response.data;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const apiCreateProduto = async ({
  nome,
  descricao,
  preco,
  tags,
  sessaoId,
  midiaUrl,
  token,
}: Pick<
  Produto,
  "nome" | "descricao" | "preco" | "tags" | "sessaoId" | "midiaUrl"
> & {
  token: string;
}) => {
  try {
    const response = await api.post(
      "/produtos",
      { nome, descricao, preco, tags, sessaoId, midiaUrl },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    socket.emit("request-reload-produtos");
    return response;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const apiDeleteProduto = async ({
  id,
  token,
}: {
  id: string;
  token: string;
}) => {
  try {
    await api.delete(`/produtos/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    socket.emit("request-reload-produtos");
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export const apiUpdateProduto = async ({
  id,
  nome,
  descricao,
  preco,
  tags,
  sessaoId,
  midiaUrl,
  token,
}: Pick<
  Produto,
  "id" | "nome" | "descricao" | "preco" | "tags" | "sessaoId" | "midiaUrl"
> & {
  token: string;
}) => {
  try {
    const response = await api.put(
      `/produtos/${id}`,
      { nome, descricao, preco, tags, sessaoId, midiaUrl },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    socket.emit("request-reload-produtos");
    return response;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const apiGetSessoes = async () => {
  try {
    const response = await api.get<Sessao[]>("/sessoes");
    return response.data;
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const apiCreateSessao = async ({
  nome,
  token,
  midiaUrl = "",
}: {
  nome: string;
  token: string;
  midiaUrl?: string;
}) => {
  try {
    const response = await api.post(
      "/sessoes",
      { nome, midiaUrl },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    socket.emit("request-reload-sessoes");
    return response;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const apiUpdateSessao = async ({
  id,
  nome,
  midiaUrl = "",
  token,
}: {
  id: string;
  nome: string;
  midiaUrl: string;
  token: string;
}) => {
  try {
    const response = await api.put(
      `/sessoes/${id}`,
      { nome, midiaUrl },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    socket.emit("request-reload-sessoes");
    return response;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const apiDeleteSessao = async ({
  id,
  token,
}: {
  id: string;
  token: string;
}) => {
  try {
    await api.delete(`/sessoes/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    socket.emit("request-reload-sessoes");
    return true;
  } catch (error) {
    console.log(error);
    return false;
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

export const apiUploadMultiple = async (formData: FormData, token: string) => {
  try {
    const response = await api.post("/upload/multiple", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const apiUploadOne = async (formData: FormData, token: string) => {
  try {
    const response = await api.post("/upload/single", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

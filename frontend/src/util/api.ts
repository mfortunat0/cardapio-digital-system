import axios from "axios";
import type { Produto, Sessao } from "../type";

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
}: {
  nome: string;
  token: string;
}) => {
  try {
    const response = await api.post(
      "/sessoes",
      { nome },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return response;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const apiUpdateSessao = async ({
  id,
  nome,
  token,
}: {
  id: string;
  nome: string;
  token: string;
}) => {
  try {
    const response = await api.put(
      `/sessoes/${id}`,
      { nome },
      { headers: { Authorization: `Bearer ${token}` } },
    );
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

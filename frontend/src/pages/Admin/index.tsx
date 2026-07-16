import React, { useState, useEffect, useRef, useCallback } from "react";
import styles from "./index.module.css";
import type { Produto, Sessao } from "../../type";
import { useNavigate } from "react-router-dom";
import {
  apiCreateProduto,
  apiGetProdutos,
  apiGetSessoes,
  apiValidateToken,
} from "../../util/api";

export function Admin() {
  const navigate = useNavigate();
  const [tokenIsValid, setTokenIsValid] = useState(false);
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [activeTab, setActiveTab] = useState<"sessoes" | "produtos">("sessoes");
  const [filterSessaoId, setFilterSessaoId] = useState<string>("");

  const [modalSessaoAberto, setModalSessaoAberto] = useState(false);
  const [modalProdutoAberto, setModalProdutoAberto] = useState(false);
  const [sessaoEditando, setSessaoEditando] = useState<Sessao | null>(null);
  const [produtoEditando, setProdutoEditando] = useState<Produto | null>(null);

  const [sessaoForm, setSessaoForm] = useState({ id: "", nome: "" });
  const [sessaoVideoFile, setSessaoVideoFile] = useState<File | null>(null);

  const [produtoForm, setProdutoForm] = useState({
    id: "",
    sessaoId: "",
    nome: "",
    descricao: "",
    preco: "",
    tags: "",
  });

  const [toast, setToast] = useState({
    message: "",
    isError: false,
    show: false,
  });

  const toastTimeoutRef = useRef<number | null>(null);

  const showToast = (message: string, isError = false) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast({ message, isError, show: true });
    toastTimeoutRef.current = window.setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3000);
  };

  const carregarDados = useCallback(async () => {
    const [sessoesData, produtosData] = await Promise.all([
      apiGetSessoes(),
      apiGetProdutos(),
    ]);
    setSessoes(sessoesData);
    setProdutos(produtosData);
  }, []);

  const abrirModalSessao = (sessao?: Sessao) => {
    setSessaoEditando(sessao || null);
    setSessaoForm({
      id: sessao?.id || "",
      nome: sessao?.nome || "",
    });
    setModalSessaoAberto(true);
  };

  const fecharModalSessao = () => {
    setModalSessaoAberto(false);
    setSessaoEditando(null);
    setSessaoVideoFile(null);
  };

  const abrirModalProduto = (produto?: Produto) => {
    if (!produto && sessoes.length === 0) {
      showToast("Crie ao menos uma sessão antes de adicionar produtos.", true);
      return;
    }
    setProdutoEditando(produto || null);
    setProdutoForm({
      id: produto?.id || "",
      sessaoId: produto?.sessaoId || (sessoes.length > 0 ? sessoes[0].id : ""),
      nome: produto?.nome || "",
      descricao: produto?.descricao || "",
      preco: produto?.preco ? produto.preco.toString() : "",
      tags: produto?.tags ? produto.tags.join(", ") : "",
    });
    setModalProdutoAberto(true);
  };

  const fecharModalProduto = () => {
    setModalProdutoAberto(false);
    setProdutoEditando(null);
  };

  const handleSubmitProduto = async (e: React.FormEvent) => {
    e.preventDefault();
    const { id, sessaoId, nome, descricao, preco, tags } = produtoForm;

    if (!sessaoId || !nome.trim() || !preco) {
      showToast("Preencha campos obrigatórios.", true);
      return;
    }

    const precoNum = parseFloat(preco);

    if (isNaN(precoNum) || precoNum < 0) {
      showToast("Preço inválido.", true);
      return;
    }
    const tagsArray = tags
      ? tags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t)
      : [];

    await apiCreateProduto({
      sessaoId,
      nome: nome.trim(),
      descricao: descricao.trim(),
      preco: precoNum,
      tags: tagsArray.join(";"),
    });

    showToast("Produto salvo!");

    fecharModalProduto();

    carregarDados();
  };

  // Excluir
  const handleExcluirSessao = async (id: string) => {
    if (
      !confirm(
        "Tem certeza que deseja excluir esta sessão? Todos os produtos vinculados também serão removidos.",
      )
    )
      return;
    await apiExcluirSessao(id);
    showToast("Sessão removida.");
    carregarDados();
  };

  const handleExcluirProduto = async (id: string) => {
    if (!confirm("Excluir este produto?")) return;
    await apiExcluirProduto(id);
    showToast("Produto removido.");
    carregarDados();
  };

  // Filtro de produtos
  const produtosFiltrados = filterSessaoId
    ? produtos.filter((p) => p.sessaoId === filterSessaoId)
    : produtos;

  // Renderização das listas
  const renderSessoes = () => {
    if (sessoes.length === 0) {
      return (
        <div className={styles["empty-state"]}>
          Nenhuma sessão criada ainda.
        </div>
      );
    }
    return sessoes.map((s) => (
      <div key={s.id} className={styles.card}>
        <div className={styles["card-info"]}>
          <div className={styles["card-title"]}>{s.nome}</div>
          <div className={styles["card-meta"]}>
            Slug: {s.slug} | Vídeo: {s.videoUrl ? "✅" : "❌"}
          </div>
        </div>
        <div className={styles["card-actions"]}>
          <button
            className={`${styles.btn} ${styles["btn-outline"]} ${styles["btn-sm"]}`}
            onClick={() => abrirModalSessao(s)}
          >
            ✏️ Editar
          </button>
          <button
            className={`${styles.btn} ${styles["btn-danger"]} ${styles["btn-sm"]}`}
            onClick={() => handleExcluirSessao(s.id)}
          >
            🗑️ Excluir
          </button>
        </div>
      </div>
    ));
  };

  const renderProdutos = () => {
    if (produtosFiltrados.length === 0) {
      return (
        <div className={styles["empty-state"]}>
          Nenhum produto nesta sessão.
        </div>
      );
    }
    return produtosFiltrados.map((p) => {
      const sessao = sessoes.find((s) => s.id === p.sessaoId);
      return (
        <div key={p.id} className={styles.card}>
          <div className={styles["card-info"]}>
            <div className={styles["card-title"]}>
              {p.nome}{" "}
              <span style={{ color: "var(--gold-dark)", marginLeft: 10 }}>
                R$ {p.preco.toFixed(2)}
              </span>
            </div>
            <div className={styles["card-meta"]}>
              {p.descricao || ""} | Sessão: {sessao ? sessao.nome : "—"}
            </div>
            {p.tags && p.tags.length > 0 && (
              <div style={{ marginTop: 5 }}>
                {p.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      background: "rgba(180,148,63,0.1)",
                      padding: "2px 8px",
                      borderRadius: 4,
                      fontSize: "0.7rem",
                      marginRight: 5,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className={styles["card-actions"]}>
            <button
              className={`${styles.btn} ${styles["btn-outline"]} ${styles["btn-sm"]}`}
              onClick={() => abrirModalProduto(p)}
            >
              ✏️
            </button>
            <button
              className={`${styles.btn} ${styles["btn-danger"]} ${styles["btn-sm"]}`}
              onClick={() => handleExcluirProduto(p.id)}
            >
              🗑️
            </button>
          </div>
        </div>
      );
    });
  };

  // const validateToken = async () => {
  //   const token = localStorage.getItem("token");

  //   if (!token) {
  //     showToast("Token não encontrado", true);
  //     navigate("/login");
  //     return;
  //   }

  //   try {
  //     const response = await axios.post(
  //       `${import.meta.env.VITE_SERVER_API}/login/validate`,
  //       {},
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       },
  //     );
  //     if (response.status !== 200) {
  //       navigate("/login");
  //     } else {
  //       return token;
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     navigate("/login");
  //   }
  // };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const validate = async () => {
      try {
        const response = await apiValidateToken({ token });
        if (response.status !== 200) {
          navigate("/login");
        } else {
          setTokenIsValid(true);
        }
      } catch (error) {
        console.log(error);
        navigate("/login");
      }
    };
    validate();

    const getAllSessoes = async () => {
      try {
        const response = await apiGetSessoes();
        setSessoes(response);
      } catch (error) {
        console.log(error);
      }
    };
    getAllSessoes();

    const getAllProdutos = async () => {
      try {
        const response = await apiGetProdutos();
        setProdutos(response);
      } catch (error) {
        console.log(error);
      }
    };
    getAllProdutos();
  }, []);

  return (
    <div className={styles["admin-container"]}>
      <header className={styles["admin-header"]}>
        <h1>La Maison · Painel</h1>
        <p>Gerencie sessões, produtos e vídeos</p>
      </header>

      <div className={styles.tabs}>
        <button
          className={`${styles["tab-btn"]} ${activeTab === "sessoes" ? styles.active : ""}`}
          onClick={() => setActiveTab("sessoes")}
        >
          📂 Sessões
        </button>
        <button
          className={`${styles["tab-btn"]} ${activeTab === "produtos" ? styles.active : ""}`}
          onClick={() => setActiveTab("produtos")}
        >
          🍽️ Produtos
        </button>
      </div>

      <div className={styles["tab-content"]}>
        {/* Aba Sessões */}
        <div
          className={`${styles["tab-pane"]} ${activeTab === "sessoes" ? styles.active : ""}`}
        >
          <div className={styles["tab-header"]}>
            <h2 className={styles["tab-title"]}>Sessões do Cardápio</h2>
            <button
              className={`${styles.btn} ${styles["btn-primary"]}`}
              onClick={() => abrirModalSessao()}
            >
              + Nova Sessão
            </button>
          </div>
          <div className={styles["section-list"]}>{renderSessoes()}</div>
        </div>

        {/* Aba Produtos */}
        <div
          className={`${styles["tab-pane"]} ${activeTab === "produtos" ? styles.active : ""}`}
        >
          <div className={styles["tab-header"]}>
            <h2 className={styles["tab-title"]}>Produtos</h2>
            <div className={styles["filter-group"]}>
              <select
                className={styles["filter-select"]}
                value={filterSessaoId}
                onChange={(e) => setFilterSessaoId(e.target.value)}
              >
                <option value="">Todas as sessões</option>
                {sessoes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nome}
                  </option>
                ))}
              </select>
              <button
                className={`${styles.btn} ${styles["btn-primary"]}`}
                onClick={() => abrirModalProduto()}
              >
                + Novo Produto
              </button>
            </div>
          </div>
          <div className={styles["product-list"]}>{renderProdutos()}</div>
        </div>
      </div>

      {/* Modal Sessão */}
      {modalSessaoAberto && (
        <div className={styles["modal-overlay"]} onClick={fecharModalSessao}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles["modal-title"]}>
              {sessaoEditando ? "Editar Sessão" : "Nova Sessão"}
            </h2>
            <form onSubmit={handleSubmitSessao}>
              <input type="hidden" value={sessaoForm.id} />
              <div className={styles["form-group"]}>
                <label>Nome da Sessão</label>
                <input
                  type="text"
                  value={sessaoForm.nome}
                  onChange={(e) =>
                    setSessaoForm({ ...sessaoForm, nome: e.target.value })
                  }
                  required
                  placeholder="Ex: Pratos Principais"
                />
              </div>
              <div className={styles["form-group"]}>
                <label>Slug (identificador único)</label>
                <input
                  type="text"
                  value={sessaoForm.slug}
                  onChange={(e) =>
                    setSessaoForm({ ...sessaoForm, slug: e.target.value })
                  }
                  required
                  placeholder="Ex: pratos-principais"
                />
              </div>
              <div className={styles["form-group"]}>
                <label>Vídeo da Sessão</label>
                <div className={styles["file-upload-wrapper"]}>
                  <input
                    type="file"
                    id="sessaoVideoFile"
                    accept="video/mp4,video/webm,video/ogg"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setSessaoVideoFile(file);
                      setSessaoVideoFileName(file ? file.name : "");
                    }}
                  />
                  <label
                    htmlFor="sessaoVideoFile"
                    className={styles["file-upload-btn"]}
                  >
                    🎬 Escolher arquivo
                  </label>
                  <span className={styles["file-name"]}>
                    {sessaoVideoFileName || "Nenhum arquivo selecionado"}
                  </span>
                </div>
                <small className={styles["file-hint"]}>
                  Formatos aceitos: MP4, WebM, OGG
                </small>
              </div>
              <div className={styles["modal-actions"]}>
                <button
                  type="button"
                  className={`${styles.btn} ${styles["btn-outline"]}`}
                  onClick={fecharModalSessao}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`${styles.btn} ${styles["btn-primary"]}`}
                >
                  💾 Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Produto */}
      {modalProdutoAberto && (
        <div className={styles["modal-overlay"]} onClick={fecharModalProduto}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles["modal-title"]}>
              {produtoEditando ? "Editar Produto" : "Novo Produto"}
            </h2>
            <form onSubmit={handleSubmitProduto}>
              <input type="hidden" value={produtoForm.id} />
              <div className={styles["form-group"]}>
                <label>Sessão</label>
                <select
                  value={produtoForm.sessaoId}
                  onChange={(e) =>
                    setProdutoForm({ ...produtoForm, sessaoId: e.target.value })
                  }
                  required
                >
                  {sessoes.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nome}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles["form-group"]}>
                <label>Nome do Produto</label>
                <input
                  type="text"
                  value={produtoForm.nome}
                  onChange={(e) =>
                    setProdutoForm({ ...produtoForm, nome: e.target.value })
                  }
                  required
                  placeholder="Ex: Risoto de Cogumelos"
                />
              </div>
              <div className={styles["form-group"]}>
                <label>Descrição</label>
                <textarea
                  rows={3}
                  value={produtoForm.descricao}
                  onChange={(e) =>
                    setProdutoForm({
                      ...produtoForm,
                      descricao: e.target.value,
                    })
                  }
                  placeholder="Descrição curta..."
                />
              </div>
              <div className={styles["form-group"]}>
                <label>Preço (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={produtoForm.preco}
                  onChange={(e) =>
                    setProdutoForm({ ...produtoForm, preco: e.target.value })
                  }
                  required
                  placeholder="89.90"
                />
              </div>
              <div className={styles["form-group"]}>
                <label>Tags (separadas por vírgula)</label>
                <input
                  type="text"
                  value={produtoForm.tags}
                  onChange={(e) =>
                    setProdutoForm({ ...produtoForm, tags: e.target.value })
                  }
                  placeholder="Trufado, Vegetariano"
                />
              </div>
              <div className={styles["modal-actions"]}>
                <button
                  type="button"
                  className={`${styles.btn} ${styles["btn-outline"]}`}
                  onClick={fecharModalProduto}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`${styles.btn} ${styles["btn-primary"]}`}
                >
                  💾 Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div
        className={`${styles.toast} ${toast.show ? styles.show : ""}`}
        style={{ background: toast.isError ? "#c0392b" : "#2b2418" }}
      >
        {toast.message}
      </div>
    </div>
  );
}

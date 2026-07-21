import {
  useState,
  useEffect,
  useRef,
  useCallback,
  type FormEvent,
} from "react";
import styles from "./index.module.css";
import type { FileWithPreview, Produto, Sessao } from "../../type";
import { useNavigate } from "react-router-dom";
import {
  apiCreateProduto,
  apiCreateSessao,
  apiDeleteProduto,
  apiDeleteSessao,
  apiGetProdutos,
  apiGetSessoes,
  apiUpdateProduto,
  apiUpdateSessao,
  apiValidateToken,
  apiUploadMultiple,
  apiUploadOne,
} from "../../util/api";

export function Admin() {
  const token = localStorage.getItem("token");

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

  const [sessaoNome, setSessaoNome] = useState<string>("");
  const [sessaoSubtitulo, setSessaoSubtitulo] = useState<string>("");
  const [sessaoMidiaUrl, setSessaoMidiaUrl] = useState<FileWithPreview>();

  const [produtoNome, setProdutoNome] = useState<string>("");
  const [produtoDescricao, setProdutoDescricao] = useState<string>("");
  const [produtoPreco, setProdutoPreco] = useState<string>("");
  const [produtoTags, setProdutoTags] = useState<string>("");
  const [produtoMidiaUrl, setProdutoMidiaUrl] = useState<FileWithPreview[]>([]);
  const [produtoSessaoId, setProdutoSessaoId] = useState<string>("");

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
    setSessaoNome(sessao?.nome || "");
    setSessaoSubtitulo(sessao?.subtitulo || "");
    setSessaoMidiaUrl({
      preview: {
        url: sessao?.midiaUrl
          ? `${import.meta.env.VITE_SERVER_API}${sessao.midiaUrl}`
          : "",
        rawUrl: sessao?.midiaUrl,
        type: "video/mp4",
      },
    });

    setModalSessaoAberto(true);
  };

  const fecharModalSessao = () => {
    setModalSessaoAberto(false);
    setSessaoEditando(null);
  };

  const abrirModalProduto = (produto?: Produto) => {
    if (!produto && sessoes.length === 0) {
      showToast("Crie ao menos uma sessão antes de adicionar produtos.", true);
      return;
    }

    setProdutoEditando(produto || null);

    setProdutoNome(produto?.nome || "");
    setProdutoDescricao(produto?.descricao || "");
    setProdutoPreco(produto?.preco.toString() || "");
    setProdutoTags(produto?.tags || "");
    setProdutoSessaoId(produto?.sessaoId || "");

    const existingMedia: FileWithPreview[] = produto?.midiaUrl
      ? produto.midiaUrl.map((url) => ({
          preview: {
            url: `${import.meta.env.VITE_SERVER_API}${url}`,
            rawUrl: url,
            type: "image/jpeg",
          },
        }))
      : [];
    setProdutoMidiaUrl(existingMedia);

    setModalProdutoAberto(true);
  };

  const handleRemoveMediaImageProduto = (index: number) => {
    const newMidiaUrl = produtoMidiaUrl.filter((_, i) => i !== index);
    setProdutoMidiaUrl(newMidiaUrl);
  };

  const handleRemoveMediaVideoSessao = () => {
    setSessaoMidiaUrl({
      preview: {
        url: "",
        rawUrl: "",
        type: "video/mp4",
      },
    });
  };

  const fecharModalProduto = () => {
    setModalProdutoAberto(false);
    setProdutoEditando(null);
  };

  const handleSubmitProduto = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!produtoSessaoId || !produtoNome.trim() || !produtoPreco) {
      showToast("Preencha campos obrigatórios.", true);
      return;
    }

    const precoNum = parseFloat(produtoPreco);

    if (isNaN(precoNum) || precoNum < 0) {
      showToast("Preço inválido.", true);
      return;
    }
    const tagsArray = produtoTags
      ? produtoTags
          .split(",")
          .map((t) => t.trim())
          .filter((t) => t)
      : [];

    // eslint-disable-next-line no-useless-assignment
    let finalMidiaUrl: string[] = [];

    const existingUrls = produtoMidiaUrl
      .filter((m) => !m.file && m.preview.rawUrl)
      .map((m) => m.preview.rawUrl!);

    console.log(existingUrls);

    finalMidiaUrl = [...existingUrls];

    const filesToUpload = produtoMidiaUrl
      .filter((m) => m.file)
      .map((m) => m.file!);

    if (filesToUpload.length > 0) {
      await validateToken();

      const formData = new FormData();
      filesToUpload.forEach((file) => {
        formData.append("files", file);
      });

      const uploadResult = await apiUploadMultiple(formData, token);

      if (uploadResult && Array.isArray(uploadResult)) {
        const newUrls = uploadResult.map((res) => res.url);
        finalMidiaUrl = [...finalMidiaUrl, ...newUrls];
      } else {
        showToast("Erro ao fazer upload das mídias.", true);
        return;
      }
    }

    if (produtoEditando) {
      await apiUpdateProduto({
        id: produtoEditando.id,
        sessaoId: produtoSessaoId,
        nome: produtoNome.trim(),
        descricao: produtoDescricao.trim(),
        preco: precoNum,
        tags: tagsArray.join(","),
        midiaUrl: finalMidiaUrl,
        token: token!,
      });

      console.log(finalMidiaUrl);
    } else {
      console.log(finalMidiaUrl);

      await apiCreateProduto({
        sessaoId: produtoSessaoId,
        nome: produtoNome.trim(),
        descricao: produtoDescricao.trim(),
        preco: precoNum,
        tags: tagsArray.join(","),
        midiaUrl: finalMidiaUrl,
        token: token!,
      });
    }

    showToast("Produto salvo!");

    fecharModalProduto();

    carregarDados();
  };

  const handleSubmitSessao = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!sessaoNome.trim()) {
      showToast("Preencha campos obrigatórios.", true);
      return;
    }

    let finalMidiaUrl: string = "";

    if (sessaoMidiaUrl.file) {
      const fileToUpload = sessaoMidiaUrl.file;

      if (fileToUpload) {
        await validateToken();

        const formData = new FormData();
        formData.append("file", fileToUpload);

        const uploadResult = await apiUploadOne(formData, token);

        if (uploadResult) {
          finalMidiaUrl = uploadResult.url;
        } else {
          showToast("Erro ao fazer upload das mídias.", true);
          return;
        }
      }
    }

    if (sessaoEditando) {
      await apiUpdateSessao({
        id: sessaoEditando.id,
        nome: sessaoNome.trim(),
        subtitulo: sessaoSubtitulo.trim(),
        midiaUrl: finalMidiaUrl,
        token,
      });
    } else {
      await apiCreateSessao({
        nome: sessaoNome.trim(),
        subtitulo: sessaoSubtitulo.trim(),
        midiaUrl: finalMidiaUrl,
        token,
      });
    }

    showToast("Sessão salva!");

    fecharModalSessao();

    carregarDados();
  };

  const handleExcluirSessao = async (id: string) => {
    if (
      !confirm(
        "Tem certeza que deseja excluir esta sessão? Todos os produtos vinculados também serão removidos.",
      )
    )
      return;
    const ok = await apiDeleteSessao({ id, token });
    if (ok) {
      showToast("Sessão removida.");
      carregarDados();
    } else {
      showToast("Erro ao remover sessão.", true);
    }
  };

  const handleExcluirProduto = async (id: string) => {
    if (!confirm("Excluir este produto?")) return;

    const ok = await apiDeleteProduto({ id, token });
    if (ok) {
      showToast("Produto removido.");
      carregarDados();
    } else {
      showToast("Erro ao remover produto.", true);
    }
  };

  const produtosFiltrados = filterSessaoId
    ? produtos.filter((p) => p.sessaoId === filterSessaoId)
    : produtos;

  const renderSessoes = () => {
    if (sessoes.length === 0) {
      return (
        <div className={styles["empty-state"]}>
          Nenhuma sessão criada ainda.
        </div>
      );
    }
    return sessoes.map((sessao) => (
      <div key={sessao.id} className={styles.card}>
        <div className={styles["card-info"]}>
          <div className={styles["card-title"]}>{sessao.nome}</div>
          {/* <div className={styles["card-meta"]}>
            Slug: {s.slug} | Vídeo: {s.videoUrl ? "✅" : "❌"}
          </div> */}
        </div>
        <div className={styles["card-actions"]}>
          <button
            className={`${styles.btn} ${styles["btn-outline"]} ${styles["btn-sm"]}`}
            onClick={() => abrirModalSessao(sessao)}
          >
            ✏️ Editar
          </button>
          <button
            className={`${styles.btn} ${styles["btn-danger"]} ${styles["btn-sm"]}`}
            onClick={() => handleExcluirSessao(sessao.id)}
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
    return produtosFiltrados.map((produto) => {
      const sessao = sessoes.find((s) => s.id === produto.sessaoId);
      return (
        <div key={produto.id} className={styles.card}>
          <div className={styles["card-info"]}>
            <div className={styles["card-title"]}>
              {produto.nome}{" "}
              <span style={{ color: "var(--gold-dark)", marginLeft: 10 }}>
                R$ {produto.preco.toFixed(2)}
              </span>
            </div>
            <div className={styles["card-meta"]}>
              {produto.descricao || ""} | Sessão: {sessao ? sessao.nome : "—"}
            </div>
            {produto.tags && produto.tags.length > 0 && (
              <div style={{ marginTop: 5 }}>
                {produto.tags?.split(",").map((tag) => (
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
              onClick={() => abrirModalProduto(produto)}
            >
              ✏️ Editar
            </button>
            <button
              className={`${styles.btn} ${styles["btn-danger"]} ${styles["btn-sm"]}`}
              onClick={() => handleExcluirProduto(produto.id)}
            >
              🗑️ Excluir
            </button>
          </div>
        </div>
      );
    });
  };

  const validateToken = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      showToast("Token não encontrado", true);
      navigate("/login");
      return;
    }

    try {
      const response = await apiValidateToken({ token });
      if (response.status !== 200) {
        navigate("/login");
      } else {
        return token;
      }
    } catch (error) {
      console.log(error);
      navigate("/login");
    }
  };

  useEffect(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {tokenIsValid && (
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
            {sessoes.length > 0 && (
              <button
                className={`${styles["tab-btn"]} ${activeTab === "produtos" ? styles.active : ""}`}
                onClick={() => setActiveTab("produtos")}
              >
                🍽️ Produtos
              </button>
            )}
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
                    <option value="">Selecione uma sessão</option>
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

          {modalSessaoAberto && (
            <div
              className={styles["modal-overlay"]}
              onClick={fecharModalSessao}
            >
              <div
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className={styles["modal-title"]}>
                  {sessaoEditando ? "Editar Sessão" : "Nova Sessão"}
                </h2>
                <form onSubmit={(e) => handleSubmitSessao(e)}>
                  <div className={styles["form-group"]}>
                    <label>Nome da Sessão</label>
                    <input
                      type="text"
                      value={sessaoNome}
                      onChange={(e) => setSessaoNome(e.target.value)}
                      required
                      placeholder="Ex: Pratos Principais"
                    />
                  </div>
                  <div className={styles["form-group"]}>
                    <label>Subtítulo da Sessão</label>
                    <input
                      type="text"
                      value={sessaoSubtitulo}
                      onChange={(e) => setSessaoSubtitulo(e.target.value)}
                      required
                      placeholder="Ex: Pratos Principais"
                    />
                  </div>
                  <div className={styles["form-group"]}>
                    <label>Vídeo da Sessão</label>
                    <div className={styles["file-upload-wrapper"]}>
                      <input
                        type="file"
                        name="sessaoVideoFile"
                        id="sessaoVideoFile"
                        accept="video/mp4,video/webm,video/ogg"
                        onChange={(e) => {
                          const file = e.target.files![0];
                          if (file) {
                            const fileWithPreview = {
                              file: file,
                              preview: {
                                url: URL.createObjectURL(file),
                                type: file.type,
                              },
                            };
                            setSessaoMidiaUrl(fileWithPreview);
                          }
                        }}
                      />
                      <label
                        htmlFor="sessaoVideoFile"
                        className={styles["file-upload-btn"]}
                      >
                        🎬 Escolher arquivo
                      </label>
                    </div>
                    {!!sessaoMidiaUrl?.preview.url && (
                      <div>
                        <div className={styles["media-preview-wrapper"]}>
                          <video
                            src={sessaoMidiaUrl?.preview.url}
                            className={styles["media-preview"]}
                            muted
                            autoPlay
                          />
                          <button
                            onClick={() => handleRemoveMediaVideoSessao()}
                          >
                            X
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* <div className={styles["form-group"]}>
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
              </div> */}
                  {/* <div className={styles["form-group"]}>
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
              </div> */}
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

          {modalProdutoAberto && (
            <div
              className={styles["modal-overlay"]}
              onClick={fecharModalProduto}
            >
              <div
                className={styles.modal}
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className={styles["modal-header"]}
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <h2 className={styles["modal-title"]}>
                    {produtoEditando ? "Editar Produto" : "Novo Produto"}
                  </h2>
                  <button
                    type="button"
                    className={styles["close-button"]}
                    onClick={fecharModalProduto}
                  >
                    ✕
                  </button>
                </div>
                <form onSubmit={handleSubmitProduto}>
                  <div className={styles["form-group"]}>
                    <label>Sessão</label>
                    <select
                      value={produtoSessaoId}
                      onChange={(e) => setProdutoSessaoId(e.target.value)}
                      required
                    >
                      {" "}
                      <option value="">Selecione uma sessão</option>
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
                      value={produtoNome}
                      onChange={(e) => setProdutoNome(e.target.value)}
                      required
                      placeholder="Ex: Risoto de Cogumelos"
                    />
                  </div>
                  <div className={styles["form-group"]}>
                    <label>Foto do Produto</label>
                    <div className={styles["file-upload-wrapper"]}>
                      <input
                        type="file"
                        id="produtoMediaFile"
                        multiple
                        accept="image/jpeg,image/png,image/jpg"
                        onChange={(e) => {
                          const files = e.target.files;
                          if (files) {
                            const filesArray = Array.from(files).map(
                              (file) => ({
                                file,
                                preview: {
                                  url: URL.createObjectURL(file),
                                  type: file.type,
                                },
                              }),
                            );

                            setProdutoMidiaUrl((prev) => [
                              ...prev,
                              ...filesArray,
                            ]);
                          }
                        }}
                      />
                      <label
                        htmlFor="produtoMediaFile"
                        className={styles["file-upload-btn"]}
                      >
                        🎬 Escolher arquivo
                      </label>
                    </div>
                    <small className={styles["file-hint"]}>
                      Formatos aceitos: MP4, WebM, OGG
                    </small>
                  </div>
                  <div>
                    {produtoMidiaUrl?.map((media, index) => (
                      <div
                        key={`${index}-image`}
                        className={styles["media-preview-wrapper"]}
                      >
                        <img
                          src={media.preview.url}
                          alt=""
                          className={styles["media-preview"]}
                        />
                        <button
                          onClick={() => handleRemoveMediaImageProduto(index)}
                        >
                          X
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className={styles["form-group"]}>
                    <label>Descrição</label>
                    <textarea
                      rows={3}
                      value={produtoDescricao}
                      onChange={(e) => setProdutoDescricao(e.target.value)}
                      placeholder="Descrição curta..."
                    />
                  </div>
                  <div className={styles["form-group"]}>
                    <label>Preço (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={produtoPreco}
                      onChange={(e) => {
                        setProdutoPreco(e.target.value);
                      }}
                      required
                      placeholder="89,90"
                    />
                  </div>
                  <div className={styles["form-group"]}>
                    <label>Tags (separadas por vírgula)</label>
                    <input
                      type="text"
                      value={produtoTags}
                      onChange={(e) => setProdutoTags(e.target.value)}
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
      )}
    </>
  );
}

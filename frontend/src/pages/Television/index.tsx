import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from "react";
import styles from "./index.module.css";
import { apiGetSessoes } from "../../util/api";
import { socket } from "../../util/socket";
import type { SessaoDraft } from "../../type";
import BackgroungVideo from "../../assets/background.mp4";

const CardapioFora: React.FC = () => {
  const [sessions, setSessions] = useState<SessaoDraft[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const loadData = useCallback(async () => {
    try {
      const sessoesData = await apiGetSessoes();

      const mappedSessions: SessaoDraft[] = sessoesData.map((sessao) => {
        return {
          id: sessao.id,
          nome: sessao.nome,
          subtitulo: sessao.subtitulo,
          produtos: (sessao.produtos || []).map((produto) => {
            return {
              nome: produto.nome,
              descricao: produto.descricao,
              preco: Number(produto.preco) || 0,
              tags: produto.tags,
            };
          }),
        };
      });

      setSessions(mappedSessions);
      setCurrentSlide(0);
    } catch (error) {
      console.error("Erro ao carregar dados do menu:", error);
    }
  }, []);

  useEffect(() => {
    const loadDataOnStartup = async () => {
      try {
        await loadData();
      } catch (error) {
        console.error("Erro ao carregar dados do menu:", error);
      }
    };
    loadDataOnStartup();
  }, [loadData]);

  useEffect(() => {
    socket.on("reload-sessoes", loadData);
    socket.on("reload-produtos", loadData);

    return () => {
      socket.off("reload-sessoes", loadData);
      socket.off("reload-produtos", loadData);
    };
  }, [loadData]);

  const slides = useMemo(() => {
    const pairs: Array<[SessaoDraft, SessaoDraft | null]> = [];
    for (let i = 0; i < sessions.length; i += 2) {
      pairs.push([sessions[i], sessions[i + 1] || null]);
    }
    return pairs;
  }, [sessions]);

  const goToSlide = useCallback(
    (index: number) => {
      if (slides.length === 0) return;
      const safeIndex = Math.min(Math.max(index, 0), slides.length - 1);
      setCurrentSlide(safeIndex);
    },
    [slides.length],
  );

  const nextSlide = useCallback(() => {
    if (slides.length === 0) return;
    const next = (currentSlide + 1) % slides.length;
    goToSlide(next);
  }, [currentSlide, slides.length, goToSlide]);

  const startRotation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (slides.length > 1) {
      intervalRef.current = window.setInterval(nextSlide, 10000);
    }
  }, [slides.length, nextSlide]);

  const stopRotation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    startRotation();
    return () => stopRotation();
  }, [startRotation, stopRotation]);

  const handleMouseEnter = useCallback(() => {
    stopRotation();
  }, [stopRotation]);

  const handleMouseLeave = useCallback(() => {
    startRotation();
  }, [startRotation]);

  const renderColumn = (
    session: SessaoDraft | null,
    isEmpty: boolean = false,
  ) => {
    if (!session || isEmpty) {
      return (
        <div
          className={styles["session-column"] + " " + styles["empty-session"]}
        >
          <div>✨</div>
          <p>Em breve</p>
        </div>
      );
    }

    return (
      <div className={styles["session-column"]}>
        <div className={styles["session-header"]}>
          <span className={styles["session-title"]}>{session.nome}</span>
          <span className={styles["session-subtitle"]}>
            {session.subtitulo}
          </span>
          <div className={styles["divider-ornament"]}>
            <span className={styles.line}></span>
            <span className={styles.diamond}></span>
            <span className={styles.line}></span>
          </div>
        </div>
        <div className={styles["products-list"]}>
          {session.produtos.map((prod, idx) => {
            const precoFormatado = prod.preco.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
            return (
              <div key={idx} className={styles["product-item"]}>
                <div className={styles["product-header"]}>
                  <span className={styles["product-name"]}>{prod.nome}</span>
                  <span className={styles["product-dots"]}></span>
                  <span className={styles["product-price"]}>
                    R$ {precoFormatado}
                  </span>
                </div>
                {prod.descricao && (
                  <div className={styles["product-description"]}>
                    {prod.descricao}
                  </div>
                )}
                {prod.tags && prod.tags.length > 0 && (
                  <div className={styles["product-tags"]}>
                    {prod.tags.split(",").map((tag) => (
                      <span key={tag} className={styles["product-tag"]}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className={styles["page-container"]}>
      {/* Vídeo de fundo */}
      <video
        className={styles["background-video"]}
        autoPlay
        muted
        loop
        playsInline
        src={BackgroungVideo}
      ></video>

      <div
        className={styles["carousel-container"]}
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className={styles["slides-wrapper"]}>
          {slides.map(([sessionA, sessionB], idx) => (
            <div
              key={idx}
              className={`${styles.slide} ${idx === currentSlide ? styles.active : ""}`}
            >
              {renderColumn(sessionA, false)}
              {renderColumn(sessionB, !sessionB)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CardapioFora;

import React, { useEffect, useRef, useState, useCallback } from "react";
import styles from "./index.module.css";
import { apiGetSessoes } from "../../util/api";
import { socket } from "../../util/socket";
import type { MenuItem, MenuSection, VideoData } from "../../type";
import { ModalCarousel } from "./ModalCarousel";

export function CardapioBase() {
  const [sections, setSections] = useState<MenuSection[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [videoData, setVideoData] = useState<Record<string, VideoData>>({});

  const [activeVideoIndex, setActiveVideoIndex] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const loadingSpinnerRef = useRef<HTMLDivElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const videoLabelRef = useRef<HTMLSpanElement>(null);
  const videoSubtitleRef = useRef<HTMLSpanElement>(null);

  const loadData = useCallback(async () => {
    try {
      const sessoesData = await apiGetSessoes();
      const serverUrl = import.meta.env.VITE_SERVER_API || ""; //[cite: 1]

      const mappedSections: MenuSection[] = sessoesData.map((sessao) => {
        return {
          id: sessao.id,
          titulo: sessao.nome,
          subtitulo: sessao.subtitulo,
          videoKey: sessao.id,
          items: (sessao.produtos || []).map((produto) => {
            let parsedImages: string[] = [];
            if (typeof produto.midiaUrl === "string") {
              try {
                parsedImages = JSON.parse(produto.midiaUrl);
              } catch {
                parsedImages = [];
              }
            } else if (Array.isArray(produto.midiaUrl)) {
              parsedImages = produto.midiaUrl;
            }

            const imagens =
              parsedImages.length > 0
                ? parsedImages.map((img) =>
                    img.startsWith("http") ? img : `${serverUrl}${img}`,
                  )
                : [];

            let tags: string[] = [];
            if (typeof produto.tags === "string" && produto.tags) {
              tags = produto.tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean);
            } else if (Array.isArray(produto.tags)) {
              tags = produto.tags;
            }

            return {
              id: produto.id,
              nome: produto.nome,
              descricao: produto.descricao,
              subtitulo: sessao.subtitulo,
              preco: produto.preco.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              }),
              tags,
              imagens,
            };
          }),
        };
      });

      const newVideoData: Record<string, VideoData> = {};
      sessoesData.forEach((sessao) => {
        newVideoData[sessao.id] = {
          src: sessao.midiaUrl ? `${serverUrl}${sessao.midiaUrl}` : "",
          poster: "",
          label: sessao.nome,
          subtitle: sessao.subtitulo,
        };
      });

      setVideoData(newVideoData);
      setSections(mappedSections);
    } catch (error) {
      console.error("Erro ao carregar dados do menu:", error);
    }
  }, []);

  useEffect(() => {
    const loadOnStartup = async () => {
      try {
        await loadData();
      } catch (error) {
        console.error("Erro ao carregar dados do menu:", error);
      }
    };

    loadOnStartup();
  }, []);

  useEffect(() => {
    socket.on("reload-sessoes", loadData);
    socket.on("reload-produtos", loadData);

    return () => {
      socket.off("reload-sessoes", loadData);
      socket.off("reload-produtos", loadData);
    };
  }, [loadData]);

  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  // NOVO: Derivando qual é o vídeo ativo atualmente
  const videoKeys = Object.keys(videoData);
  const activeVideoKey = videoKeys[activeVideoIndex];
  const activeVideo = activeVideoKey ? videoData[activeVideoKey] : null;

  // NOVO: Função para avançar o vídeo quando o atual terminar
  const handleVideoEnded = () => {
    if (videoKeys.length > 0) {
      setActiveVideoIndex((prevIndex) => (prevIndex + 1) % videoKeys.length);
    }
  };

  return (
    <div className={styles["app-container"]}>
      {/* Painel superior - Vídeo */}
      <div className={styles["video-panel"]}>
        <div className={styles["video-wrapper"]}>
          {activeVideo && (
            <>
              {/* Removido o map, usamos apenas a tag de vídeo referente ao vídeo ativo */}
              <video
                key={activeVideo.src} // Isso força o componente a remontar e dar autoPlay na troca do src
                ref={videoRef}
                className={`${styles["video-layer"]} ${styles.active}`}
                src={activeVideo.src}
                muted
                autoPlay // Necessário para iniciar a reprodução sozinho
                playsInline
                preload="auto"
                onEnded={handleVideoEnded} // Chama a função para trocar o vídeo ao finalizar
              />
              <div
                ref={loadingSpinnerRef}
                className={styles["video-loading-spinner"]}
              ></div>
              <div className={styles["video-overlay"]}>
                <span
                  ref={videoLabelRef}
                  className={styles["video-section-label"]}
                >
                  {activeVideo.label}
                </span>
                <div className={styles["video-section-indicator"]}>
                  <span className={styles.dot}></span>
                  <span
                    ref={videoSubtitleRef}
                    className={styles["current-section-name"]}
                  >
                    {activeVideo.subtitle}
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Painel inferior - Menu */}
      <div className={styles["menu-panel"]} ref={menuPanelRef}>
        <header className={styles["menu-header"]}>
          <h1 className={styles["restaurant-name"]}>La Maison</h1>
          <p className={styles["restaurant-subtitle"]}>Gastronomia Francesa</p>
          <div className={styles["divider-ornament"]}>
            <span className={styles.line}></span>
            <span className={styles.diamond}></span>
            <span className={styles.line}></span>
          </div>
        </header>

        <div className={styles["menu-content"]}>
          {sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className={styles["menu-section"]}
              data-video={section.videoKey}
            >
              <div className={styles["section-header"]}>
                <span className={styles["section-title"]}>
                  {section.titulo}
                </span>
                <span className={styles["section-subtitle"]}>
                  {section.subtitulo}
                </span>
              </div>
              <div className={styles["menu-items"]}>
                {section.items.map((item, index) => (
                  <div
                    key={item.id}
                    className={styles["menu-item"]}
                    style={
                      {
                        "--item-delay": `${index * 0.08}s`,
                      } as React.CSSProperties
                    }
                    onClick={() => handleItemClick(item)}
                  >
                    <div className={styles["item-header"]}>
                      <span className={styles["item-name"]}>{item.nome}</span>
                      <span className={styles["item-dots"]}></span>
                      <span className={styles["item-price"]}>{item.preco}</span>
                    </div>
                    <p className={styles["item-description"]}>
                      {item.descricao}
                    </p>
                    <div className={styles["item-tags"]}>
                      {item.tags.map((tag) => (
                        <span key={tag} className={styles["item-tag"]}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>

      {selectedItem && (
        <ModalCarousel item={selectedItem} onClose={handleCloseModal} />
      )}
    </div>
  );
}
export default CardapioBase;

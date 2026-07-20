// src/pages/CardapioBase/CardapioBase.tsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import styles from "./index.module.css";
import { apiGetSessoes } from "../../util/api";
import { socket } from "../../util/socket";

// ==================== TIPOS ====================
export interface MenuItem {
  id: string;
  nome: string;
  descricao: string;
  preco: string;
  tags: string[];
  imagens?: string[];
}

export interface MenuSection {
  id: string;
  titulo: string;
  subtitulo: string;
  videoKey: string;
  items: MenuItem[];
}

interface VideoData {
  src: string;
  poster: string;
  label: string;
  subtitle: string;
}

// ==================== IMAGENS PARA OS PRODUTOS ====================
const FOOD_IMAGES = [
  "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1565299507177-b0ac66763828?auto=format&fit=crop&w=600&q=80",
  "https://images.unsplash.com/photo-1574482620811-1aa16ffe3aa2?auto=format&fit=crop&w=600&q=80",
];

const getRandomImages = (seed: string, count = 4): string[] => {
  const hash = seed
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const start = hash % (FOOD_IMAGES.length - count);
  return Array.from(
    { length: count },
    (_, i) => FOOD_IMAGES[(start + i) % FOOD_IMAGES.length],
  );
};

// ==================== DADOS DE VÍDEO E MOCK ====================
const getDefaultVideoData = (
  name: string,
): { src: string; poster: string; subtitle: string } => {
  const normalized = name.toLowerCase();
  if (normalized.includes("prato") || normalized.includes("principal")) {
    return {
      src: "https://videos.pexels.com/video-files/4761687/4761687-sd_640_360_24fps.mp4",
      poster:
        "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1200&q=80",
      subtitle: "les plats",
    };
  }
  if (normalized.includes("entrada")) {
    return {
      src: "https://videos.pexels.com/video-files/4065393/4065393-sd_640_360_25fps.mp4",
      poster:
        "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=1200&q=80",
      subtitle: "pour commencer",
    };
  }
  if (normalized.includes("sobremesa") || normalized.includes("doce")) {
    return {
      src: "https://videos.pexels.com/video-files/4107551/4107551-sd_640_360_25fps.mp4",
      poster:
        "https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=1200&q=80",
      subtitle: "les desserts",
    };
  }
  return {
    src: "https://videos.pexels.com/video-files/4761687/4761687-sd_640_360_24fps.mp4",
    poster:
      "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1200&q=80",
    subtitle: "les suggestions",
  };
};

interface ModalCarouselProps {
  item: MenuItem | null;
  onClose: () => void;
}

const ModalCarousel: React.FC<ModalCarouselProps> = ({ item, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const images = item?.imagens || [];

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);
  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  if (!item) return null;

  return (
    <div className={styles["modal-overlay"]} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles["modal-close"]} onClick={onClose}>
          ✕
        </button>

        <div className={styles["modal-carousel"]}>
          <button className={styles["carousel-btn"]} onClick={goToPrev}>
            ◀
          </button>
          <div className={styles["carousel-track"]}>
            {images.map((img, idx) => (
              <div
                key={idx}
                className={`${styles["carousel-slide"]} ${idx === currentIndex ? styles.active : ""}`}
              >
                <img src={img} alt={`${item.nome} - foto ${idx + 1}`} />
              </div>
            ))}
          </div>
          <button className={styles["carousel-btn"]} onClick={goToNext}>
            ▶
          </button>
        </div>

        <div className={styles["modal-dots"]}>
          {images.map((_, idx) => (
            <span
              key={idx}
              className={`${styles.dot} ${idx === currentIndex ? styles.active : ""}`}
              onClick={() => setCurrentIndex(idx)}
            />
          ))}
        </div>

        <div className={styles["modal-footer"]}>
          <span className={styles["modal-price"]}>{item.preco}</span>
        </div>
      </div>
    </div>
  );
};

// ==================== COMPONENTE PRINCIPAL ====================
const CardapioBase: React.FC = () => {
  const [sections, setSections] = useState<MenuSection[]>([]);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [activeVideoKey, setActiveVideoKey] = useState<string>("");
  const [activeSectionId, setActiveSectionId] = useState<string>("");
  const [videoData, setVideoData] = useState<Record<string, VideoData>>({});
  const hasInitializedRef = useRef(false);

  // Refs para vídeos
  const videoARef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);
  const posterImgRef = useRef<HTMLImageElement>(null);
  const loadingSpinnerRef = useRef<HTMLDivElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);
  const videoLabelRef = useRef<HTMLSpanElement>(null);
  const videoSubtitleRef = useRef<HTMLSpanElement>(null);

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentVideoElement, setCurrentVideoElement] =
    useState<HTMLVideoElement | null>(null);
  const [inactiveVideoElement, setInactiveVideoElement] =
    useState<HTMLVideoElement | null>(null);

  // Refs to avoid stale closures
  const isTransitioningRef = useRef(false);
  const activeVideoKeyRef = useRef("");
  const pendingVideoKeyRef = useRef<string | null>(null);
  const currentVideoElementRef = useRef<HTMLVideoElement | null>(null);
  const inactiveVideoElementRef = useRef<HTMLVideoElement | null>(null);
  const videoDataRef = useRef<Record<string, VideoData>>({});
  const switchVideoRef = useRef<(key: string) => void>(() => {});

  // Keep refs synchronized
  useEffect(() => {
    isTransitioningRef.current = isTransitioning;
    activeVideoKeyRef.current = activeVideoKey;
    currentVideoElementRef.current = currentVideoElement;
    inactiveVideoElementRef.current = inactiveVideoElement;
    videoDataRef.current = videoData;
  }, [
    isTransitioning,
    activeVideoKey,
    currentVideoElement,
    inactiveVideoElement,
    videoData,
  ]);

  const loadData = useCallback(async () => {
    try {
      const sessoesData = await apiGetSessoes();
      const serverUrl = import.meta.env.VITE_SERVER_API || "";

      const mappedSections: MenuSection[] = sessoesData.map((sessao) => {
        const defaults = getDefaultVideoData(sessao.nome);

        return {
          id: sessao.id,
          titulo: sessao.nome,
          subtitulo: defaults.subtitle,
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
                : getRandomImages(produto.nome);

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
        const defaults = getDefaultVideoData(sessao.nome);
        newVideoData[sessao.id] = {
          src: sessao.midiaUrl
            ? `${serverUrl}${sessao.midiaUrl}`
            : defaults.src,
          poster: defaults.poster,
          label: sessao.nome,
          subtitle: defaults.subtitle,
        };
      });

      setVideoData(newVideoData);
      setSections(mappedSections);
    } catch (error) {
      console.error("Erro ao carregar dados do menu:", error);
    }
  }, []);

  // Carregar dados na inicialização
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [loadData]);

  // Socket listener para atualizações em tempo real
  useEffect(() => {
    socket.on("reload-sessoes", loadData);
    socket.on("reload-produtos", loadData);

    return () => {
      socket.off("reload-sessoes", loadData);
      socket.off("reload-produtos", loadData);
    };
  }, [loadData]);

  // Inicializa vídeos
  useEffect(() => {
    if (sections.length === 0 || hasInitializedRef.current) return;

    const videoA = videoARef.current;
    const videoB = videoBRef.current;
    if (!videoA || !videoB) return;

    setCurrentVideoElement(videoA);
    setInactiveVideoElement(videoB);

    const firstSection = sections[0];
    const initialData = videoData[firstSection.id];
    if (!initialData) return;

    hasInitializedRef.current = true;

    if (posterImgRef.current) posterImgRef.current.src = initialData.poster;
    videoA.src = initialData.src;
    videoA.load();
    videoA.classList.add(styles.active);
    videoA.classList.remove(styles.loading);
    videoB.classList.add(styles.loading);
    videoB.classList.remove(styles.active);

    if (videoLabelRef.current)
      videoLabelRef.current.textContent = initialData.label;
    if (videoSubtitleRef.current)
      videoSubtitleRef.current.textContent = initialData.subtitle;

    videoA.play().catch(() => {});

    const onPlay = () => {
      if (posterImgRef.current)
        posterImgRef.current.classList.add(styles.hidden);
      if (loadingSpinnerRef.current)
        loadingSpinnerRef.current.classList.remove(styles.visible);
    };
    videoA.addEventListener("playing", onPlay);

    setActiveVideoKey(firstSection.id);
    setActiveSectionId(firstSection.id);

    return () => videoA.removeEventListener("playing", onPlay);
  }, [sections, videoData]);

  // Troca de vídeo
  const switchVideo = useCallback((key: string) => {
    if (key === activeVideoKeyRef.current) return;

    if (isTransitioningRef.current) {
      pendingVideoKeyRef.current = key;
      return;
    }

    const incoming = inactiveVideoElementRef.current;
    const outgoing = currentVideoElementRef.current;
    if (!incoming || !outgoing) return;

    const data = videoDataRef.current[key];
    if (!data) return;

    setIsTransitioning(true);
    isTransitioningRef.current = true;

    if (posterImgRef.current) {
      posterImgRef.current.src = data.poster;
      posterImgRef.current.classList.remove(styles.hidden);
    }

    incoming.src = data.src;
    incoming.load();

    if (loadingSpinnerRef.current)
      loadingSpinnerRef.current.classList.add(styles.visible);

    const checkPendingQueue = () => {
      if (pendingVideoKeyRef.current !== null) {
        const nextKey = pendingVideoKeyRef.current;
        pendingVideoKeyRef.current = null;
        setTimeout(() => switchVideoRef.current(nextKey), 50);
      }
    };

    // eslint-disable-next-line prefer-const
    let timeoutId: ReturnType<typeof setTimeout>;

    const finishTransition = () => {
      if (loadingSpinnerRef.current)
        loadingSpinnerRef.current.classList.remove(styles.visible);

      incoming.classList.add(styles.active);
      incoming.classList.remove(styles.loading);
      outgoing.classList.remove(styles.active);

      incoming.play().catch(() => {});

      setCurrentVideoElement(incoming);
      setInactiveVideoElement(outgoing);
      currentVideoElementRef.current = incoming;
      inactiveVideoElementRef.current = outgoing;

      setActiveVideoKey(key);
      activeVideoKeyRef.current = key;

      if (videoLabelRef.current) videoLabelRef.current.textContent = data.label;
      if (videoSubtitleRef.current)
        videoSubtitleRef.current.textContent = data.subtitle;

      if (!incoming.paused && incoming.readyState >= 2) {
        if (posterImgRef.current)
          posterImgRef.current.classList.add(styles.hidden);
      }

      setIsTransitioning(false);
      isTransitioningRef.current = false;
      checkPendingQueue();
    };

    const onCanPlay = () => {
      clearTimeout(timeoutId);
      incoming.removeEventListener("canplay", onCanPlay);
      incoming.removeEventListener("canplaythrough", onCanPlay);
      finishTransition();
    };

    incoming.addEventListener("canplay", onCanPlay);
    incoming.addEventListener("canplaythrough", onCanPlay);

    timeoutId = setTimeout(() => {
      incoming.removeEventListener("canplay", onCanPlay);
      incoming.removeEventListener("canplaythrough", onCanPlay);
      finishTransition();
    }, 8000);
  }, []);

  // Sync switchVideoRef
  useEffect(() => {
    switchVideoRef.current = switchVideo;
  }, [switchVideo]);

  // Observer para seções
  useEffect(() => {
    const menuPanel = menuPanelRef.current;
    if (!menuPanel) return;

    const sectionElements = menuPanel.querySelectorAll(
      `.${styles["menu-section"]}`,
    );
    const sectionVisibilityMap = new Map<Element, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) =>
          sectionVisibilityMap.set(entry.target, entry.intersectionRatio),
        );

        let maxRatio = 0;
        let mostVisibleSection: Element | null = null;
        sectionVisibilityMap.forEach((ratio, section) => {
          if (ratio > maxRatio) {
            maxRatio = ratio;
            mostVisibleSection = section;
          }
        });

        if (mostVisibleSection != null && maxRatio > 0.08) {
          const el = mostVisibleSection as Element;
          const videoKey = el.getAttribute("data-video");
          const sectionId = (el as HTMLElement).id;
          if (videoKey && videoKey !== activeVideoKey) {
            switchVideo(videoKey);
            setActiveSectionId(sectionId);
            updateNavDots(sectionId);
          }
        }
      },
      {
        root: menuPanel,
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
      },
    );

    sectionElements.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [switchVideo, activeVideoKey, sections]);

  // Observer para itens do menu
  useEffect(() => {
    const menuPanel = menuPanelRef.current;
    if (!menuPanel) return;

    const items = menuPanel.querySelectorAll(`.${styles["menu-item"]}`);
    const itemObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add(styles.visible);
        });
      },
      { root: menuPanel, threshold: 0.08, rootMargin: "0px 0px -15px 0px" },
    );

    items.forEach((item) => itemObserver.observe(item));
    return () => itemObserver.disconnect();
  }, [sections]);

  function updateNavDots(sectionId: string) {
    const dots = document.querySelectorAll(`.${styles["nav-dot"]}`);
    dots.forEach((dot) => {
      const target = dot.getAttribute("data-target");
      if (target === sectionId) dot.classList.add(styles.active);
      else dot.classList.remove(styles.active);
    });
  }

  const handleDotClick = (targetId: string) => {
    const section = document.getElementById(targetId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
      const videoKey = section.getAttribute("data-video");
      if (videoKey && videoKey !== activeVideoKey) {
        switchVideo(videoKey);
        setActiveSectionId(targetId);
        updateNavDots(targetId);
      }
    }
  };

  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  return (
    <div className={styles["app-container"]}>
      {/* Painel superior - Vídeo */}
      <div className={styles["video-panel"]}>
        <div className={styles["video-wrapper"]}>
          <video
            ref={videoARef}
            className={`${styles["video-layer"]} ${styles.active}`}
            muted
            loop
            playsInline
            preload="auto"
          />
          <video
            ref={videoBRef}
            className={`${styles["video-layer"]} ${styles.loading}`}
            muted
            loop
            playsInline
            preload="auto"
          />
          <img
            ref={posterImgRef}
            className={styles["video-poster"]}
            src=""
            alt=""
            loading="eager"
          />
          <div
            ref={loadingSpinnerRef}
            className={styles["video-loading-spinner"]}
          ></div>
          <div className={styles["video-overlay"]}>
            <span ref={videoLabelRef} className={styles["video-section-label"]}>
              Pratos Principais
            </span>
            <div className={styles["video-section-indicator"]}>
              <span className={styles.dot}></span>
              <span
                ref={videoSubtitleRef}
                className={styles["current-section-name"]}
              >
                les plats
              </span>
            </div>
          </div>
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

      {/* Navegação lateral (dots) */}
      <div className={styles["section-nav-dots"]}>
        {sections.map((section) => (
          <div
            key={section.id}
            className={`${styles["nav-dot"]} ${section.id === activeSectionId ? styles.active : ""}`}
            data-target={section.id}
            onClick={() => handleDotClick(section.id)}
          >
            <span className={styles["dot-tooltip"]}>
              {section.titulo.replace("Principais", "").trim()}
            </span>
          </div>
        ))}
      </div>

      {/* Modal Carrossel */}
      {selectedItem && (
        <ModalCarousel item={selectedItem} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default CardapioBase;

// src/pages/CardapioFora/CardapioFora.tsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import styles from "./index.module.css";

// ==================== TIPOS ====================
export interface ProductItem {
  nome: string;
  descricao: string;
  preco: number;
  tags: string[];
}

export interface SessionData {
  id: string;
  nome: string;
  subtitulo: string;
  produtos: ProductItem[];
}

// ==================== DADOS MOCK (futuramente via API) ====================
const MOCK_SESSIONS: SessionData[] = [
  {
    id: "1",
    nome: "Pratos Principais",
    subtitulo: "les plats",
    produtos: [
      {
        nome: "Risoto de Cogumelos Trufados",
        descricao:
          "Arroz arbóreo com mix de cogumelos selvagens e azeite de trufas",
        preco: 89.0,
        tags: ["Trufado", "Vegetariano"],
      },
      {
        nome: "Filé Mignon ao Molho Madeira",
        descricao: "Medalhão grelhado, molho madeira e purê de mandioquinha",
        preco: 112.0,
        tags: ["Clássico", "Premium"],
      },
      {
        nome: "Salmão Grelhado com Ervas",
        descricao:
          "Posta de salmão selvagem, legumes glaceados e molho de maracujá",
        preco: 96.0,
        tags: ["Saudável"],
      },
      {
        nome: "Ravioli de Queijo de Cabra",
        descricao:
          "Massa artesanal com queijo de cabra e nozes, manteiga de sálvia",
        preco: 78.0,
        tags: ["Artesanal"],
      },
      {
        nome: "Polvo à Lagareiro",
        descricao:
          "Polvo assado lentamente, batatas ao murro e azeite extra virgem",
        preco: 120.0,
        tags: ["Premium", "Especial"],
      },
    ],
  },
  {
    id: "2",
    nome: "Entradas",
    subtitulo: "pour commencer",
    produtos: [
      {
        nome: "Carpaccio de Carne",
        descricao: "Finas lâminas de filé mignon com rúcula, parmesão trufado",
        preco: 48.0,
        tags: ["Clássico", "Trufado"],
      },
      {
        nome: "Salada de Burrata",
        descricao: "Burrata cremosa, tomates heirloom e redução balsâmica",
        preco: 42.0,
        tags: ["Vegetariano"],
      },
      {
        nome: "Ceviche de Peixe Branco",
        descricao: "Cubos de robalo, leite de tigre, milho crocante",
        preco: 52.0,
        tags: ["Fresco", "Cítrico"],
      },
      {
        nome: "Polvo Grelhado",
        descricao: "Tentáculos grelhados, batatas rústicas e aioli cítrico",
        preco: 58.0,
        tags: ["Premium"],
      },
    ],
  },
  {
    id: "3",
    nome: "Sobremesas",
    subtitulo: "les desserts",
    produtos: [
      {
        nome: "Tiramisù Clássico",
        descricao: "Mascarpone, café espresso e cacau amargo",
        preco: 38.0,
        tags: ["Clássico"],
      },
      {
        nome: "Cheesecake de Frutas Vermelhas",
        descricao:
          "Cremoso sobre base de biscoito com calda de frutas vermelhas",
        preco: 42.0,
        tags: ["Frutado"],
      },
      {
        nome: "Fondant de Chocolate",
        descricao: "Bolo quente com núcleo cremoso e sorvete de baunilha",
        preco: 45.0,
        tags: ["Quente", "Intenso"],
      },
      {
        nome: "Panna Cotta de Baunilha",
        descricao: "Sedosa com calda de frutas cítricas e flor de sal",
        preco: 35.0,
        tags: ["Leve"],
      },
    ],
  },
  {
    id: "4",
    nome: "Bebidas",
    subtitulo: "à boire",
    produtos: [
      {
        nome: "Vinho Tinto Malbec",
        descricao: "Taça 200ml · Valle de Uco, Argentina",
        preco: 32.0,
        tags: ["Encorpado"],
      },
      {
        nome: "Espumante Brut",
        descricao: "Taça 150ml · Método Tradicional",
        preco: 38.0,
        tags: ["Fresco"],
      },
      {
        nome: "Coquetel La Maison",
        descricao: "Gim, manjericão, limão siciliano e água tônica artesanal",
        preco: 29.0,
        tags: ["Autoral"],
      },
      {
        nome: "Água com Gás Gourmet",
        descricao: "Garrafa 330ml · Importada",
        preco: 14.0,
        tags: ["Refrescante"],
      },
    ],
  },
];

// ==================== COMPONENTE PRINCIPAL ====================
const CardapioFora: React.FC = () => {
  const [sessions] = useState<SessionData[]>(MOCK_SESSIONS);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slides, setSlides] = useState<
    Array<[SessionData, SessionData | null]>
  >([]);
  const intervalRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Agrupa as seções em pares (duas colunas por slide)
  useEffect(() => {
    const pairs: Array<[SessionData, SessionData | null]> = [];
    for (let i = 0; i < sessions.length; i += 2) {
      pairs.push([sessions[i], sessions[i + 1] || null]);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSlides(pairs);
    setCurrentSlide(0);
  }, [sessions]);

  // Função para ir a um slide específico
  const goToSlide = useCallback(
    (index: number) => {
      if (slides.length === 0) return;
      const safeIndex = Math.min(Math.max(index, 0), slides.length - 1);
      setCurrentSlide(safeIndex);
    },
    [slides.length],
  );

  // Função para avançar para o próximo slide
  const nextSlide = useCallback(() => {
    if (slides.length === 0) return;
    const next = (currentSlide + 1) % slides.length;
    goToSlide(next);
  }, [currentSlide, slides.length, goToSlide]);

  // Inicia o intervalo de rotação automática
  const startRotation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (slides.length > 1) {
      intervalRef.current = window.setInterval(nextSlide, 10000);
    }
  }, [slides.length, nextSlide]);

  // Para a rotação
  const stopRotation = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Inicia a rotação quando as dependências mudam
  useEffect(() => {
    startRotation();
    return () => stopRotation();
  }, [startRotation, stopRotation]);

  // Pausa ao passar o mouse
  const handleMouseEnter = useCallback(() => {
    stopRotation();
  }, [stopRotation]);

  const handleMouseLeave = useCallback(() => {
    startRotation();
  }, [startRotation]);

  // Renderiza uma coluna com os produtos de uma seção
  const renderColumn = (
    session: SessionData | null,
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
                    {prod.tags.map((tag) => (
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
        poster="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80"
      >
        <source
          src="https://videos.pexels.com/video-files/3196277/3196277-sd_640_360_25fps.mp4"
          type="video/mp4"
        />
        <img
          src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80"
          alt="preparo de comida"
          className={styles["fallback-image"]}
        />
      </video>
      <div className={styles["background-overlay"]}></div>

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

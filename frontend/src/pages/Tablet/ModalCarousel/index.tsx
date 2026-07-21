import { useCallback, useState } from "react";
import type { MenuItem } from "../../../type";
import styles from "../index.module.css";

interface ModalCarouselProps {
  item: MenuItem | null;
  onClose: () => void;
}

export function ModalCarousel({ item, onClose }: ModalCarouselProps) {
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
}

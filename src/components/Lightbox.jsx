// Модалка-галерея фотографий. Открывается поверх страницы (не уводит на URL).
// Листание: стрелки на экране, клавиши ←/→, превьюшки снизу. Esc / клик по фону — закрыть.

import { useCallback, useEffect, useRef, useState } from 'react';
import '../styles/lightbox.css';

export default function Lightbox({ images = [], startIndex = 0, onClose }) {
  const [idx, setIdx] = useState(startIndex);
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);

  const prev = useCallback(
    () => setIdx(i => (i - 1 + images.length) % images.length),
    [images.length]
  );
  const next = useCallback(
    () => setIdx(i => (i + 1) % images.length),
    [images.length]
  );

  useEffect(() => { setIdx(startIndex); }, [startIndex]);

  // Свайп по фото на мобильном.
  const onTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e) => {
    if (touchStartX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    // Горизонтальный свайп длиннее вертикального и > 40px
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      if (dx < 0) next();
      else        prev();
    }
    touchStartX.current = null;
    touchStartY.current = null;
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose, prev, next]);

  if (!images.length) return null;

  return (
    <div className="lightbox" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose} aria-label="Закрыть">×</button>

      {images.length > 1 && (
        <button
          className="lightbox-nav lightbox-prev"
          onClick={(e) => { e.stopPropagation(); prev(); }}
          aria-label="Предыдущее"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m15 18-6-6 6-6"/>
          </svg>
        </button>
      )}

      <div
        className="lightbox-stage"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <img src={images[idx]} alt="" className="lightbox-img" draggable="false" />
      </div>

      {images.length > 1 && (
        <button
          className="lightbox-nav lightbox-next"
          onClick={(e) => { e.stopPropagation(); next(); }}
          aria-label="Следующее"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="m9 18 6-6-6-6"/>
          </svg>
        </button>
      )}

      {images.length > 1 && (
        <div className="lightbox-thumbs" onClick={(e) => e.stopPropagation()}>
          {images.map((src, i) => (
            <button
              key={i}
              className={`lightbox-thumb ${i === idx ? 'active' : ''}`}
              onClick={() => setIdx(i)}
            >
              <img src={src} alt="" />
            </button>
          ))}
        </div>
      )}

      <div className="lightbox-counter">{idx + 1} / {images.length}</div>
    </div>
  );
}

// Горизонтальная панель с чипами + стрелки prev/next по краям.
// Показываются только когда контент шире контейнера.

import { useEffect, useRef, useState } from 'react';

export default function ScrollableChips({ children, className = '' }) {
  const scrollerRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateButtons = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    updateButtons();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateButtons);
    window.addEventListener('resize', updateButtons);
    // на случай если контент догрузился (категории с бэка)
    const obs = new ResizeObserver(updateButtons);
    obs.observe(el);
    Array.from(el.children).forEach(c => obs.observe(c));
    return () => {
      el.removeEventListener('scroll', updateButtons);
      window.removeEventListener('resize', updateButtons);
      obs.disconnect();
    };
  }, [children]);

  const scrollBy = (dir) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.7), behavior: 'smooth' });
  };

  return (
    <div className={`scroll-chips ${className}`}>
      <button
        type="button"
        className="scroll-chips-btn scroll-chips-btn-prev"
        aria-label="Назад"
        onClick={() => scrollBy(-1)}
        disabled={!canPrev}
        style={{ visibility: canPrev ? 'visible' : 'hidden' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="m15 18-6-6 6-6"/>
        </svg>
      </button>

      <div className="scroll-chips-track" ref={scrollerRef}>
        {children}
      </div>

      <button
        type="button"
        className="scroll-chips-btn scroll-chips-btn-next"
        aria-label="Вперёд"
        onClick={() => scrollBy(1)}
        disabled={!canNext}
        style={{ visibility: canNext ? 'visible' : 'hidden' }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="m9 18 6-6-6-6"/>
        </svg>
      </button>
    </div>
  );
}

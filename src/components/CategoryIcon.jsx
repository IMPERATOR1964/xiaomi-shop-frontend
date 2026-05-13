// SVG-иконки категорий. Используются вместо эмодзи на карточках,
// чипсах, fallback-картинках товаров.

const ICONS = {
  smartphones: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="2" width="12" height="20" rx="2.5"/>
      <line x1="11" y1="18.5" x2="13" y2="18.5"/>
    </svg>
  ),
  cases: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z"/>
    </svg>
  ),
  glass: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="16" height="18" rx="2"/>
      <line x1="4" y1="7" x2="20" y2="7"/>
      <line x1="4" y1="17" x2="20" y2="17"/>
    </svg>
  ),
  chargers: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/>
    </svg>
  ),
  powerbanks: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="18" height="10" rx="2"/>
      <line x1="22" y1="11" x2="22" y2="13"/>
      <line x1="6" y1="11" x2="14" y2="11"/>
    </svg>
  ),
  earphones: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18a3 3 0 0 1-3-3v-2a9 9 0 0 1 18 0v2"/>
      <path d="M21 19v-4"/>
      <path d="M3 19v-4"/>
      <path d="M21 19a2 2 0 1 1-4 0v-2h4z"/>
      <path d="M3 19a2 2 0 1 0 4 0v-2H3z"/>
    </svg>
  ),
  watches: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="6"/>
      <path d="M9 2h6l-1 4H10z"/>
      <path d="M9 22h6l-1-4H10z"/>
      <path d="M12 9v3l2 2"/>
    </svg>
  ),
  tablets: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <line x1="11" y1="18.5" x2="13" y2="18.5"/>
    </svg>
  ),
  all: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>
  ),
};

export default function CategoryIcon({ category = 'all', size = 24, className }) {
  const icon = ICONS[category] || ICONS.all;
  return (
    <span className={className} style={{ display: 'inline-flex', width: size, height: size }}>
      {icon}
    </span>
  );
}

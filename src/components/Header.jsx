import { useState, useRef, useEffect } from 'react';
import { Link, useLocation as useRouterLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useFavorites } from '../context/FavoritesContext';
import { useCompare } from '../context/CompareContext';
import { useLocation as useCity, CITIES } from '../context/LocationContext';
import '../styles/header.css';

export default function Header() {
  const { cartCount } = useCart();
  const { user, isStaff } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { count: favCount } = useFavorites();
  const { count: cmpCount } = useCompare();
  const { city, changeCity } = useCity();
  const routerLoc = useRouterLocation();
  const navigate = useNavigate();

  const [cityOpen, setCityOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const cityRef = useRef(null);

  // Закрытие селектора локации по клику вне
  useEffect(() => {
    const onDoc = (e) => { if (cityRef.current && !cityRef.current.contains(e.target)) setCityOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  // Считывание query из URL при заходе на каталог
  useEffect(() => {
    const params = new URLSearchParams(routerLoc.search);
    setSearchValue(params.get('q') || '');
  }, [routerLoc.search]);

  const isActive = (path) => {
    if (path === '/catalog') return routerLoc.pathname.startsWith('/catalog');
    return routerLoc.pathname === path;
  };

  const submitSearch = (e) => {
    e.preventDefault();
    const q = searchValue.trim();
    if (q) navigate(`/catalog?q=${encodeURIComponent(q)}`);
    else navigate('/catalog');
  };

  return (
    <header className="header">
      <div className="container header-inner">
        {/* Левая часть: логотип + локация */}
        <div className="header-left">
          <Link to="/" className="logo">
            <div className="logo-icon">⚡</div>
            <div className="logo-text">Vol<span>tix</span></div>
          </Link>

          <div className="city-selector" ref={cityRef}>
            <button
              className="city-btn"
              onClick={() => setCityOpen(o => !o)}
              title="Выбор города"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <span>{city.label}</span>
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>
            {cityOpen && (
              <div className="city-dropdown">
                {CITIES.map(c => (
                  <button
                    key={c.id}
                    className={`city-option ${c.id === city.id ? 'active' : ''}`}
                    onClick={() => { changeCity(c.id); setCityOpen(false); }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Поиск */}
        <form className="header-search" onSubmit={submitSearch}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="7"/>
            <path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            type="text"
            value={searchValue}
            onChange={e => setSearchValue(e.target.value)}
            placeholder="Поиск товаров..."
          />
          {searchValue && (
            <button
              type="button"
              className="header-search-clear"
              onClick={() => { setSearchValue(''); navigate('/catalog'); }}
            >×</button>
          )}
        </form>

        {/* Действия */}
        <div className="header-actions">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Главная</Link>
          <Link to="/catalog" className={`nav-link ${isActive('/catalog') ? 'active' : ''}`}>Каталог</Link>

          <button className="theme-toggle" onClick={toggleTheme} title="Тема">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          <Link to="/compare" className={`header-btn ${isActive('/compare') ? 'active' : ''}`} title="Сравнение">
            <svg viewBox="0 0 24 24"><path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/><path d="M9 3v18"/></svg>
            {cmpCount > 0 && <span className="header-badge">{cmpCount}</span>}
          </Link>

          <Link to="/favorites" className={`header-btn ${isActive('/favorites') ? 'active' : ''}`} title="Избранное">
            <svg viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"/></svg>
            {favCount > 0 && <span className="header-badge">{favCount}</span>}
          </Link>

          <Link to="/cart" className="header-btn" title="Корзина">
            <svg viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            {cartCount > 0 && <span className="header-badge">{cartCount}</span>}
          </Link>

          <Link to={user ? '/profile' : '/login'} className="header-btn" title="Профиль">
            <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </Link>

          {isStaff && (
            <Link to="/admin" className="header-btn" title="Админ-панель" style={{ color: 'var(--accent)' }}>
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>
            </Link>
          )}

          <button className="mobile-menu-btn">☰</button>
        </div>
      </div>
    </header>
  );
}

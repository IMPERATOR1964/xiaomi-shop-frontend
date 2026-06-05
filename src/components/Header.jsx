import { useState, useRef, useEffect } from 'react';
import { Link, useLocation as useRouterLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useFavorites } from '../context/FavoritesContext';
import { useCompare } from '../context/CompareContext';
import { useLocation as useCity, CITIES } from '../context/LocationContext';
import { productsApi } from '../api';
import SearchDropdown from './SearchDropdown';
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
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const cityRef = useRef(null);
  const searchRef = useRef(null);

  // Закрываем мобильное меню при смене маршрута
  useEffect(() => { setMobileOpen(false); }, [routerLoc.pathname, routerLoc.search]);

  // Закрытие селектора локации по клику вне
  useEffect(() => {
    const onDoc = (e) => { if (cityRef.current && !cityRef.current.contains(e.target)) setCityOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  // Закрытие поиска по клику вне
  useEffect(() => {
    const onDoc = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  // Escape — закрыть dropdown
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setSearchOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
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

  const submitSearch = async (e) => {
    e.preventDefault();
    const q = searchValue.trim();
    setSearchOpen(false);
    if (!q) return navigate('/catalog');

    // Если введены ровно 7 цифр — это артикул, ведём прямо на товар.
    if (/^\d{7}$/.test(q)) {
      try {
        const product = await productsApi.bySku(q);
        if (product?.id) {
          navigate(`/product/${product.id}`);
          return;
        }
      } catch { /* fallthrough */ }
    }
    navigate(`/catalog?q=${encodeURIComponent(q)}`);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchValue('');
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
        <div className="header-search-wrap" ref={searchRef}>
          <form className="header-search" onSubmit={submitSearch}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7"/>
              <path d="m21 21-4.3-4.3"/>
            </svg>
            <input
              type="text"
              value={searchValue}
              onChange={e => { setSearchValue(e.target.value); setSearchOpen(true); }}
              onFocus={() => searchValue && setSearchOpen(true)}
              placeholder="Поиск товаров..."
            />
            {searchValue && (
              <button
                type="button"
                className="header-search-clear"
                onClick={() => { setSearchValue(''); setSearchOpen(false); navigate('/catalog'); }}
              >×</button>
            )}
          </form>
          {searchOpen && (
            <SearchDropdown query={searchValue} onSelect={closeSearch} />
          )}
        </div>

        {/* Действия */}
        <div className="header-actions">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Главная</Link>
          <Link to="/catalog" className={`nav-link ${isActive('/catalog') ? 'active' : ''}`}>Каталог</Link>

          <button className="header-btn theme-toggle" onClick={toggleTheme} title="Тема">
            {theme === 'light'
              ? <svg viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/></svg>
              : <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m4.93 19.07 1.41-1.41"/><path d="m17.66 6.34 1.41-1.41"/></svg>
            }
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
            <Link to="/admin" className="header-btn header-btn-admin" title="Админ-панель">
              <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>
            </Link>
          )}

          <button
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="Меню"
          >
            {mobileOpen
              ? <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              : <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            }
          </button>
        </div>
      </div>

      {/* Мобильное меню */}
      {mobileOpen && (
        <div className="mobile-menu">
          {/* Поиск в мобильном меню */}
          <form className="mobile-menu-search" onSubmit={submitSearch}>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
            </svg>
            <input
              type="text"
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              placeholder="Поиск товаров..."
            />
          </form>

          <Link to="/" className="mobile-menu-link">Главная</Link>
          <Link to="/catalog" className="mobile-menu-link">Каталог</Link>
          <Link to="/favorites" className="mobile-menu-link">Избранное {favCount > 0 && <span className="mobile-menu-count">{favCount}</span>}</Link>
          <Link to="/compare" className="mobile-menu-link">Сравнение {cmpCount > 0 && <span className="mobile-menu-count">{cmpCount}</span>}</Link>
          <Link to="/cart" className="mobile-menu-link">Корзина {cartCount > 0 && <span className="mobile-menu-count">{cartCount}</span>}</Link>
          <Link to={user ? '/profile' : '/login'} className="mobile-menu-link">
            {user ? 'Профиль' : 'Войти'}
          </Link>
          {isStaff && (
            <Link to="/admin" className="mobile-menu-link" style={{ color: 'var(--accent)' }}>Админ-панель</Link>
          )}

          {/* Город */}
          <div className="mobile-menu-cities">
            {CITIES.map(c => (
              <button
                key={c.id}
                className={`mobile-menu-city ${c.id === city.id ? 'active' : ''}`}
                onClick={() => { changeCity(c.id); }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

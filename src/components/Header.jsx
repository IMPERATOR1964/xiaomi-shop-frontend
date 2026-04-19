import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import '../styles/header.css';

export default function Header() {
  const { cartCount } = useCart();
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const isActive = (path) => {
    if (path === '/catalog') return location.pathname.startsWith('/catalog');
    return location.pathname === path;
  };

  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="logo">
          <div className="logo-icon">⚡</div>
          <div className="logo-text">Vol<span>tix</span></div>
        </Link>

        <nav className="nav-links">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>Главная</Link>
          <Link to="/catalog" className={`nav-link ${isActive('/catalog') ? 'active' : ''}`}>Каталог</Link>
          <Link to="/catalog/smartphones" className={`nav-link ${isActive('/catalog/smartphones') ? 'active' : ''}`}>Смартфоны</Link>
          <Link to="/catalog/earphones" className={`nav-link ${isActive('/catalog/earphones') ? 'active' : ''}`}>Наушники</Link>
        </nav>

        <div className="header-actions">
          <button className="theme-toggle" onClick={toggleTheme} title="Тема">
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          <Link to="/cart" className="header-btn" title="Корзина">
            <svg viewBox="0 0 24 24"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          <Link to={user ? '/profile' : '/login'} className="header-btn" title="Профиль">
            <svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </Link>

          <button className="mobile-menu-btn">☰</button>
        </div>
      </div>
    </header>
  );
}

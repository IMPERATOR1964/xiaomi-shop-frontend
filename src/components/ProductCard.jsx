import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useCompare } from '../context/CompareContext';
import { formatPrice } from '../data/products';
import '../styles/product-card.css';

export default function ProductCard({ product, index = 0 }) {
  const { addToCart } = useCart();
  const { has: isFav, toggle: toggleFav } = useFavorites();
  const { has: isCmp, toggle: toggleCmp } = useCompare();

  const fav = isFav(product.id);
  const cmp = isCmp(product.id);

  const badgeClass = product.badge === 'new' ? 'badge-new'
    : product.badge === 'sale' ? 'badge-sale'
    : product.badge === 'hit' ? 'badge-hit' : '';

  const badgeText = product.badge === 'new' ? 'Новинка'
    : product.badge === 'sale' ? 'Скидка'
    : product.badge === 'hit' ? 'Хит' : '';

  const stop = (e) => { e.preventDefault(); e.stopPropagation(); };

  return (
    <div className="product-card animate-up" style={{ animationDelay: `${index * 0.06}s` }}>
      <Link to={`/product/${product.id}`} className="product-card-image">
        {product.badge && <span className={`product-card-badge ${badgeClass}`}>{badgeText}</span>}
        <div className="product-card-actions">
          <button
            type="button"
            className={`product-card-icon-btn ${fav ? 'active fav' : ''}`}
            onClick={(e) => { stop(e); toggleFav(product.id); }}
            title={fav ? 'Убрать из избранного' : 'В избранное'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill={fav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"/>
            </svg>
          </button>
          <button
            type="button"
            className={`product-card-icon-btn ${cmp ? 'active cmp' : ''}`}
            onClick={(e) => { stop(e); toggleCmp(product.id); }}
            title={cmp ? 'Убрать из сравнения' : 'К сравнению'}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/><path d="M9 3v18"/>
            </svg>
          </button>
        </div>
        {product.imageUrl
          ? <img src={product.imageUrl} alt={product.name} loading="lazy" className="product-card-photo" />
          : <span className="product-card-emoji">{product.image}</span>
        }
      </Link>

      <div className="product-card-body">
        <Link to={`/product/${product.id}`} className="product-card-name">
          {product.name}
        </Link>
        <p className="product-card-desc">{product.shortDesc}</p>

        <div className="product-card-footer">
          <div className="product-card-prices">
            <span className="product-card-price">{formatPrice(product.price)}</span>
            {product.oldPrice && (
              <span className="product-card-old-price">{formatPrice(product.oldPrice)}</span>
            )}
          </div>
          <button
            className="product-card-cart-btn"
            onClick={(e) => { stop(e); addToCart(product); }}
            title="В корзину"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

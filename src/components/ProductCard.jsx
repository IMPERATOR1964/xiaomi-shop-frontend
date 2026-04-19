import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../data/products';
import '../styles/product-card.css';

export default function ProductCard({ product, index = 0 }) {
  const { addToCart } = useCart();

  const badgeClass = product.badge === 'new' ? 'badge-new'
    : product.badge === 'sale' ? 'badge-sale'
    : product.badge === 'hit' ? 'badge-hit' : '';

  const badgeText = product.badge === 'new' ? 'Новинка'
    : product.badge === 'sale' ? 'Скидка'
    : product.badge === 'hit' ? 'Хит' : '';

  return (
    <div className="product-card animate-up" style={{ animationDelay: `${index * 0.06}s` }}>
      <Link to={`/product/${product.id}`} className="product-card-image">
        {product.badge && <span className={`product-card-badge ${badgeClass}`}>{badgeText}</span>}
        <span className="product-card-emoji">{product.image}</span>
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
            onClick={(e) => { e.preventDefault(); addToCart(product); }}
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

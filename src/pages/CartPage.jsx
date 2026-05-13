import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice, CATEGORIES } from '../data/products';
import { Loading, EmptyState } from '../components/UiStates';
import CategoryIcon from '../components/CategoryIcon';
import '../styles/cart.css';

export default function CartPage() {
  const { cart, updateQty, removeFromCart, cartTotal, cartCount, clearCart, loading, error } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleClear = async () => {
    if (!confirm('Очистить корзину полностью?')) return;
    await clearCart();
  };

  if (loading) {
    return <div className="cart-page"><div className="container"><Loading label="Загружаем корзину..." /></div></div>;
  }

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <h1 className="section-title">Корзина</h1>
          <EmptyState title="Корзина пуста — добавьте товары из каталога" cta="Перейти в каталог" ctaHref="/catalog" />
        </div>
      </div>
    );
  }

  const goCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="cart-page">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <h1 className="section-title" style={{ marginBottom: 0 }}>Корзина ({cartCount})</h1>
          <button
            type="button"
            className="catalog-filter-reset"
            onClick={handleClear}
            style={{ fontSize: 13, color: 'var(--danger)' }}
          >
            Очистить корзину
          </button>
        </div>
        {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}

        <div className="cart-layout">
          <div className="cart-items">
            {cart.map(item => (
              <div className="cart-item" key={item.id}>
                <div className="cart-item-image">
                  {item.imageUrl
                    ? <img src={item.imageUrl} alt={item.name} className="cart-item-photo" />
                    : <CategoryIcon category={item.category} size={36} />
                  }
                </div>
                <div className="cart-item-info">
                  <Link to={`/product/${item.id}`} className="cart-item-name">{item.name}</Link>
                  {item.shortDesc && <p className="cart-item-desc">{item.shortDesc}</p>}
                </div>
                <div className="cart-item-qty">
                  <button onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
                  <span>{item.qty}</span>
                  <button onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                </div>
                <div className="cart-item-price">{formatPrice(item.price * item.qty)}</div>
                <button className="cart-item-remove" onClick={() => removeFromCart(item.id)}>✕</button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3 className="cart-summary-title">Ваш заказ</h3>
            <div className="cart-summary-row">
              <span>Товары ({cartCount})</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            <div className="cart-summary-row">
              <span>Доставка</span>
              <span style={{ color: 'var(--success)', fontWeight: 600 }}>Бесплатно</span>
            </div>
            <div className="cart-summary-row total">
              <span>Итого</span>
              <span>{formatPrice(cartTotal)}</span>
            </div>
            <button className="btn-primary" onClick={goCheckout}>
              {isAuthenticated ? 'Оформить заказ' : 'Войти и оформить'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

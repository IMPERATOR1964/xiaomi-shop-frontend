import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../data/products';
import '../styles/cart.css';

export default function CartPage() {
  const { cart, updateQty, removeFromCart, cartTotal, cartCount } = useCart();

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <h1 className="section-title">Корзина</h1>
          <div className="cart-empty">
            <div className="cart-empty-icon">🛒</div>
            <h2>Корзина пуста</h2>
            <p>Добавьте товары из каталога</p>
            <Link to="/catalog" className="btn-primary">Перейти в каталог</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="container">
        <h1 className="section-title">Корзина ({cartCount})</h1>

        <div className="cart-layout">
          {/* Items */}
          <div className="cart-items">
            {cart.map(item => (
              <div className="cart-item" key={item.id}>
                <div className="cart-item-image">{item.image}</div>
                <div className="cart-item-info">
                  <Link to={`/product/${item.id}`} className="cart-item-name">{item.name}</Link>
                  <p className="cart-item-desc">{item.shortDesc}</p>
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

          {/* Summary */}
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
            <button className="btn-primary">Оформить заказ</button>
          </div>
        </div>
      </div>
    </div>
  );
}

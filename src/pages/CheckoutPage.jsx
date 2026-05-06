import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../data/products';
import { ordersApi, ApiError } from '../api';
import '../styles/auth.css';
import '../styles/cart.css';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, cartTotal, cartCount, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [deliveryAddress, setAddress] = useState('');
  const [contactPhone, setPhone]      = useState('');
  const [customerNotes, setNotes]     = useState('');
  const [error, setError] = useState('');
  const [busy,  setBusy]  = useState(false);

  useEffect(() => {
    if (!isAuthenticated) navigate('/login');
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;
  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <h1 className="section-title">Оформление</h1>
          <p style={{ color: 'var(--text-muted)' }}>Корзина пуста.</p>
          <Link to="/catalog" className="btn-primary" style={{ marginTop: 16 }}>В каталог</Link>
        </div>
      </div>
    );
  }

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!deliveryAddress.trim()) return setError('Укажите адрес доставки');
    if (!contactPhone.trim())     return setError('Укажите контактный телефон');
    const digits = contactPhone.replace(/\D/g, '');
    if (digits.length < 7 || digits.length > 20) return setError('Телефон должен содержать 7–20 цифр');

    setBusy(true);
    try {
      const order = await ordersApi.checkout({
        deliveryAddress: deliveryAddress.trim(),
        contactPhone:    digits,
        customerNotes:   customerNotes.trim() || undefined,
      });
      await clearCart();
      navigate(`/orders/${order.id}`);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 400 && /stock/i.test(String(err.message))) {
          setError('Недостаточно товара на складе. Уменьшите количество.');
        } else {
          setError(err.message);
        }
      } else {
        setError('Не удалось оформить заказ');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="cart-page">
      <div className="container">
        <h1 className="section-title">Оформление заказа</h1>

        <div className="cart-layout">
          <form className="cart-items" onSubmit={submit} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)', borderRadius: 14, padding: 24 }}>
            {error && <div className="auth-error" style={{ marginBottom: 16 }}>{error}</div>}

            <div className="form-group">
              <label className="form-label">Получатель</label>
              <input className="form-input" value={user?.name || ''} disabled />
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" value={user?.email || ''} disabled />
            </div>

            <div className="form-group">
              <label className="form-label">Адрес доставки *</label>
              <input
                className="form-input"
                type="text"
                placeholder="Город, улица, дом, квартира"
                value={deliveryAddress}
                onChange={e => setAddress(e.target.value)}
                maxLength={500}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Контактный телефон *</label>
              <input
                className="form-input"
                type="tel"
                placeholder="+7 (___) ___-__-__"
                value={contactPhone}
                onChange={e => setPhone(e.target.value)}
                maxLength={25}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Комментарий к заказу</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Например: позвоните за час"
                value={customerNotes}
                onChange={e => setNotes(e.target.value)}
                maxLength={1000}
                style={{ resize: 'vertical' }}
              />
            </div>

            <button type="submit" className="auth-submit" disabled={busy} style={{ marginTop: 12 }}>
              {busy ? 'Создаём заказ…' : `Оформить · ${formatPrice(cartTotal)}`}
            </button>
          </form>

          <div className="cart-summary">
            <h3 className="cart-summary-title">Ваш заказ</h3>
            {cart.map(it => (
              <div className="cart-summary-row" key={it.id}>
                <span style={{ flex: 1, marginRight: 8 }}>{it.name} × {it.qty}</span>
                <span>{formatPrice(it.price * it.qty)}</span>
              </div>
            ))}
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
          </div>
        </div>
      </div>
    </div>
  );
}

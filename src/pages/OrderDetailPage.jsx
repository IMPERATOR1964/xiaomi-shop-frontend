import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ordersApi, ApiError } from '../api';
import { formatPrice } from '../data/products';
import { Loading } from '../components/UiStates';
import '../styles/orders.css';

const STATUS_LABEL = {
  PENDING:   { text: 'Ожидает оплаты', cls: 'pending' },
  PAID:      { text: 'Оплачен',         cls: 'paid' },
  SHIPPED:   { text: 'Отправлен',       cls: 'shipped' },
  DELIVERED: { text: 'Доставлен',       cls: 'delivered' },
  CANCELLED: { text: 'Отменён',         cls: 'cancelled' },
};

const formatDate = (iso) => {
  try { return new Date(iso).toLocaleString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  catch { return ''; }
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [order, setOrder]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    let alive = true;
    setLoading(true);
    ordersApi.byId(id)
      .then(o => { if (alive) setOrder(o); })
      .catch(err => { if (alive) setError(err?.message || 'Заказ не найден'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [id, isAuthenticated, navigate]);

  const cancel = async () => {
    if (!order) return;
    if (!confirm('Отменить заказ?')) return;
    setCancelling(true);
    try {
      const updated = await ordersApi.cancel(order.id);
      setOrder(updated);
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Не удалось отменить';
      alert(msg);
    } finally {
      setCancelling(false);
    }
  };

  if (!isAuthenticated) return null;
  if (loading) return <div className="orders-page"><div className="container"><Loading /></div></div>;
  if (error || !order) {
    return (
      <div className="orders-page">
        <div className="container">
          <h1 className="section-title">Заказ не найден</h1>
          <p style={{ color: 'var(--text-muted)' }}>{error}</p>
          <Link to="/orders" className="btn-primary" style={{ marginTop: 16 }}>К списку заказов</Link>
        </div>
      </div>
    );
  }

  const st = STATUS_LABEL[order.status] || { text: order.status, cls: '' };
  const canCancel = order.status === 'PENDING';

  return (
    <div className="orders-page">
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12, marginBottom: 24 }}>
          <div>
            <h1 className="section-title" style={{ marginBottom: 4 }}>Заказ #{order.id}</h1>
            <div style={{ color: 'var(--text-muted)' }}>{formatDate(order.createdAt)}</div>
          </div>
          <span className={`order-status order-status-${st.cls}`}>{st.text}</span>
        </div>

        <div className="order-detail-grid">
          <div className="order-detail-items">
            {order.items.map(it => (
              <div key={it.id} className="order-detail-item">
                <div>
                  <div className="order-detail-name">{it.name}</div>
                  <div className="order-detail-sku">Артикул: {it.sku}</div>
                </div>
                <div className="order-detail-qty">{it.qty} × {formatPrice(it.price)}</div>
                <div className="order-detail-total">{formatPrice(it.price * it.qty)}</div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3 className="cart-summary-title">Доставка</h3>
            {order.deliveryAddress && <div className="cart-summary-row"><span>Адрес</span><span style={{ textAlign: 'right', maxWidth: 200 }}>{order.deliveryAddress}</span></div>}
            {order.contactPhone && <div className="cart-summary-row"><span>Телефон</span><span>{order.contactPhone}</span></div>}
            {order.customerNotes && <div className="cart-summary-row"><span>Комментарий</span><span style={{ maxWidth: 200, textAlign: 'right' }}>{order.customerNotes}</span></div>}
            <div className="cart-summary-row total">
              <span>Итого</span>
              <span>{formatPrice(order.total)}</span>
            </div>
            {canCancel && (
              <button className="btn-outline" disabled={cancelling} onClick={cancel} style={{ width: '100%', marginTop: 8 }}>
                {cancelling ? 'Отменяем…' : 'Отменить заказ'}
              </button>
            )}
            <Link to="/orders" className="btn-outline btn-sm" style={{ marginTop: 8, width: '100%', textAlign: 'center' }}>← Все заказы</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

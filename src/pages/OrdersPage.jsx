import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ordersApi } from '../api';
import { formatPrice } from '../data/products';
import { Loading, EmptyState } from '../components/UiStates';
import '../styles/orders.css';

const STATUS_LABEL = {
  PENDING:   { text: 'Ожидает оплаты', cls: 'pending' },
  PAID:      { text: 'Оплачен',         cls: 'paid' },
  SHIPPED:   { text: 'Отправлен',       cls: 'shipped' },
  DELIVERED: { text: 'Доставлен',       cls: 'delivered' },
  CANCELLED: { text: 'Отменён',         cls: 'cancelled' },
};

const formatDate = (iso) => {
  try { return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  catch { return ''; }
};

export default function OrdersPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    let alive = true;
    setLoading(true);
    ordersApi.list({ size: 50 })
      .then(res => { if (alive) setOrders(res.items); })
      .catch(err => { if (alive) setError(err?.message); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  return (
    <div className="orders-page">
      <div className="container">
        <h1 className="section-title">Мои заказы</h1>

        {loading
          ? <Loading label="Загружаем заказы..." />
          : error
          ? <p style={{ color: 'var(--danger)' }}>{error}</p>
          : orders.length === 0
          ? <EmptyState icon="📦" title="У вас ещё нет заказов" cta="В каталог" ctaHref="/catalog" />
          : <div className="orders-list">
              {orders.map(o => {
                const st = STATUS_LABEL[o.status] || { text: o.status, cls: '' };
                return (
                  <Link to={`/orders/${o.id}`} key={o.id} className="order-card">
                    <div className="order-card-head">
                      <div>
                        <div className="order-card-id">Заказ #{o.id}</div>
                        <div className="order-card-date">{formatDate(o.createdAt)}</div>
                      </div>
                      <span className={`order-status order-status-${st.cls}`}>{st.text}</span>
                    </div>
                    <div className="order-card-items">
                      {o.items.slice(0, 3).map(it => (
                        <span key={it.id} className="order-card-item">{it.name} × {it.qty}</span>
                      ))}
                      {o.items.length > 3 && <span className="order-card-item">+ ещё {o.items.length - 3}</span>}
                    </div>
                    <div className="order-card-foot">
                      <span>{o.items.reduce((s, i) => s + i.qty, 0)} товара</span>
                      <strong>{formatPrice(o.total)}</strong>
                    </div>
                  </Link>
                );
              })}
            </div>
        }
      </div>
    </div>
  );
}

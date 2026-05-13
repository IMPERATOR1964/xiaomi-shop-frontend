import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ordersApi } from '../../api';
import { formatPrice } from '../../data/products';
import { Loading, ErrorState, EmptyState } from '../../components/UiStates';

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

export default function AdminOrdersPage() {
  const [status, setStatus]   = useState('');
  const [page,   setPage]     = useState(0);
  const [pages,  setPages]    = useState(0);
  const [total,  setTotal]    = useState(0);
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    const opts = { page, size: 20 };
    if (status) opts.status = status;
    ordersApi.adminList(opts)
      .then(res => {
        setOrders(res.items);
        setPages(res.pages);
        setTotal(res.total);
      })
      .catch(err => setError(err?.message || 'Не удалось загрузить'))
      .finally(() => setLoading(false));
  }, [page, status]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <h1 className="admin-page-title">
          Заказы {total > 0 && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({total})</span>}
        </h1>
      </div>

      <div className="admin-filters">
        <select
          className="admin-input"
          value={status}
          onChange={e => { setPage(0); setStatus(e.target.value); }}
        >
          <option value="">Все статусы</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v.text}</option>
          ))}
        </select>
      </div>

      {error
        ? <ErrorState message={error} onRetry={load} />
        : loading
        ? <Loading />
        : orders.length === 0
        ? <EmptyState title="Заказы не найдены" />
        : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Дата</th>
                    <th>Статус</th>
                    <th>Позиций</th>
                    <th>Сумма</th>
                    <th>Адрес</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(o => {
                    const st = STATUS_LABEL[o.status] || { text: o.status, cls: '' };
                    return (
                      <tr key={o.id}>
                        <td><b>#{o.id}</b></td>
                        <td>{formatDate(o.createdAt)}</td>
                        <td>
                          <span className={`order-status order-status-${st.cls}`}>{st.text}</span>
                        </td>
                        <td>{o.items.reduce((s, i) => s + i.qty, 0)}</td>
                        <td><b>{formatPrice(o.total)}</b></td>
                        <td style={{ maxWidth: 240, color: 'var(--text-muted)', fontSize: 13 }}>
                          {o.deliveryAddress || '—'}
                        </td>
                        <td>
                          <Link to={`/orders/${o.id}`} className="btn-outline btn-sm">
                            Открыть
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {pages > 1 && (
              <div className="admin-pagination">
                <button
                  className="btn-outline btn-sm"
                  disabled={page === 0}
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                >Назад</button>
                <span style={{ color: 'var(--text-muted)' }}>
                  Страница {page + 1} из {pages}
                </span>
                <button
                  className="btn-outline btn-sm"
                  disabled={page >= pages - 1}
                  onClick={() => setPage(p => Math.min(pages - 1, p + 1))}
                >Вперёд</button>
              </div>
            )}
          </>
        )
      }
    </div>
  );
}

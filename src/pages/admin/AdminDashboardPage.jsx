import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api';
import { Loading, ErrorState } from '../../components/UiStates';
import { formatPrice } from '../../data/products';

const ICONS = {
  users: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  products: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  orders: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
  revenue: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
};

const Stat = ({ icon, label, value, sub }) => (
  <div className="admin-stat-card">
    <div className="admin-stat-icon">{ICONS[icon]}</div>
    <div className="admin-stat-info">
      <div className="admin-stat-label">{label}</div>
      <div className="admin-stat-value">{value}</div>
      {sub && <div className="admin-stat-sub">{sub}</div>}
    </div>
  </div>
);

export default function AdminDashboardPage() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    adminApi.dashboard()
      .then(setData)
      .catch(err => setError(err?.message || 'Не удалось загрузить'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (loading) return <Loading label="Загружаем сводку..." />;
  if (error)   return <ErrorState message={error} onRetry={load} />;
  if (!data)   return null;

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <h1 className="admin-page-title">Сводка</h1>
        <button className="btn-outline btn-sm" onClick={load}>Обновить</button>
      </div>

      <div className="admin-stats-grid">
        <Stat icon="users"    label="Пользователей" value={data.totalUsers ?? 0} />
        <Stat icon="products" label="Товаров"       value={data.totalProducts ?? 0}
              sub={data.activeProducts != null ? `активных: ${data.activeProducts}` : null} />
        <Stat icon="orders"   label="Заказов"       value={data.totalOrders ?? 0}
              sub={data.pendingOrders != null ? `в ожидании: ${data.pendingOrders}` : null} />
        <Stat icon="revenue"  label="Выручка"       value={formatPrice(Number(data.totalRevenue || 0))} />
      </div>

      {Array.isArray(data.topProducts) && data.topProducts.length > 0 && (
        <section className="admin-section">
          <h2 className="admin-section-title">Топ-{data.topProducts.length} товаров</h2>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Название</th>
                  <th>SKU</th>
                  <th>Просмотры</th>
                  <th>Цена</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data.topProducts.map((p, i) => (
                  <tr key={p.id || i}>
                    <td>{i + 1}</td>
                    <td>{p.name}</td>
                    <td className="admin-sku">{p.sku}</td>
                    <td>{p.viewsCount ?? p.views ?? '—'}</td>
                    <td>{formatPrice(Number(p.price || 0))}</td>
                    <td>
                      <Link to={`/admin/products/${p.id}`} className="btn-outline btn-sm">Открыть</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

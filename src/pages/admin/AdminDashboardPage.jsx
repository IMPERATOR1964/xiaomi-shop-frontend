import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api';
import { Loading, ErrorState } from '../../components/UiStates';
import { formatPrice } from '../../data/products';

const Stat = ({ icon, label, value, sub }) => (
  <div className="admin-stat-card">
    <div className="admin-stat-icon">{icon}</div>
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
        <Stat icon="👥" label="Пользователей"  value={data.totalUsers ?? 0} />
        <Stat icon="📦" label="Товаров"        value={data.totalProducts ?? 0}
              sub={data.activeProducts != null ? `активных: ${data.activeProducts}` : null} />
        <Stat icon="🛒" label="Заказов"        value={data.totalOrders ?? 0}
              sub={data.pendingOrders != null ? `в ожидании: ${data.pendingOrders}` : null} />
        <Stat icon="💰" label="Выручка"        value={formatPrice(Number(data.totalRevenue || 0))} />
      </div>

      {Array.isArray(data.topProducts) && data.topProducts.length > 0 && (
        <section className="admin-section">
          <h2 className="admin-section-title">🔥 Топ-{data.topProducts.length} товаров</h2>
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

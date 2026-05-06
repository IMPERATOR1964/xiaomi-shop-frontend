import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productsApi, ApiError } from '../../api';
import { CATEGORIES, formatPrice } from '../../data/products';
import { Loading, ErrorState, EmptyState } from '../../components/UiStates';

export default function AdminProductsPage() {
  const navigate = useNavigate();

  const [items, setItems]     = useState([]);
  const [page, setPage]       = useState(0);
  const [pages, setPages]     = useState(0);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  // Фильтры
  const [query, setQuery]         = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [showInactive, setShowInactive] = useState(true);

  const fetchData = useCallback(() => {
    setLoading(true);
    setError(null);

    const filterReq = { sortBy: 'newest' };
    if (query.trim())   filterReq.query = query.trim();
    if (categoryId)     filterReq.categoryId = Number(categoryId);
    // Бэк по дефолту отдаёт isActive=true; если showInactive — фронт админка
    // не хочет фильтровать по этому, бэк уже возвращает все isActive=true.
    // Для удалённых товаров пока используем admin-эндпоинты при необходимости.

    productsApi.filter(filterReq, { page, size: 20 })
      .then(res => {
        setItems(res.items);
        setPages(res.pages);
        setTotal(res.total);
      })
      .catch(err => setError(err?.message || 'Не удалось загрузить'))
      .finally(() => setLoading(false));
  }, [query, categoryId, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSoftDelete = async (id) => {
    if (!confirm('Скрыть товар? Его можно будет восстановить.')) return;
    try {
      await productsApi.softDelete(id);
      fetchData();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Не удалось удалить');
    }
  };

  const handleRestore = async (id) => {
    try {
      await productsApi.restore(id);
      fetchData();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Не удалось восстановить');
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <h1 className="admin-page-title">Товары {total ? <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({total})</span> : null}</h1>
        <Link to="/admin/products/new" className="btn-primary btn-sm">+ Создать товар</Link>
      </div>

      {/* Фильтры */}
      <div className="admin-filters">
        <input
          type="text"
          className="admin-input"
          placeholder="Поиск по названию / SKU"
          value={query}
          onChange={e => { setPage(0); setQuery(e.target.value); }}
        />
        <select
          className="admin-input"
          value={categoryId}
          onChange={e => { setPage(0); setCategoryId(e.target.value); }}
        >
          <option value="">Все категории</option>
          {CATEGORIES.filter(c => c.backendId).map(c => (
            <option key={c.id} value={c.backendId}>{c.label}</option>
          ))}
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, color: 'var(--text-muted)' }}>
          <input
            type="checkbox"
            checked={showInactive}
            onChange={e => setShowInactive(e.target.checked)}
          />
          Показывать неактивные
        </label>
      </div>

      {error
        ? <ErrorState message={error} onRetry={fetchData} />
        : loading
        ? <Loading />
        : items.length === 0
        ? <EmptyState icon="📦" title="Товары не найдены" />
        : (
          <>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: 60 }}></th>
                    <th>Название</th>
                    <th>SKU</th>
                    <th>Категория</th>
                    <th>Цена</th>
                    <th>Остаток</th>
                    <th>Статус</th>
                    <th style={{ width: 220 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(p => {
                    const inactive = p.isActive === false;
                    if (inactive && !showInactive) return null;
                    const cat = CATEGORIES.find(c => c.id === p.category);
                    return (
                      <tr key={p.id} className={inactive ? 'admin-row-inactive' : ''}>
                        <td>
                          <div className="admin-product-thumb">
                            {p.imageUrl
                              ? <img src={p.imageUrl} alt={p.name} />
                              : <span style={{ fontSize: 28 }}>{p.image}</span>
                            }
                          </div>
                        </td>
                        <td>
                          <Link to={`/admin/products/${p.id}`} className="admin-link">
                            {p.name}
                          </Link>
                        </td>
                        <td className="admin-sku">{p.sku}</td>
                        <td>{cat?.label || p.categoryName}</td>
                        <td><b>{formatPrice(p.price)}</b></td>
                        <td>{p.stock}</td>
                        <td>
                          {inactive
                            ? <span className="admin-status-inactive">Скрыт</span>
                            : <span className="admin-status-active">Активен</span>
                          }
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                            <button
                              className="btn-outline btn-sm"
                              onClick={() => navigate(`/admin/products/${p.id}`)}
                            >Изменить</button>
                            {inactive
                              ? <button
                                  className="btn-outline btn-sm"
                                  onClick={() => handleRestore(p.id)}
                                  style={{ color: 'var(--success)', borderColor: 'var(--success)' }}
                                >Восстановить</button>
                              : <button
                                  className="btn-outline btn-sm"
                                  onClick={() => handleSoftDelete(p.id)}
                                  style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                                >Скрыть</button>
                            }
                          </div>
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
                >← Назад</button>
                <span style={{ color: 'var(--text-muted)' }}>
                  Страница {page + 1} из {pages}
                </span>
                <button
                  className="btn-outline btn-sm"
                  disabled={page >= pages - 1}
                  onClick={() => setPage(p => Math.min(pages - 1, p + 1))}
                >Вперёд →</button>
              </div>
            )}
          </>
        )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCompare } from '../context/CompareContext';
import { useCart } from '../context/CartContext';
import { CATEGORIES, formatPrice } from '../data/products';
import { productsApi } from '../api';
import { Loading, EmptyState } from '../components/UiStates';
import CategoryIcon from '../components/CategoryIcon';
import '../styles/compare.css';

export default function ComparePage() {
  const { ids, remove, clear } = useCompare();
  const { addToCart } = useCart();

  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  useEffect(() => {
    if (ids.length === 0) { setItems([]); return; }
    let alive = true;
    setLoading(true);
    setError(null);

    Promise.all(ids.map(id => productsApi.byId(id).catch(() => null)))
      .then(list => { if (alive) setItems(list.filter(Boolean)); })
      .catch(err => { if (alive) setError(err?.message); })
      .finally(() => { if (alive) setLoading(false); });

    return () => { alive = false; };
  }, [ids]);

  if (ids.length === 0) {
    return (
      <div className="compare-page">
        <div className="container">
          <h1 className="section-title">Сравнение товаров</h1>
          <EmptyState title="Список сравнения пуст. Добавьте товары через карточки." cta="В каталог" ctaHref="/catalog" />
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="compare-page"><div className="container"><Loading label="Загружаем сравнение..." /></div></div>;
  }

  const allKeys = [...new Set(items.flatMap(p => Object.keys(p.specs || {})))];
  const groups = {};
  for (const p of items) (groups[p.category] ||= []).push(p);

  return (
    <div className="compare-page">
      <div className="container">
        <div className="compare-head">
          <h1 className="section-title" style={{ marginBottom: 0 }}>Сравнение ({items.length})</h1>
          <button className="catalog-filter-reset" onClick={clear}>Очистить всё</button>
        </div>
        {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}

        {Object.entries(groups).map(([catId, products]) => (
          <div key={catId} className="compare-group">
            <h2 className="compare-group-title">
              {CATEGORIES.find(c => c.id === catId)?.label || catId}
            </h2>
            <div className="compare-table-wrap">
              <table className="compare-table">
                <thead>
                  <tr>
                    <th></th>
                    {products.map(p => (
                      <th key={p.id} className="compare-product-cell">
                        <div className="compare-product-img">
                          {p.imageUrl
                            ? <img src={p.imageUrl} alt={p.name} style={{ maxWidth: 80, maxHeight: 80, objectFit: 'contain' }} />
                            : <CategoryIcon category={p.category} size={56} />
                          }
                        </div>
                        <Link to={`/product/${p.id}`} className="compare-product-name">{p.name}</Link>
                        <div className="compare-product-price">{formatPrice(p.price)}</div>
                        <div className="compare-product-actions">
                          <button className="btn-primary btn-sm" onClick={() => addToCart(p)}>В корзину</button>
                          <button className="compare-remove" onClick={() => remove(p.id)} title="Удалить">×</button>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allKeys
                    .filter(k => products.some(p => p.specs?.[k] != null))
                    .map(k => (
                      <tr key={k}>
                        <td className="compare-key">{k}</td>
                        {products.map(p => (
                          <td key={p.id}>{p.specs?.[k] ?? '—'}</td>
                        ))}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

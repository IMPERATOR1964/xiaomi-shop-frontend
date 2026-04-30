import { Link } from 'react-router-dom';
import { useCompare } from '../context/CompareContext';
import { useCart } from '../context/CartContext';
import { PRODUCTS, formatPrice, CATEGORIES } from '../data/products';
import '../styles/compare.css';

export default function ComparePage() {
  const { ids, remove, clear } = useCompare();
  const { addToCart } = useCart();

  const items = ids.map(id => PRODUCTS.find(p => p.id === id)).filter(Boolean);

  if (items.length === 0) {
    return (
      <div className="compare-page">
        <div className="container">
          <h1 className="section-title">Сравнение товаров</h1>
          <div className="catalog-empty">
            <div className="catalog-empty-icon">⚖️</div>
            <p>Список сравнения пуст. Добавьте товары через карточки.</p>
            <Link to="/catalog" className="btn-primary" style={{ marginTop: 20 }}>В каталог</Link>
          </div>
        </div>
      </div>
    );
  }

  const allKeys = [...new Set(items.flatMap(p => Object.keys(p.specs || {})))];
  const showOnlyDiff = false; // можно расширить тогглом
  const filteredKeys = showOnlyDiff
    ? allKeys.filter(k => new Set(items.map(p => String(p.specs?.[k] ?? '—'))).size > 1)
    : allKeys;

  // Группировка по категории
  const groups = {};
  for (const p of items) (groups[p.category] ||= []).push(p);

  return (
    <div className="compare-page">
      <div className="container">
        <div className="compare-head">
          <h1 className="section-title" style={{ marginBottom: 0 }}>Сравнение ({items.length})</h1>
          <button className="catalog-filter-reset" onClick={clear}>Очистить всё</button>
        </div>

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
                        <div className="compare-product-img">{p.image}</div>
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
                  {filteredKeys
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

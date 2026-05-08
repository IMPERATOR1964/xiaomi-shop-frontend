// Блок «Вы недавно смотрели». Грузит товары по id из HistoryContext.
import { useEffect, useState } from 'react';
import { useHistory } from '../context/HistoryContext';
import { productsApi } from '../api';
import ProductCard from './ProductCard';
import { ProductCardSkeleton } from './UiStates';

export default function RecentlyViewed({ excludeId, count = 8, title = 'Вы недавно смотрели' }) {
  const { ids } = useHistory();
  const filtered = ids.filter(id => id !== Number(excludeId)).slice(0, count);

  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (filtered.length === 0) { setItems([]); return; }
    let alive = true;
    setLoading(true);
    Promise.all(filtered.map(id => productsApi.byId(id).catch(() => null)))
      .then(list => { if (alive) setItems(list.filter(Boolean)); })
      .catch(() => { if (alive) setItems([]); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtered.join(',')]);

  if (filtered.length === 0) return null;
  if (!loading && items.length === 0) return null;

  return (
    <section className="similar" style={{ marginTop: 56 }}>
      <h2 className="similar-title">{title}</h2>
      <div className="products-grid">
        {loading
          ? <ProductCardSkeleton count={Math.min(count, 4)} />
          : items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)
        }
      </div>
    </section>
  );
}

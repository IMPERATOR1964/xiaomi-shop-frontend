import { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import { ProductCardSkeleton } from './UiStates';
import { productsApi } from '../api';

export default function SimilarProducts({ productId, count = 4 }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;
    let alive = true;
    setLoading(true);
    productsApi.similar(productId, count)
      .then(list => { if (alive) setItems(list); })
      .catch(() => { if (alive) setItems([]); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [productId, count]);

  if (!loading && items.length === 0) return null;

  return (
    <section className="similar">
      <h2 className="similar-title">Похожие товары</h2>
      <div className="products-grid">
        {loading
          ? <ProductCardSkeleton count={count} />
          : items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)
        }
      </div>
    </section>
  );
}

import { useEffect, useState } from 'react';
import { useFavorites } from '../context/FavoritesContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import { EmptyState, ProductCardSkeleton } from '../components/UiStates';
import { productsApi, wishlistApi } from '../api';
import '../styles/catalog.css';

export default function FavoritesPage() {
  const { ids, clear } = useFavorites();
  const { isAuthenticated } = useAuth();

  const [items, setItems]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);

    const load = async () => {
      try {
        if (isAuthenticated) {
          const res = await wishlistApi.list({ size: 200 });
          if (alive) setItems(res.items);
        } else {
          const list = await Promise.all(
            ids.map(id => productsApi.byId(id).catch(() => null))
          );
          if (alive) setItems(list.filter(Boolean));
        }
      } catch {
        if (alive) setItems([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    load();
    return () => { alive = false; };
  }, [isAuthenticated, ids]);

  return (
    <div className="catalog-page">
      <div className="container">
        <div className="catalog-toolbar" style={{ marginBottom: 20 }}>
          <h1 className="section-title" style={{ marginBottom: 0 }}>
            Избранное {items.length > 0 && (
              <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({items.length})</span>
            )}
          </h1>
          {items.length > 0 && (
            <button className="catalog-filter-reset" onClick={clear}>Очистить всё</button>
          )}
        </div>

        {loading
          ? <div className="products-grid"><ProductCardSkeleton count={6} /></div>
          : items.length === 0
          ? <EmptyState title="В избранном пока ничего нет" cta="Перейти в каталог" ctaHref="/catalog" />
          : <div className="products-grid">
              {items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
        }
      </div>
    </div>
  );
}

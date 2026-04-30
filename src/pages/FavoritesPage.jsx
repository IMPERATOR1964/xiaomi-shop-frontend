import { Link } from 'react-router-dom';
import { useFavorites } from '../context/FavoritesContext';
import ProductCard from '../components/ProductCard';
import { PRODUCTS } from '../data/products';
import '../styles/catalog.css';

export default function FavoritesPage() {
  const { ids, clear } = useFavorites();

  const items = PRODUCTS.filter(p => ids.includes(p.id));

  return (
    <div className="catalog-page">
      <div className="container">
        <div className="catalog-toolbar" style={{ marginBottom: 20 }}>
          <h1 className="section-title" style={{ marginBottom: 0 }}>
            Избранное {items.length > 0 && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({items.length})</span>}
          </h1>
          {items.length > 0 && (
            <button className="catalog-filter-reset" onClick={clear}>Очистить всё</button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="catalog-empty">
            <div className="catalog-empty-icon">💔</div>
            <p>В избранном пока ничего нет</p>
            <Link to="/catalog" className="btn-primary" style={{ marginTop: 20 }}>Перейти в каталог</Link>
          </div>
        ) : (
          <div className="products-grid">
            {items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}

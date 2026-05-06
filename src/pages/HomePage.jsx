import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { ProductCardSkeleton } from '../components/UiStates';
import { productsApi } from '../api';
import '../styles/home.css';

export default function HomePage() {
  const [popular, setPopular] = useState([]);
  const [newest,  setNewest]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);

    Promise.all([
      productsApi.filter({ sortBy: 'popular' }, { size: 4 }),
      productsApi.filter({ sortBy: 'newest'  }, { size: 4 }),
    ])
      .then(([pop, nw]) => {
        if (!alive) return;
        setPopular(pop.items);
        setNewest(nw.items);
      })
      .catch(err => { if (alive) setError(err?.message || 'Не удалось загрузить'); })
      .finally(() => { if (alive) setLoading(false); });

    return () => { alive = false; };
  }, []);

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-content">
            <h1 className="hero-title">
              Мир <span className="highlight">Xiaomi</span><br />
              в одном месте
            </h1>
            <p className="hero-subtitle">
              Смартфоны, аксессуары и гарнитура Xiaomi с гарантией и бесплатной доставкой. Лучшие цены — только у нас.
            </p>
            <div className="hero-actions">
              <Link to="/catalog" className="btn-primary">Каталог →</Link>
              <Link to="/catalog/smartphones" className="btn-outline">Смартфоны</Link>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-phone">
              <div className="hero-phone-brand">XIAOMI</div>
              <div className="hero-phone-model">14 Ultra</div>
              <div className="hero-phone-spec">Leica · Snapdragon 8 Gen 3</div>
            </div>
          </div>
        </div>
      </section>

      <section className="container" style={{ paddingBottom: '48px' }}>
        <div className="section-header">
          <h2 className="section-title">Популярные товары</h2>
          <Link to="/catalog" className="section-link">Смотреть все →</Link>
        </div>
        <div className="products-grid">
          {loading
            ? <ProductCardSkeleton count={4} />
            : popular.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)
          }
        </div>
      </section>

      <section className="container" style={{ paddingBottom: '48px' }}>
        <div className="section-header">
          <h2 className="section-title">✨ Новинки</h2>
          <Link to="/catalog" className="section-link">Все товары →</Link>
        </div>
        <div className="products-grid">
          {loading
            ? <ProductCardSkeleton count={4} />
            : newest.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)
          }
        </div>
        {error && !loading && <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{error}</p>}
      </section>
    </>
  );
}

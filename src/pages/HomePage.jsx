import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import RecentlyViewed from '../components/RecentlyViewed';
import { ProductCardSkeleton } from '../components/UiStates';
import { productsApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { useHistory } from '../context/HistoryContext';
import '../styles/home.css';

// Персонализированные рекомендации:
// Если есть история просмотров или избранное — показываем товары из тех же категорий.
function useRecommendations(historyIds, favIds) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [seedCategory, setSeedCategory] = useState(null);

  useEffect(() => {
    let alive = true;
    const seedIds = [...favIds, ...historyIds].slice(0, 3);
    if (seedIds.length === 0) { setItems([]); return; }

    setLoading(true);
    Promise.all(seedIds.map(id => productsApi.byId(id).catch(() => null)))
      .then(async list => {
        const seeds = list.filter(Boolean);
        if (!seeds.length) { if (alive) setItems([]); return; }

        // Берём наиболее частую категорию из «зерна»
        const counts = {};
        seeds.forEach(p => { counts[p.category] = (counts[p.category] || 0) + 1; });
        const topCategory = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
        const cat = seeds.find(p => p.category === topCategory);
        if (alive) setSeedCategory(cat?.categoryName || topCategory);

        const res = await productsApi.filter(
          { categoryId: cat?.categoryId, sortBy: 'popular' },
          { size: 8 },
        );
        if (!alive) return;
        // Исключаем уже виденные
        const seen = new Set([...historyIds, ...favIds]);
        setItems(res.items.filter(p => !seen.has(p.id)).slice(0, 4));
      })
      .catch(() => { if (alive) setItems([]); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyIds.join(','), favIds.join(',')]);

  return { items, loading, seedCategory };
}

export default function HomePage() {
  const { user } = useAuth();
  const { ids: favIds }     = useFavorites();
  const { ids: historyIds } = useHistory();

  const [popular, setPopular] = useState([]);
  const [newest,  setNewest]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const recs = useRecommendations(historyIds, favIds);

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

  const greeting = user
    ? `С возвращением, ${user.name}!`
    : null;

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-content">
            {greeting && (
              <div className="hero-greeting">{greeting}</div>
            )}
            <h1 className="hero-title">
              {user
                ? <>Подобрали товары<br />специально для вас</>
                : <>Мир <span className="highlight">Xiaomi</span><br />в одном месте</>
              }
            </h1>
            <p className="hero-subtitle">
              {user
                ? 'Смотрите рекомендации ниже — на основе истории и избранного. Бесплатная доставка по РФ.'
                : 'Смартфоны, аксессуары и гарнитура Xiaomi с гарантией и бесплатной доставкой. Лучшие цены — только у нас.'
              }
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

      {/* Рекомендации — только если есть история или избранное */}
      {(recs.loading || recs.items.length > 0) && (
        <section className="container" style={{ paddingBottom: '48px' }}>
          <div className="section-header">
            <h2 className="section-title">🎯 Рекомендуем вам</h2>
            {recs.seedCategory && (
              <span className="section-link" style={{ color: 'var(--text-muted)' }}>
                на основе ваших интересов
              </span>
            )}
          </div>
          <div className="products-grid">
            {recs.loading
              ? <ProductCardSkeleton count={4} />
              : recs.items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)
            }
          </div>
        </section>
      )}

      {/* Недавно смотрели */}
      <div className="container">
        <RecentlyViewed title="👀 Вы недавно смотрели" count={4} />
      </div>

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

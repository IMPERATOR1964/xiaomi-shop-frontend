import { useEffect, useMemo, useState, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import CategoryCard from '../components/CategoryCard';
import CatalogFilter from '../components/CatalogFilter';
import { ErrorState, EmptyState, ProductCardSkeleton } from '../components/UiStates';
import { CATEGORIES, FILTER_CONFIG } from '../data/products';
import { productsApi } from '../api';
import '../styles/catalog.css';

const PAGE_SIZE = 24;

export default function CatalogPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const routerLoc = useLocation();
  const activeCategory = category || 'all';
  const isMain = activeCategory === 'all';

  const searchQuery = useMemo(() => {
    const params = new URLSearchParams(routerLoc.search);
    return params.get('q') || '';
  }, [routerLoc.search]);

  const activeCat = CATEGORIES.find(c => c.id === activeCategory);
  const backendCategoryId = activeCat?.backendId || null;

  const [sortBy,     setSortBy]     = useState('newest');
  const [filters,    setFilters]    = useState({});
  const [priceRange, setPriceRange] = useState([0, 999999]);
  const [showFilter, setShowFilter] = useState(false);

  const [products, setProducts] = useState([]);
  const [total,    setTotal]    = useState(0);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState(null);

  const buildFilterRequest = useCallback(() => {
    const stringFilters    = {};
    const multiValueFilters = {};
    Object.entries(filters).forEach(([key, set]) => {
      if (!set || set.size === 0) return;
      const arr = [...set];
      if (arr.length === 1) stringFilters[key] = arr[0];
      else                  multiValueFilters[key] = arr;
    });

    const req = { sortBy };
    if (backendCategoryId) req.categoryId = backendCategoryId;
    if (searchQuery)       req.query = searchQuery;
    if (priceRange?.[0] > 0)        req.minPrice = priceRange[0];
    if (priceRange?.[1] < 999999)   req.maxPrice = priceRange[1];
    if (Object.keys(stringFilters).length)    req.stringFilters = stringFilters;
    if (Object.keys(multiValueFilters).length) req.multiValueFilters = multiValueFilters;
    return req;
  }, [filters, sortBy, priceRange, backendCategoryId, searchQuery]);

  useEffect(() => {
    if (isMain && !searchQuery) return;

    let alive = true;
    setLoading(true);
    setError(null);
    productsApi
      .filter(buildFilterRequest(), { page: 0, size: PAGE_SIZE })
      .then(res => {
        if (!alive) return;
        setProducts(res.items);
        setTotal(res.total);
      })
      .catch(err => { if (alive) setError(err?.message || 'Не удалось загрузить товары'); })
      .finally(() => { if (alive) setLoading(false); });

    return () => { alive = false; };
  }, [isMain, searchQuery, buildFilterRequest]);

  useEffect(() => {
    setFilters({});
    setPriceRange([0, 999999]);
  }, [activeCategory, searchQuery]);

  const handleCategory = (catId) => {
    if (catId === 'all') navigate('/catalog');
    else                 navigate(`/catalog/${catId}`);
  };

  const resetFilters = () => {
    setFilters({});
    setPriceRange([0, 999999]);
  };

  const filterOptions = useMemo(() => {
    if (isMain || !products.length) return [];
    const conf = FILTER_CONFIG[activeCategory] || [];
    return conf.map(({ key, label }) => {
      const values = [...new Set(
        products.filter(p => p.specs?.[key] != null).map(p => String(p.specs[key]))
      )].sort((a, b) => a.localeCompare(b, 'ru'));
      return { key, label, values };
    }).filter(x => x.values.length > 1);
  }, [activeCategory, products, isMain]);

  const computedPriceMin = products.length ? Math.min(...products.map(p => p.price)) : 0;
  const computedPriceMax = products.length ? Math.max(...products.map(p => p.price)) : 0;

  // Главная каталога — карточки категорий
  if (isMain && !searchQuery) {
    return (
      <div className="catalog-page">
        <div className="container">
          <h1 className="section-title">Каталог</h1>
          <p className="catalog-intro">Выберите категорию товаров</p>

          <div className="cat-grid">
            {CATEGORIES.filter(c => c.id !== 'all').map(c => (
              <CategoryCard key={c.id} category={c} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="catalog-page">
      <div className="container">
        <h1 className="section-title">
          {searchQuery ? `Результаты поиска: «${searchQuery}»` : (activeCat?.label || 'Каталог')}
        </h1>

        <div className="category-bar">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`category-chip ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => handleCategory(cat.id)}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        <div className="catalog-body">
          {!isMain && (
            <>
              <button
                className="catalog-filter-mobile-btn"
                onClick={() => setShowFilter(s => !s)}
              >
                {showFilter ? 'Скрыть фильтр' : 'Показать фильтр'}
              </button>
              <div className={`catalog-filter-wrap ${showFilter ? 'open' : ''}`}>
                <CatalogFilter
                  options={filterOptions}
                  filters={filters}
                  setFilters={setFilters}
                  priceMin={computedPriceMin}
                  priceMax={computedPriceMax || 999999}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  onReset={resetFilters}
                />
              </div>
            </>
          )}

          <div className="catalog-content">
            <div className="catalog-toolbar">
              <span className="catalog-count">
                {loading ? 'Загружаем...' : `Найдено: ${total} товаров`}
              </span>
              <div className="catalog-sort">
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  <option value="newest">Сначала новые</option>
                  <option value="popular">Популярные</option>
                  <option value="rating">По рейтингу</option>
                  <option value="price_asc">Сначала дешёвые</option>
                  <option value="price_desc">Сначала дорогие</option>
                </select>
              </div>
            </div>

            {error
              ? <ErrorState message={error} onRetry={() => setFilters({ ...filters })} />
              : loading
              ? <div className="products-grid"><ProductCardSkeleton count={8} /></div>
              : products.length === 0
              ? <EmptyState
                  icon="📦"
                  title={searchQuery ? `По запросу «${searchQuery}» ничего не найдено` : 'Товары не найдены'}
                />
              : <div className="products-grid">
                  {products.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
                </div>
            }
          </div>
        </div>
      </div>
    </div>
  );
}

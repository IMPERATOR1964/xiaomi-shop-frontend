import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import CategoryCard from '../components/CategoryCard';
import CatalogFilter from '../components/CatalogFilter';
import {
  PRODUCTS, CATEGORIES,
  buildFilterOptions, matchFilters, searchProducts,
} from '../data/products';
import '../styles/catalog.css';

export default function CatalogPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const routerLoc = useLocation();
  const activeCategory = category || 'all';
  const isMain = activeCategory === 'all'; // главная страница каталога — карточки категорий

  // Поисковый запрос из URL
  const searchQuery = useMemo(() => {
    const params = new URLSearchParams(routerLoc.search);
    return params.get('q') || '';
  }, [routerLoc.search]);

  const [sortBy, setSortBy] = useState('default');
  const [filters, setFilters] = useState({});
  const [priceRange, setPriceRange] = useState(null);
  const [showFilter, setShowFilter] = useState(false);

  // База: товары категории + по поиску
  const baseProducts = useMemo(() => {
    let list = isMain ? PRODUCTS : PRODUCTS.filter(p => p.category === activeCategory);
    list = searchProducts(list, searchQuery);
    return list;
  }, [activeCategory, isMain, searchQuery]);

  const priceMin = useMemo(() => baseProducts.length ? Math.min(...baseProducts.map(p => p.price)) : 0, [baseProducts]);
  const priceMax = useMemo(() => baseProducts.length ? Math.max(...baseProducts.map(p => p.price)) : 0, [baseProducts]);

  // Сброс фильтра при смене категории/поиска
  useEffect(() => {
    setFilters({});
    setPriceRange([priceMin, priceMax]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory, searchQuery, priceMin, priceMax]);

  const filterOptions = useMemo(
    () => isMain ? [] : buildFilterOptions(baseProducts, activeCategory),
    [baseProducts, activeCategory, isMain]
  );

  const filtered = useMemo(() => {
    if (isMain) return baseProducts;
    const [pmin, pmax] = priceRange || [priceMin, priceMax];
    return baseProducts.filter(p =>
      matchFilters(p, filters) &&
      p.price >= pmin && p.price <= pmax
    );
  }, [baseProducts, filters, priceRange, priceMin, priceMax, isMain]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    if (sortBy === 'price-asc') arr.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price-desc') arr.sort((a, b) => b.price - a.price);
    else if (sortBy === 'name') arr.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
    return arr;
  }, [filtered, sortBy]);

  const handleCategory = (catId) => {
    if (catId === 'all') navigate('/catalog');
    else navigate(`/catalog/${catId}`);
  };

  const getCategoryCount = (catId) => {
    if (catId === 'all') return PRODUCTS.length;
    return PRODUCTS.filter(p => p.category === catId).length;
  };

  const getCategoryFromPrice = (catId) => {
    const list = PRODUCTS.filter(p => p.category === catId);
    if (!list.length) return null;
    return Math.min(...list.map(p => p.price));
  };

  const resetFilters = () => {
    setFilters({});
    setPriceRange([priceMin, priceMax]);
  };

  const activeCat = CATEGORIES.find(c => c.id === activeCategory);

  // На главной каталога без поиска — Xiaomi-style карточки категорий
  if (isMain && !searchQuery) {
    return (
      <div className="catalog-page">
        <div className="container">
          <h1 className="section-title">Каталог</h1>
          <p className="catalog-intro">Выберите категорию товаров</p>

          <div className="cat-grid">
            {CATEGORIES.filter(c => c.id !== 'all').map(c => (
              <CategoryCard
                key={c.id}
                category={c}
                count={getCategoryCount(c.id)}
                fromPrice={getCategoryFromPrice(c.id)}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Страница категории / результатов поиска
  return (
    <div className="catalog-page">
      <div className="container">
        <h1 className="section-title">
          {searchQuery ? `Результаты поиска: «${searchQuery}»` : (activeCat?.label || 'Каталог')}
        </h1>

        {/* Чипы категорий */}
        <div className="category-bar">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`category-chip ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => handleCategory(cat.id)}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              <span className="category-count">{getCategoryCount(cat.id)}</span>
            </button>
          ))}
        </div>

        {/* Body: фильтр слева + товары справа */}
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
                  priceMin={priceMin}
                  priceMax={priceMax}
                  priceRange={priceRange || [priceMin, priceMax]}
                  setPriceRange={setPriceRange}
                  onReset={resetFilters}
                />
              </div>
            </>
          )}

          <div className="catalog-content">
            <div className="catalog-toolbar">
              <span className="catalog-count">Найдено: {sorted.length} товаров</span>
              <div className="catalog-sort">
                <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
                  <option value="default">По умолчанию</option>
                  <option value="price-asc">Сначала дешёвые</option>
                  <option value="price-desc">Сначала дорогие</option>
                  <option value="name">По названию</option>
                </select>
              </div>
            </div>

            {sorted.length === 0 ? (
              <div className="catalog-empty">
                <div className="catalog-empty-icon">📦</div>
                <p>Товары не найдены</p>
                {(Object.keys(filters).length > 0 || searchQuery) && (
                  <button className="btn-outline btn-sm" onClick={resetFilters} style={{ marginTop: 16 }}>
                    Сбросить фильтр
                  </button>
                )}
              </div>
            ) : (
              <div className="products-grid">
                {sorted.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

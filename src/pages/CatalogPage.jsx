import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import CategoryCard from '../components/CategoryCard';
import CategoryIcon from '../components/CategoryIcon';
import CatalogFilter from '../components/CatalogFilter';
import ScrollableChips from '../components/ScrollableChips';
import { ErrorState, EmptyState, ProductCardSkeleton } from '../components/UiStates';
import { FILTER_CONFIG } from '../data/products';
import { useCategories } from '../context/CategoriesContext';
import { productsApi } from '../api';
import '../styles/catalog.css';

// Грузим весь набор категории одним запросом и фильтруем/сортируем на клиенте —
// так левый фильтр никогда не «схлопывается», можно комбинировать значения,
// а сортировка работает мгновенно и предсказуемо.
const LOAD_SIZE = 200;

export default function CatalogPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const routerLoc = useLocation();
  const { categories: CATEGORIES, findBySlug } = useCategories();
  const activeCategory = category || 'all';
  const isMain = activeCategory === 'all';

  const searchQuery = useMemo(() => {
    const params = new URLSearchParams(routerLoc.search);
    return params.get('q') || '';
  }, [routerLoc.search]);

  const activeCat = findBySlug(activeCategory);
  const backendCategoryId = activeCat?.backendId || null;

  // Запоминаем сортировку per-категория в localStorage.
  const sortKey = `voltix-sort-${activeCategory}`;
  const [sortBy, setSortBy] = useState(() => {
    return localStorage.getItem(sortKey) || 'newest';
  });
  const [filters,    setFilters]    = useState({});
  const [priceRange, setPriceRange] = useState([0, 999999]);
  const [showFilter, setShowFilter] = useState(false);

  // При смене категории — подтягиваем сохранённую сортировку.
  useEffect(() => {
    const saved = localStorage.getItem(`voltix-sort-${activeCategory}`);
    setSortBy(saved || 'newest');
  }, [activeCategory]);

  // При изменении сортировки — сохраняем.
  useEffect(() => {
    localStorage.setItem(sortKey, sortBy);
  }, [sortBy, sortKey]);

  // allProducts — полный набор категории/поиска (грузится один раз, без фильтров).
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  // Загрузка полного набора. Зависит ТОЛЬКО от категории и поиска,
  // НЕ от filters/sortBy/price — поэтому набор не перезагружается при фильтрации.
  useEffect(() => {
    if (isMain && !searchQuery) return;

    let alive = true;
    setLoading(true);
    setError(null);

    const load = searchQuery
      ? productsApi.search(searchQuery, { page: 0, size: LOAD_SIZE })
      : productsApi.filter(
          { sortBy: 'newest', ...(backendCategoryId ? { categoryId: backendCategoryId } : {}) },
          { page: 0, size: LOAD_SIZE },
        );

    load
      .then(res => {
        if (!alive) return;
        let items = res.items;
        // Поиск может вернуть товары разных категорий — оставляем только нужную.
        if (searchQuery && backendCategoryId) {
          items = items.filter(p => p.categoryId === backendCategoryId);
        }
        setAllProducts(items);
      })
      .catch(err => { if (alive) setError(err?.message || 'Не удалось загрузить товары'); })
      .finally(() => { if (alive) setLoading(false); });

    return () => { alive = false; };
  }, [isMain, searchQuery, backendCategoryId]);

  // Сброс фильтров при смене категории/поиска.
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

  // Опции фильтра строятся из ПОЛНОГО набора — поэтому секции стабильны,
  // не исчезают после выбора значения.
  const filterOptions = useMemo(() => {
    if (isMain || !allProducts.length) return [];
    const conf = FILTER_CONFIG[activeCategory] || [];
    return conf.map(({ key, label, primary }) => {
      const values = [...new Set(
        allProducts.filter(p => p.specs?.[key] != null).map(p => String(p.specs[key]))
      )].sort((a, b) => a.localeCompare(b, 'ru'));
      return { key, label, primary: primary !== false, values };
    }).filter(x => x.values.length > 1);
  }, [activeCategory, allProducts, isMain]);

  const computedPriceMin = allProducts.length ? Math.min(...allProducts.map(p => p.price)) : 0;
  const computedPriceMax = allProducts.length ? Math.max(...allProducts.map(p => p.price)) : 0;

  // Применяем фильтры + цену + сортировку НА КЛИЕНТЕ к полному набору.
  // AND между разными атрибутами, OR внутри одного атрибута.
  const products = useMemo(() => {
    let list = allProducts.filter(p => {
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
      for (const [key, set] of Object.entries(filters)) {
        if (!set || set.size === 0) continue;
        const v = p.specs?.[key];
        if (v == null || !set.has(String(v))) return false;
      }
      return true;
    });
    const arr = [...list];
    if      (sortBy === 'price_asc')  arr.sort((a, b) => a.price - b.price);
    else if (sortBy === 'price_desc') arr.sort((a, b) => b.price - a.price);
    else if (sortBy === 'rating')     arr.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
    // newest / popular — оставляем порядок, в котором пришло с бэка
    return arr;
  }, [allProducts, filters, priceRange, sortBy]);

  const total = products.length;

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

        <ScrollableChips>
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              className={`category-chip ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => handleCategory(cat.id)}
            >
              <CategoryIcon category={cat.id} size={16} />
              <span>{cat.label}</span>
            </button>
          ))}
        </ScrollableChips>

        <div className={`catalog-body ${isMain ? 'catalog-body-nofilter' : ''}`}>
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

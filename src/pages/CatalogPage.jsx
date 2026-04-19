import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { PRODUCTS, CATEGORIES } from '../data/products';
import '../styles/catalog.css';

export default function CatalogPage() {
  const { category } = useParams();
  const navigate = useNavigate();
  const activeCategory = category || 'all';
  const [sortBy, setSortBy] = useState('default');

  const filtered = activeCategory === 'all'
    ? PRODUCTS
    : PRODUCTS.filter(p => p.category === activeCategory);

  const sorted = [...filtered].sort((a, b) => {
    if (sortBy === 'price-asc') return a.price - b.price;
    if (sortBy === 'price-desc') return b.price - a.price;
    if (sortBy === 'name') return a.name.localeCompare(b.name, 'ru');
    return 0;
  });

  const handleCategory = (catId) => {
    if (catId === 'all') navigate('/catalog');
    else navigate(`/catalog/${catId}`);
  };

  const getCategoryCount = (catId) => {
    if (catId === 'all') return PRODUCTS.length;
    return PRODUCTS.filter(p => p.category === catId).length;
  };

  return (
    <div className="catalog-page">
      <div className="container">
        <h1 className="section-title">Каталог</h1>

        {/* Category filter */}
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

        {/* Toolbar */}
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

        {/* Products grid */}
        {sorted.length === 0 ? (
          <div className="catalog-empty">
            <div className="catalog-empty-icon">📦</div>
            <p>Товары не найдены</p>
          </div>
        ) : (
          <div className="products-grid">
            {sorted.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
          </div>
        )}
      </div>
    </div>
  );
}

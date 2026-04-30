import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { PRODUCTS } from '../data/products';
import '../styles/home.css';

export default function HomePage() {
  const popular = PRODUCTS.filter(p => p.badge === 'hit' || p.badge === 'new').slice(0, 4);
  const onSale = PRODUCTS.filter(p => p.badge === 'sale');

  return (
    <>
      {/* Hero */}
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

      {/* Popular */}
      <section className="container" style={{ paddingBottom: '48px' }}>
        <div className="section-header">
          <h2 className="section-title">Популярные товары</h2>
          <Link to="/catalog" className="section-link">Смотреть все →</Link>
        </div>
        <div className="products-grid">
          {popular.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </section>

      {/* On sale */}
      <section className="container" style={{ paddingBottom: '48px' }}>
        <div className="section-header">
          <h2 className="section-title">🔥 Скидки</h2>
          <Link to="/catalog" className="section-link">Все акции →</Link>
        </div>
        <div className="products-grid">
          {onSale.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
        </div>
      </section>
    </>
  );
}

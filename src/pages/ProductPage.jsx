import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useCompare } from '../context/CompareContext';
import { CATEGORIES, formatPrice, formatSKU } from '../data/products';
import { productsApi } from '../api';
import ProductVariants from '../components/ProductVariants';
import ShareButton from '../components/ShareButton';
import SimilarProducts from '../components/SimilarProducts';
import RecentlyViewed from '../components/RecentlyViewed';
import ProductReviews, { StarRating } from '../components/ProductReviews';
import { Loading } from '../components/UiStates';
import { useHistory } from '../context/HistoryContext';
import '../styles/product.css';

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { has: isFav, toggle: toggleFav } = useFavorites();
  const { has: isCmp, toggle: toggleCmp } = useCompare();
  const { track } = useHistory();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    setLoading(true);
    setError(null);
    productsApi.byId(id)
      .then(p => {
        if (!alive) return;
        setProduct(p);
        if (p?.id != null) track(p.id); // запоминаем просмотр
      })
      .catch(err => { if (alive) setError(err?.message || 'Товар не найден'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [id, track]);

  if (loading) {
    return <div className="container" style={{ padding: '32px 0' }}><Loading label="Загружаем товар..." /></div>;
  }
  if (error || !product) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2>Товар не найден</h2>
        <p style={{ color: 'var(--text-muted)', margin: '12px 0' }}>{error}</p>
        <Link to="/catalog" className="btn-primary" style={{ marginTop: 20 }}>
          Вернуться в каталог
        </Link>
      </div>
    );
  }

  const catLabel = CATEGORIES.find(c => c.id === product.category)?.label || '';
  const fav = isFav(product.id);
  const cmp = isCmp(product.id);
  const avg = product.averageRating || 0;
  const reviewsCount = product.reviewsCount || 0;

  const handleAddToCart = () => {
    addToCart(product);
    navigate('/cart');
  };

  return (
    <div className="product-page">
      <div className="container">
        <div className="product-breadcrumb">
          <Link to="/">Главная</Link>
          <span>/</span>
          <Link to="/catalog">Каталог</Link>
          <span>/</span>
          <Link to={`/catalog/${product.category}`}>{catLabel}</Link>
          <span>/</span>
          <span>{product.name}</span>
        </div>

        <div className="product-detail">
          <div className="product-detail-image">
            {product.imageUrl
              ? <img src={product.imageUrl} alt={product.name} className="product-detail-photo" />
              : product.image
            }
          </div>

          <div className="product-detail-info">
            <div className="product-detail-meta">
              <div className="product-detail-category">{catLabel}</div>
              <div className="product-detail-sku">Артикул: <b>{formatSKU(product)}</b></div>
            </div>

            <h1 className="product-detail-name">{product.name}</h1>

            <div className="product-detail-rating">
              <StarRating value={avg} readonly />
              {reviewsCount > 0 ? (
                <a href="#reviews" className="product-detail-rating-link">
                  {avg.toFixed(1)} · {reviewsCount} отзыв{reviewsCount === 1 ? '' : (reviewsCount < 5 ? 'а' : 'ов')}
                </a>
              ) : (
                <a href="#reviews" className="product-detail-rating-link product-detail-rating-empty">Нет отзывов</a>
              )}
            </div>

            <p className="product-detail-desc">{product.desc}</p>

            <ProductVariants product={product} />

            <div className="product-detail-price-row">
              <span className="product-detail-price">{formatPrice(product.price)}</span>
              {product.oldPrice && (
                <>
                  <span className="product-detail-old-price">{formatPrice(product.oldPrice)}</span>
                  <span className="product-detail-discount">
                    −{Math.round((1 - product.price / product.oldPrice) * 100)}%
                  </span>
                </>
              )}
            </div>

            <div className="product-detail-actions">
              <button className="btn-primary product-cart-main" onClick={handleAddToCart}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
                </svg>
                Добавить в корзину
              </button>

              <button
                type="button"
                className={`product-icon-action ${fav ? 'active fav' : ''}`}
                onClick={() => toggleFav(product.id)}
                title={fav ? 'В избранном' : 'В избранное'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill={fav ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"/>
                </svg>
              </button>

              <button
                type="button"
                className={`product-icon-action ${cmp ? 'active cmp' : ''}`}
                onClick={() => toggleCmp(product.id)}
                title={cmp ? 'В сравнении' : 'К сравнению'}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/><path d="M9 3v18"/>
                </svg>
              </button>

              <ShareButton product={product} />
            </div>

            <div className="product-features">
              <div className="product-feature">
                <span className="product-feature-icon">🚚</span>
                <div>
                  <b>Бесплатная доставка</b>
                  <small>от 1 дня по РФ</small>
                </div>
              </div>
              <div className="product-feature">
                <span className="product-feature-icon">🛡️</span>
                <div>
                  <b>Гарантия 12 мес.</b>
                  <small>Официальный сервис</small>
                </div>
              </div>
              <div className="product-feature">
                <span className="product-feature-icon">↩️</span>
                <div>
                  <b>Возврат 14 дней</b>
                </div>
              </div>
            </div>
          </div>
        </div>

        {product.specs && Object.keys(product.specs).length > 0 && (
          <section className="product-specs-block">
            <h2 className="product-specs-title">Характеристики</h2>
            <div className="product-specs-grid">
              {Object.entries(product.specs).map(([key, val]) => (
                <div className="product-spec-row" key={key}>
                  <span className="product-spec-label">{key}</span>
                  <span className="product-spec-value">{val}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        <section id="reviews" style={{ scrollMarginTop: 80 }}>
          <ProductReviews productId={product.id} />
        </section>

        <SimilarProducts productId={product.id} />

        <RecentlyViewed excludeId={product.id} />
      </div>
    </div>
  );
}

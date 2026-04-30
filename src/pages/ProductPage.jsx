import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useCompare } from '../context/CompareContext';
import { PRODUCTS, CATEGORIES, formatPrice, formatSKU } from '../data/products';
import ProductVariants from '../components/ProductVariants';
import ShareButton from '../components/ShareButton';
import SimilarProducts from '../components/SimilarProducts';
import ProductReviews, { StarRating } from '../components/ProductReviews';
import { useReviews } from '../context/ReviewsContext';
import '../styles/product.css';

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { has: isFav, toggle: toggleFav } = useFavorites();
  const { has: isCmp, toggle: toggleCmp } = useCompare();
  const { getReviews, getAverageRating } = useReviews();

  const product = PRODUCTS.find(p => p.id === Number(id));

  if (!product) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2>Товар не найден</h2>
        <Link to="/catalog" className="btn-primary" style={{ marginTop: '20px' }}>
          Вернуться в каталог
        </Link>
      </div>
    );
  }

  const catLabel = CATEGORIES.find(c => c.id === product.category)?.label || '';
  const fav = isFav(product.id);
  const cmp = isCmp(product.id);
  const reviews = getReviews(product.id);
  const avg = getAverageRating(product.id);

  const handleAddToCart = () => {
    addToCart(product);
    navigate('/cart');
  };

  return (
    <div className="product-page">
      <div className="container">
        {/* Хлебные крошки */}
        <div className="product-breadcrumb">
          <Link to="/">Главная</Link>
          <span>/</span>
          <Link to="/catalog">Каталог</Link>
          <span>/</span>
          <Link to={`/catalog/${product.category}`}>{catLabel}</Link>
          <span>/</span>
          <span>{product.name}</span>
        </div>

        {/* Детали товара */}
        <div className="product-detail">
          <div className="product-detail-image">
            {product.image}
            {product.badge && (
              <span className={`product-card-badge badge-${product.badge}`} style={{ position: 'absolute', top: 16, left: 16 }}>
                {product.badge === 'new' ? 'Новинка' : product.badge === 'sale' ? 'Скидка' : 'Хит'}
              </span>
            )}
          </div>

          <div className="product-detail-info">
            <div className="product-detail-meta">
              <div className="product-detail-category">{catLabel}</div>
              <div className="product-detail-sku">Артикул: <b>{formatSKU(product)}</b></div>
            </div>

            <h1 className="product-detail-name">{product.name}</h1>

            {/* Рейтинг */}
            <div className="product-detail-rating">
              <StarRating value={avg} readonly />
              {reviews.length > 0 ? (
                <a href="#reviews" className="product-detail-rating-link">
                  {avg.toFixed(1)} · {reviews.length} отзыв{reviews.length === 1 ? '' : (reviews.length < 5 ? 'а' : 'ов')}
                </a>
              ) : (
                <a href="#reviews" className="product-detail-rating-link product-detail-rating-empty">Нет отзывов</a>
              )}
            </div>

            <p className="product-detail-desc">{product.desc}</p>

            {/* Варианты */}
            <ProductVariants product={product} />

            {/* Цена */}
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

            {/* Кнопки */}
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

            {/* Доставка/гарантия */}
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

        {/* Характеристики */}
        {product.specs && (
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

        {/* Отзывы */}
        <section id="reviews" style={{ scrollMarginTop: 80 }}>
          <ProductReviews productId={product.id} />
        </section>

        {/* Похожие товары */}
        <SimilarProducts product={product} />
      </div>
    </div>
  );
}

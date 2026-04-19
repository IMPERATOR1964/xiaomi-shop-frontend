import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { PRODUCTS, CATEGORIES, formatPrice } from '../data/products';
import '../styles/product.css';

export default function ProductPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

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

  const handleAddToCart = () => {
    addToCart(product);
    navigate('/cart');
  };

  return (
    <div className="product-page">
      <div className="container">
        {/* Breadcrumb */}
        <div className="product-breadcrumb">
          <Link to="/">Главная</Link>
          <span>/</span>
          <Link to="/catalog">Каталог</Link>
          <span>/</span>
          <Link to={`/catalog/${product.category}`}>{catLabel}</Link>
          <span>/</span>
          <span>{product.name}</span>
        </div>

        {/* Product detail */}
        <div className="product-detail">
          <div className="product-detail-image">
            {product.image}
          </div>

          <div className="product-detail-info">
            <div className="product-detail-category">{catLabel}</div>
            <h1 className="product-detail-name">{product.name}</h1>
            <p className="product-detail-desc">{product.desc}</p>

            {/* Specs */}
            {product.specs && (
              <div className="product-detail-specs">
                {Object.entries(product.specs).map(([key, val]) => (
                  <div className="product-spec" key={key}>
                    <span className="product-spec-label">{key}</span>
                    <span className="product-spec-value">{val}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Price */}
            <div className="product-detail-price-row">
              <span className="product-detail-price">{formatPrice(product.price)}</span>
              {product.oldPrice && (
                <span className="product-detail-old-price">{formatPrice(product.oldPrice)}</span>
              )}
            </div>

            {/* Actions */}
            <div className="product-detail-actions">
              <button className="btn-primary" onClick={handleAddToCart}>
                🛒 Добавить в корзину
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

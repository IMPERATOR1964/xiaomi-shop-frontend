import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useReviews } from '../context/ReviewsContext';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api';

const Star = ({ filled, half, onClick, onMouseEnter, onMouseLeave }) => (
  <svg
    width="22" height="22" viewBox="0 0 24 24"
    onClick={onClick}
    onMouseEnter={onMouseEnter}
    onMouseLeave={onMouseLeave}
    style={{ cursor: onClick ? 'pointer' : 'default', flexShrink: 0 }}
  >
    <defs>
      {half && (
        <linearGradient id="halfStar">
          <stop offset="50%" stopColor="#FFB800"/>
          <stop offset="50%" stopColor="rgba(0,0,0,0.15)"/>
        </linearGradient>
      )}
    </defs>
    <path
      d="M12 2 15.09 8.26 22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z"
      fill={half ? 'url(#halfStar)' : (filled ? '#FFB800' : 'rgba(120,120,120,0.25)')}
      stroke={filled ? '#FFB800' : 'rgba(120,120,120,0.4)'}
      strokeWidth="1"
    />
  </svg>
);

export function StarRating({ value, onChange, readonly = false, size }) {
  const [hover, setHover] = useState(0);
  const display = hover || value;

  return (
    <div style={{ display: 'inline-flex', gap: 2, transform: size ? `scale(${size})` : undefined, transformOrigin: 'left center' }}>
      {[1, 2, 3, 4, 5].map(n => {
        const filled = n <= Math.floor(display);
        const half = !filled && n - 0.5 <= display;
        return (
          <Star
            key={n}
            filled={filled}
            half={half}
            onClick={readonly ? undefined : () => onChange?.(n)}
            onMouseEnter={readonly ? undefined : () => setHover(n)}
            onMouseLeave={readonly ? undefined : () => setHover(0)}
          />
        );
      })}
    </div>
  );
}

const formatDate = (iso) => {
  try { return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }); }
  catch { return ''; }
};

export default function ProductReviews({ productId }) {
  const { loadReviews, addReview, getReviews, getAverageRating, getReviewsCount } = useReviews();
  const { isAuthenticated } = useAuth();

  const reviews = getReviews(productId);
  const avg     = getAverageRating(productId);
  const total   = getReviewsCount(productId);

  const [open, setOpen]       = useState(false);
  const [rating, setRating]   = useState(5);
  const [title, setTitle]     = useState('');
  const [text, setText]       = useState('');
  const [error, setError]     = useState('');
  const [busy,  setBusy]      = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!productId) return;
    let alive = true;
    setLoading(true);
    loadReviews(productId)
      .catch(() => {})
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [productId, loadReviews]);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!text.trim() && !title.trim()) {
      setError('Напишите комментарий или заголовок');
      return;
    }
    setBusy(true);
    try {
      await addReview(productId, { rating, title, comment: text });
      setOpen(false);
      setRating(5); setTitle(''); setText('');
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) setError('Войдите, чтобы оставить отзыв');
      else if (err instanceof ApiError && err.status === 409) setError('Вы уже оставили отзыв');
      else setError(err?.message || 'Не удалось отправить отзыв');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="reviews">
      <div className="reviews-head">
        <div>
          <h2 className="reviews-title">Отзывы</h2>
          {total > 0 ? (
            <div className="reviews-summary">
              <StarRating value={avg} readonly />
              <span className="reviews-avg">{avg.toFixed(1)}</span>
              <span className="reviews-count">{total} отзыв{total === 1 ? '' : (total < 5 ? 'а' : 'ов')}</span>
            </div>
          ) : !loading && (
            <p className="reviews-empty-hint">Будьте первым, кто оставит отзыв</p>
          )}
        </div>
        {isAuthenticated ? (
          <button className="btn-primary btn-sm" onClick={() => setOpen(o => !o)}>
            {open ? 'Отмена' : 'Написать отзыв'}
          </button>
        ) : (
          <Link to="/login" className="btn-outline btn-sm">Войти, чтобы оставить отзыв</Link>
        )}
      </div>

      {open && isAuthenticated && (
        <form className="review-form" onSubmit={submit}>
          {error && <div className="auth-error">{error}</div>}
          <div className="review-form-row">
            <label className="review-form-label">Ваша оценка</label>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <div className="review-form-row">
            <label className="review-form-label">Заголовок</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Кратко о товаре"
              maxLength={255}
            />
          </div>
          <div className="review-form-row">
            <label className="review-form-label">Комментарий</label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Расскажите подробнее..."
              rows={5}
              maxLength={5000}
            />
          </div>
          <button type="submit" className="btn-primary" disabled={busy}>
            {busy ? 'Отправляем…' : 'Отправить отзыв'}
          </button>
        </form>
      )}

      {reviews.length > 0 && (
        <div className="reviews-list">
          {reviews.map(r => (
            <div key={r.id} className="review-item">
              <div className="review-item-head">
                <div className="review-author">
                  <div className="review-avatar">{(r.author || 'U').charAt(0).toUpperCase()}</div>
                  <div>
                    <div className="review-author-name">{r.author}</div>
                    <div className="review-date">{formatDate(r.date)}</div>
                  </div>
                </div>
                <StarRating value={r.rating} readonly />
              </div>
              {r.title && <div style={{ fontWeight: 700, marginBottom: 6 }}>{r.title}</div>}
              {r.text && <p className="review-text">{r.text}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

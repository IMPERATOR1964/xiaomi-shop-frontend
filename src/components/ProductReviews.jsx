import { useState } from 'react';
import { useReviews } from '../context/ReviewsContext';
import { useAuth } from '../context/AuthContext';

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
  const { addReview, getReviews, getAverageRating } = useReviews();
  const { user } = useAuth();

  const reviews = getReviews(productId);
  const avg = getAverageRating(productId);

  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [author, setAuthor] = useState(user?.name || '');
  const [pros, setPros] = useState('');
  const [cons, setCons] = useState('');
  const [text, setText] = useState('');

  const submit = (e) => {
    e.preventDefault();
    if (!text.trim() && !pros.trim() && !cons.trim()) return;
    addReview(productId, { author: author || user?.name || 'Аноним', rating, pros, cons, text });
    setOpen(false);
    setRating(5); setPros(''); setCons(''); setText('');
  };

  return (
    <div className="reviews">
      <div className="reviews-head">
        <div>
          <h2 className="reviews-title">Отзывы</h2>
          {reviews.length > 0 ? (
            <div className="reviews-summary">
              <StarRating value={avg} readonly />
              <span className="reviews-avg">{avg.toFixed(1)}</span>
              <span className="reviews-count">{reviews.length} отзыв{reviews.length === 1 ? '' : (reviews.length < 5 ? 'а' : 'ов')}</span>
            </div>
          ) : (
            <p className="reviews-empty-hint">Будьте первым, кто оставит отзыв</p>
          )}
        </div>
        <button className="btn-primary btn-sm" onClick={() => setOpen(o => !o)}>
          {open ? 'Отмена' : 'Написать отзыв'}
        </button>
      </div>

      {open && (
        <form className="review-form" onSubmit={submit}>
          <div className="review-form-row">
            <label className="review-form-label">Ваша оценка</label>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <div className="review-form-row">
            <label className="review-form-label">Имя</label>
            <input
              type="text"
              value={author}
              onChange={e => setAuthor(e.target.value)}
              placeholder={user?.name || 'Ваше имя'}
              maxLength={40}
            />
          </div>
          <div className="review-form-grid">
            <div className="review-form-row">
              <label className="review-form-label">Достоинства</label>
              <textarea
                value={pros}
                onChange={e => setPros(e.target.value)}
                placeholder="Что понравилось"
                rows={3}
                maxLength={400}
              />
            </div>
            <div className="review-form-row">
              <label className="review-form-label">Недостатки</label>
              <textarea
                value={cons}
                onChange={e => setCons(e.target.value)}
                placeholder="Что не понравилось"
                rows={3}
                maxLength={400}
              />
            </div>
          </div>
          <div className="review-form-row">
            <label className="review-form-label">Комментарий</label>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Расскажите подробнее..."
              rows={4}
              maxLength={1000}
            />
          </div>
          <button type="submit" className="btn-primary">Отправить отзыв</button>
        </form>
      )}

      {reviews.length > 0 && (
        <div className="reviews-list">
          {reviews.map(r => (
            <div key={r.id} className="review-item">
              <div className="review-item-head">
                <div className="review-author">
                  <div className="review-avatar">{r.author.charAt(0).toUpperCase()}</div>
                  <div>
                    <div className="review-author-name">{r.author}</div>
                    <div className="review-date">{formatDate(r.date)}</div>
                  </div>
                </div>
                <StarRating value={r.rating} readonly />
              </div>
              {(r.pros || r.cons) && (
                <div className="review-pros-cons">
                  {r.pros && <div className="review-pros"><b>+</b> {r.pros}</div>}
                  {r.cons && <div className="review-cons"><b>−</b> {r.cons}</div>}
                </div>
              )}
              {r.text && <p className="review-text">{r.text}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

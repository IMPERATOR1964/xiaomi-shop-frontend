import { Link } from 'react-router-dom';
import '../styles/ui-states.css';

export function Loading({ label = 'Загружаем...' }) {
  return (
    <div className="ui-state">
      <div className="ui-spinner" />
      <p className="ui-state-text">{label}</p>
    </div>
  );
}

export function ErrorState({ message = 'Что-то пошло не так', onRetry }) {
  return (
    <div className="ui-state">
      <div className="ui-state-icon">⚠️</div>
      <p className="ui-state-text">{message}</p>
      {onRetry && (
        <button className="btn-outline btn-sm" onClick={onRetry} style={{ marginTop: 14 }}>
          Повторить
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon = '📦', title = 'Ничего не найдено', cta, ctaHref }) {
  return (
    <div className="ui-state">
      <div className="ui-state-icon">{icon}</div>
      <p className="ui-state-text">{title}</p>
      {cta && ctaHref && (
        <Link to={ctaHref} className="btn-primary" style={{ marginTop: 16 }}>{cta}</Link>
      )}
    </div>
  );
}

export function ProductCardSkeleton({ count = 8 }) {
  return Array.from({ length: count }).map((_, i) => (
    <div key={i} className="product-card skeleton-card">
      <div className="skeleton-block" style={{ aspectRatio: 1, borderRadius: 0 }} />
      <div className="product-card-body">
        <div className="skeleton-block" style={{ height: 14, marginBottom: 8 }} />
        <div className="skeleton-block" style={{ height: 12, width: '70%', marginBottom: 16 }} />
        <div className="skeleton-block" style={{ height: 22, width: '50%' }} />
      </div>
    </div>
  ));
}

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

const ErrorIcon = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const EmptyIcon = () => (
  <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
    <line x1="12" y1="22.08" x2="12" y2="12"/>
  </svg>
);

export function ErrorState({ message = 'Что-то пошло не так', onRetry }) {
  return (
    <div className="ui-state">
      <div className="ui-state-icon"><ErrorIcon /></div>
      <p className="ui-state-text">{message}</p>
      {onRetry && (
        <button className="btn-outline btn-sm" onClick={onRetry} style={{ marginTop: 14 }}>
          Повторить
        </button>
      )}
    </div>
  );
}

export function EmptyState({ icon, title = 'Ничего не найдено', cta, ctaHref }) {
  return (
    <div className="ui-state">
      <div className="ui-state-icon">{icon || <EmptyIcon />}</div>
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

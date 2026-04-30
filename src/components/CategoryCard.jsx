import { Link } from 'react-router-dom';

export default function CategoryCard({ category, count, fromPrice }) {
  return (
    <Link
      to={category.id === 'all' ? '/catalog' : `/catalog/${category.id}`}
      className="cat-card"
    >
      <div className="cat-card-info">
        <h3 className="cat-card-title">{category.label}</h3>
        {fromPrice != null && (
          <p className="cat-card-from">от {fromPrice.toLocaleString('ru-RU')} ₽</p>
        )}
        <span className="cat-card-link">
          Перейти
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
          </svg>
        </span>
      </div>
      <div className="cat-card-icon">{category.icon}</div>
      {count != null && <span className="cat-card-count">{count}</span>}
    </Link>
  );
}

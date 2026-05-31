// Выпадающий блок live-поиска. Открывается при фокусе на поле в Header
// если есть введённый текст, и обновляется с debounce 300мс.
//
// Использование:
//   <SearchDropdown query={value} onSelect={() => closeAndClear()} />

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { productsApi } from '../api';
import { formatPrice } from '../data/products';
import ProductImage from './ProductImage';
import '../styles/search-dropdown.css';

const MAX_RESULTS = 8;
const DEBOUNCE_MS = 300;
const SKU_REGEX = /^\d{7}$/;

export default function SearchDropdown({ query, onSelect }) {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const reqRef = useRef(0); // защита от гонки запросов

  useEffect(() => {
    const q = (query || '').trim();
    if (q.length < 2) {
      setItems([]);
      setLoading(false);
      return;
    }

    const reqId = ++reqRef.current;
    setLoading(true);
    setError(null);

    const t = setTimeout(async () => {
      try {
        // Если запрос — артикул, сразу попытаемся точное совпадение
        if (SKU_REGEX.test(q)) {
          try {
            const product = await productsApi.bySku(q);
            if (reqId !== reqRef.current) return;
            setItems(product ? [product] : []);
            setLoading(false);
            return;
          } catch { /* fallthrough на обычный поиск */ }
        }

        const res = await productsApi.search(q, { page: 0, size: MAX_RESULTS });
        if (reqId !== reqRef.current) return;
        setItems(res.items || []);
      } catch (err) {
        if (reqId !== reqRef.current) return;
        setError(err?.message || 'Ошибка поиска');
        setItems([]);
      } finally {
        if (reqId === reqRef.current) setLoading(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(t);
  }, [query]);

  const trimmed = (query || '').trim();
  if (trimmed.length < 2) return null;

  return (
    <div className="search-dropdown" role="listbox">
      {loading && (
        <div className="search-dropdown-state">
          <span className="search-dropdown-spinner" />
          Ищем «{trimmed}»…
        </div>
      )}

      {!loading && error && (
        <div className="search-dropdown-state search-dropdown-state-error">
          {error}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <div className="search-dropdown-state">
          По запросу «{trimmed}» ничего не найдено
        </div>
      )}

      {!loading && items.length > 0 && (
        <>
          <div className="search-dropdown-results">
            {items.map(p => (
              <Link
                key={p.id}
                to={`/product/${p.id}`}
                className="search-dropdown-item"
                onClick={onSelect}
              >
                <div className="search-dropdown-thumb">
                  <ProductImage
                    src={p.imageUrl}
                    alt={p.name}
                    category={p.category}
                    iconSize={32}
                    imgClassName="search-dropdown-thumb-img"
                  />
                </div>
                <div className="search-dropdown-info">
                  <div className="search-dropdown-name">{p.name}</div>
                  {p.shortDesc && (
                    <div className="search-dropdown-desc">{p.shortDesc}</div>
                  )}
                </div>
                <div className="search-dropdown-price">
                  {formatPrice(p.price)}
                </div>
              </Link>
            ))}
          </div>

          <Link
            to={`/catalog?q=${encodeURIComponent(trimmed)}`}
            className="search-dropdown-more"
            onClick={onSelect}
          >
            Показать все результаты
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
            </svg>
          </Link>
        </>
      )}
    </div>
  );
}

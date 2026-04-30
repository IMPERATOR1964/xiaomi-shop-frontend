import { useState } from 'react';

export default function CatalogFilter({
  options,
  filters,
  setFilters,
  priceMin,
  priceMax,
  priceRange,
  setPriceRange,
  onReset,
}) {
  const [expanded, setExpanded] = useState({});

  const toggleSection = (k) => setExpanded(s => ({ ...s, [k]: !s[k] }));

  const toggleValue = (key, value) => {
    setFilters(prev => {
      const next = { ...prev };
      const set = new Set(next[key] || []);
      if (set.has(value)) set.delete(value);
      else set.add(value);
      next[key] = set;
      return next;
    });
  };

  const isChecked = (key, value) => filters[key]?.has(value);
  const totalActive = Object.values(filters).reduce((s, x) => s + (x?.size || 0), 0)
    + (priceRange[0] > priceMin || priceRange[1] < priceMax ? 1 : 0);

  return (
    <aside className="catalog-filter">
      <div className="catalog-filter-head">
        <h3>Фильтр</h3>
        {totalActive > 0 && (
          <button className="catalog-filter-reset" onClick={onReset}>Сбросить</button>
        )}
      </div>

      {/* Цена */}
      <div className="catalog-filter-section">
        <h4 className="catalog-filter-title">Цена, ₽</h4>
        <div className="catalog-filter-price">
          <input
            type="number"
            value={priceRange[0]}
            min={priceMin}
            max={priceRange[1]}
            onChange={(e) => setPriceRange([Number(e.target.value) || 0, priceRange[1]])}
            placeholder={String(priceMin)}
          />
          <span>—</span>
          <input
            type="number"
            value={priceRange[1]}
            min={priceRange[0]}
            max={priceMax}
            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value) || priceMax])}
            placeholder={String(priceMax)}
          />
        </div>
      </div>

      {/* Атрибуты */}
      {options.map(({ key, label, values }) => {
        const isOpen = expanded[key] !== false; // по умолчанию открыто
        const showAll = expanded[`${key}__all`];
        const visibleValues = showAll ? values : values.slice(0, 6);
        return (
          <div className="catalog-filter-section" key={key}>
            <button
              type="button"
              className="catalog-filter-toggle"
              onClick={() => toggleSection(key)}
            >
              <span>{label}</span>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}
              >
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>

            {isOpen && (
              <div className="catalog-filter-list">
                {visibleValues.map(v => (
                  <label key={v} className="catalog-filter-option">
                    <input
                      type="checkbox"
                      checked={!!isChecked(key, v)}
                      onChange={() => toggleValue(key, v)}
                    />
                    <span>{v}</span>
                  </label>
                ))}
                {values.length > 6 && (
                  <button
                    type="button"
                    className="catalog-filter-more"
                    onClick={() => toggleSection(`${key}__all`)}
                  >
                    {showAll ? 'Свернуть' : `Показать все (${values.length})`}
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </aside>
  );
}

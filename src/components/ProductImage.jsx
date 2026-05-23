// Универсальный компонент для отрисовки фото товара.
// Если imageUrl нет ИЛИ картинка не загрузилась — показывает CategoryIcon.
// Это решает проблему «битый src → огромный alt-текст по centro контейнера».

import { useState, useEffect } from 'react';
import CategoryIcon from './CategoryIcon';

export default function ProductImage({
  src,
  alt = '',
  category = 'all',
  iconSize = 56,
  className,
  imgClassName,
}) {
  const [failed, setFailed] = useState(false);

  // При смене src — пробуем заново.
  useEffect(() => { setFailed(false); }, [src]);

  if (!src || failed) {
    return (
      <span className={className} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        <CategoryIcon category={category} size={iconSize} />
      </span>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={imgClassName}
      onError={() => setFailed(true)}
    />
  );
}

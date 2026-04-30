import { useState } from 'react';

export default function ShareButton({ product }) {
  const [shared, setShared] = useState(false);

  const onClick = async () => {
    const url = window.location.href;
    const data = {
      title: product.name,
      text: `${product.name} — ${product.shortDesc || ''}`,
      url,
    };

    try {
      if (navigator.share) {
        await navigator.share(data);
        return;
      }
    } catch (e) {
      // пользователь отменил — игнорируем
      if (e?.name === 'AbortError') return;
    }

    try {
      await navigator.clipboard.writeText(url);
      setShared(true);
      setTimeout(() => setShared(false), 1800);
    } catch {
      prompt('Скопируйте ссылку:', url);
    }
  };

  return (
    <button
      type="button"
      className="product-share-btn"
      onClick={onClick}
      title="Поделиться"
    >
      {shared ? (
        <>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M20 6 9 17l-5-5"/>
          </svg>
          <span>Скопировано</span>
        </>
      ) : (
        <>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3"/>
            <circle cx="6" cy="12" r="3"/>
            <circle cx="18" cy="19" r="3"/>
            <line x1="8.6" y1="13.5" x2="15.4" y2="17.5"/>
            <line x1="15.4" y1="6.5" x2="8.6" y2="10.5"/>
          </svg>
          <span>Поделиться</span>
        </>
      )}
    </button>
  );
}

// Тихое уведомление о технических cookies/session storage.
// Одна тонкая плашка снизу, без оверлея и без блокировки контента.
// После «Понятно» — больше не показывается.

import { useEffect, useState } from 'react';
import '../styles/cookie-notice.css';

const KEY = 'voltix-cookie-notice-dismissed';

export default function CookieNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(KEY)) {
      // Небольшая задержка, чтобы не мигало вместе с первым рендером.
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(KEY, '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="cookie-notice" role="status">
      <p className="cookie-notice-text">
        Сайт использует технические cookies и session storage — они нужны для авторизации,
        сохранения сессии, работы корзины и корректной работы интерфейса.
        Рекламные cookies и сервисы аналитики не применяются.
      </p>
      <button type="button" className="cookie-notice-btn" onClick={dismiss}>
        Понятно
      </button>
    </div>
  );
}

// Тосты-уведомления.
// Использование:
//   const { toast } = useToast();
//   toast.success('Товар добавлен в корзину');
//   toast.error('Не удалось войти');
//   toast.info('Ссылка скопирована', { duration: 1800 });

import { createContext, useCallback, useContext, useRef, useState } from 'react';

const ToastContext = createContext();

let nextId = 0;

export function ToastProvider({ children }) {
  const [items, setItems] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setItems(list => list.filter(t => t.id !== id));
    const t = timers.current.get(id);
    if (t) { clearTimeout(t); timers.current.delete(id); }
  }, []);

  const push = useCallback((type, text, opts = {}) => {
    const id = ++nextId;
    const duration = opts.duration ?? 2400;
    setItems(list => [...list, { id, type, text }]);
    const t = setTimeout(() => dismiss(id), duration);
    timers.current.set(id, t);
    return id;
  }, [dismiss]);

  const toast = {
    success: (text, opts) => push('success', text, opts),
    error:   (text, opts) => push('error',   text, opts),
    info:    (text, opts) => push('info',    text, opts),
    dismiss,
  };

  return (
    <ToastContext.Provider value={{ toast, items }}>
      {children}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

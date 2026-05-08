import { createContext, useContext, useState } from 'react';
import { useToast } from './ToastContext';

const CompareContext = createContext();
const MAX_COMPARE = 4;

export function CompareProvider({ children }) {
  const { toast } = useToast();
  const [ids, setIds] = useState(() => {
    try {
      const raw = localStorage.getItem('voltix-compare');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  const persist = (next) => {
    setIds(next);
    localStorage.setItem('voltix-compare', JSON.stringify(next));
  };

  const toggle = (id) => {
    if (ids.includes(id)) {
      persist(ids.filter(x => x !== id));
      toast?.info?.('Удалено из сравнения');
    } else {
      if (ids.length >= MAX_COMPARE) {
        toast?.error?.(`Максимум ${MAX_COMPARE} товара в сравнении`);
        return;
      }
      persist([...ids, id]);
      toast?.success?.('Добавлено в сравнение');
    }
  };

  const has = (id) => ids.includes(id);
  const remove = (id) => persist(ids.filter(x => x !== id));
  const clear = () => persist([]);

  return (
    <CompareContext.Provider value={{ ids, toggle, has, remove, clear, count: ids.length, max: MAX_COMPARE }}>
      {children}
    </CompareContext.Provider>
  );
}

export const useCompare = () => useContext(CompareContext);

import { createContext, useContext, useState } from 'react';

const CompareContext = createContext();
const MAX_COMPARE = 4;

export function CompareProvider({ children }) {
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
    } else {
      if (ids.length >= MAX_COMPARE) {
        alert(`Максимум ${MAX_COMPARE} товара в сравнении`);
        return;
      }
      persist([...ids, id]);
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

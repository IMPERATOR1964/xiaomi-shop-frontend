import { createContext, useContext, useState } from 'react';

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [ids, setIds] = useState(() => {
    try {
      const raw = localStorage.getItem('voltix-favorites');
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });

  const persist = (next) => {
    setIds(next);
    localStorage.setItem('voltix-favorites', JSON.stringify(next));
  };

  const toggle = (id) => {
    if (ids.includes(id)) persist(ids.filter(x => x !== id));
    else persist([...ids, id]);
  };

  const has = (id) => ids.includes(id);
  const clear = () => persist([]);

  return (
    <FavoritesContext.Provider value={{ ids, toggle, has, clear, count: ids.length }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => useContext(FavoritesContext);

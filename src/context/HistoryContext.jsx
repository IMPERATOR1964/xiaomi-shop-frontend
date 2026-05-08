// Локальная история просмотра товаров.
// Хранит до MAX последних id, последний просмотренный — первый в массиве.

import { createContext, useCallback, useContext, useState } from 'react';

const HistoryContext = createContext();
const STORAGE_KEY = 'voltix-history';
const MAX = 15;

const read = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
};
const write = (ids) => localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));

export function HistoryProvider({ children }) {
  const [ids, setIds] = useState(read);

  const track = useCallback((productId) => {
    if (productId == null) return;
    setIds(prev => {
      const next = [productId, ...prev.filter(x => x !== productId)].slice(0, MAX);
      write(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    write([]);
    setIds([]);
  }, []);

  return (
    <HistoryContext.Provider value={{ ids, track, clear }}>
      {children}
    </HistoryContext.Provider>
  );
}

export const useHistory = () => useContext(HistoryContext);

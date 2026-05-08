// Гибридное избранное:
//  - Гость       → localStorage (id товаров)
//  - Авторизован → /api/wishlist
// При логине гостевые id переносятся на сервер.

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { wishlistApi, ApiError } from '../api';

const FavoritesContext = createContext();
const STORAGE_KEY = 'voltix-favorites';

const readLocal = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
};
const writeLocal = (ids) => localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));

export function FavoritesProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [ids, setIds] = useState(readLocal);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;

    const syncFromServer = async () => {
      setLoading(true);
      try {
        const local = readLocal();
        if (local.length) {
          await Promise.allSettled(local.map(id => wishlistApi.add(id)));
          writeLocal([]);
        }
        const res = await wishlistApi.list({ size: 200 });
        if (!alive) return;
        setIds(res.items.map(p => p.id));
      } catch {
        // оставляем локальный список
      } finally {
        if (alive) setLoading(false);
      }
    };

    if (isAuthenticated) syncFromServer();
    else                 setIds(readLocal());

    return () => { alive = false; };
  }, [isAuthenticated]);

  const persist = useCallback((next) => {
    setIds(next);
    if (!isAuthenticated) writeLocal(next);
  }, [isAuthenticated]);

  const toggle = useCallback(async (id) => {
    const has = ids.includes(id);
    const next = has ? ids.filter(x => x !== id) : [...ids, id];
    persist(next);
    if (has) toast?.info?.('Удалено из избранного');
    else     toast?.success?.('Добавлено в избранное');

    if (!isAuthenticated) return;

    try {
      if (has) await wishlistApi.remove(id);
      else     await wishlistApi.add(id);
    } catch (err) {
      persist(ids);
      if (!(err instanceof ApiError && err.status === 409)) {
        console.error('wishlist error', err);
        toast?.error?.('Не удалось обновить избранное');
      }
    }
  }, [ids, isAuthenticated, persist, toast]);

  const has = useCallback((id) => ids.includes(id), [ids]);

  const clear = useCallback(async () => {
    const oldIds = ids;
    persist([]);
    if (isAuthenticated) {
      try { await Promise.allSettled(oldIds.map(id => wishlistApi.remove(id))); } catch {}
    }
  }, [ids, isAuthenticated, persist]);

  return (
    <FavoritesContext.Provider value={{
      ids, toggle, has, clear,
      count: ids.length,
      loading,
    }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => useContext(FavoritesContext);

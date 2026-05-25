// Корзина: гость → localStorage, авторизованный → /api/cart через cartApi.
//
// Главная защита от «корзина возвращается после F5»:
//   merge гостевой корзины на сервер выполняется ТОЛЬКО при свежем login
//   (переход isAuthenticated: false → true в этой же сессии React).
//   При F5 / открытии новой вкладки с уже валидным JWT — merge НЕ запускается,
//   localStorage не читается и не «воскрешает» удалённые позиции.

import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { cartApi, productsApi, ApiError } from '../api';

const CartContext = createContext();
const STORAGE_KEY = 'voltix-cart';

const readLocal = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
};
const writeLocal = (items) => localStorage.setItem(STORAGE_KEY, JSON.stringify(items));

export function CartProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Если на момент монтажа уже залогинены — стартуем с пустой корзины
  // (НЕ читаем localStorage). Серверная корзина подтянется через fetchServer.
  const [cart, setCart]   = useState(() => (isAuthenticated ? [] : readLocal()));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [removingIds, setRemovingIds] = useState(new Set()); // для индикации удаления конкретного товара

  // Кэш загруженных фото и категорий товара (бэк cart-item-response их не возвращает).
  const productCache = useRef(new Map());

  // Догружаем недостающие фото/категории для items.
  const enrichItems = useCallback(async (items) => {
    if (!items?.length) return items;
    const out = [...items];
    for (let i = 0; i < out.length; i++) {
      const it = out[i];
      if (it.imageUrl || it.category !== 'all') continue;
      const cached = productCache.current.get(it.id);
      if (cached) {
        out[i] = { ...it, imageUrl: cached.imageUrl, category: cached.category };
        continue;
      }
      try {
        const p = await productsApi.byId(it.id);
        if (p) {
          productCache.current.set(it.id, { imageUrl: p.imageUrl, category: p.category });
          out[i] = { ...it, imageUrl: p.imageUrl, category: p.category };
        }
      } catch { /* пропускаем */ }
    }
    return out;
  }, []);

  // Обёртка над setCart — параллельно догружает фото.
  const setCartEnriched = useCallback((items) => {
    setCart(items);
    enrichItems(items).then(enriched => setCart(enriched));
  }, [enrichItems]);

  // Отслеживаем предыдущее состояние isAuthenticated.
  // Свежим логином считаем переход false → true внутри одной сессии React.
  // При первом монтаже компоненты prevAuthRef = isAuthenticated, поэтому
  // wasJustLoggedIn = false — никакого merge при F5.
  const prevAuthRef = useRef(isAuthenticated);

  useEffect(() => {
    let alive = true;
    const wasJustLoggedIn = !prevAuthRef.current && isAuthenticated;
    prevAuthRef.current = isAuthenticated;

    if (!isAuthenticated) {
      // Гость: показываем гостевую корзину из localStorage.
      setCart(readLocal());
      return;
    }

    // Авторизованный
    const fetchServer = async () => {
      setLoading(true);
      try {
        // Merge — ТОЛЬКО при свежем login и только если в localStorage реально есть items.
        if (wasJustLoggedIn) {
          const local = readLocal();
          if (local.length) {
            for (const it of local) {
              try { await cartApi.addItem(it.id, it.qty); } catch {}
            }
          }
        }
        // Гарантия: гостевой корзины больше быть не должно. Чистим
        // localStorage всегда — чтобы при F5 или открытии новой вкладки
        // не было соблазна перенести «старые» items на сервер.
        writeLocal([]);

        const server = await cartApi.get();
        if (!alive) return;
        setCartEnriched(server.items);
      } catch (err) {
        if (alive) setError(err?.message || null);
      } finally {
        if (alive) setLoading(false);
      }
    };
    fetchServer();

    return () => { alive = false; };
  }, [isAuthenticated]);

  // Запись гостевой корзины в localStorage. Только для гостя.
  useEffect(() => {
    if (!isAuthenticated) writeLocal(cart);
  }, [cart, isAuthenticated]);

  const removeFromCart = useCallback(async (id) => {
    if (!isAuthenticated) {
      setCart(prev => prev.filter(item => item.id !== id));
      toast?.info?.('Товар удалён из корзины');
      return;
    }
    setRemovingIds(prev => new Set(prev).add(id));
    try {
      const res = await cartApi.removeItem(id);
      setCartEnriched(res.items);
      toast?.info?.('Товар удалён из корзины');
    } catch (err) {
      const msg = err?.message || 'Не удалось удалить';
      setError(msg);
      toast?.error?.(msg);
    } finally {
      setRemovingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, [isAuthenticated, toast, setCartEnriched]);

  const addToCart = useCallback(async (product, qty = 1) => {
    setError(null);
    if (!isAuthenticated) {
      setCart(prev => {
        const existing = prev.find(item => item.id === product.id);
        if (existing) return prev.map(item =>
          item.id === product.id ? { ...item, qty: item.qty + qty } : item
        );
        return [...prev, {
          id:        product.id,
          name:      product.name,
          price:     product.price,
          qty,
          image:     product.image,
          imageUrl:  product.imageUrl,
          sku:       product.sku,
          shortDesc: product.shortDesc,
        }];
      });
      toast?.success?.('Товар добавлен в корзину');
      return;
    }
    try {
      const res = await cartApi.addItem(product.id, qty);
      setCartEnriched(res.items);
      toast?.success?.('Товар добавлен в корзину');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        toast?.error?.(err.message);
      }
      throw err;
    }
  }, [isAuthenticated, toast]);

  const updateQty = useCallback(async (id, qty) => {
    if (qty <= 0) return removeFromCart(id);

    if (!isAuthenticated) {
      setCart(prev => prev.map(item => item.id === id ? { ...item, qty } : item));
      return;
    }
    try {
      const res = await cartApi.setQty(id, qty);
      setCartEnriched(res.items);
    } catch (err) {
      const msg = err?.message || 'Не удалось изменить количество';
      setError(msg);
      toast?.error?.(msg);
    }
  }, [isAuthenticated, removeFromCart, toast, setCartEnriched]);

  const clearCart = useCallback(async () => {
    setCart([]);
    writeLocal([]); // даже для авторизованного — чтобы F5 не «воскресил»
    if (isAuthenticated) {
      try {
        await cartApi.clear();
        toast?.success?.('Корзина очищена');
      } catch (err) {
        // если сервер не очистил — подтягиваем серверное состояние, чтобы не было ложного UI
        try {
          const server = await cartApi.get();
          setCartEnriched(server.items);
        } catch {}
        const msg = err?.message || 'Не удалось очистить корзину';
        setError(msg);
        toast?.error?.(msg);
      }
    }
  }, [isAuthenticated, toast, setCartEnriched]);

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQty, clearCart,
      cartCount, cartTotal, loading, error,
      isRemoving: (id) => removingIds.has(id),
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);

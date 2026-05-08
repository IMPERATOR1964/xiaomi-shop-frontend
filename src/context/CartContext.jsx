// Гибридная корзина:
//  - Гость        → localStorage
//  - Авторизован  → /api/cart через cartApi
// При логине гостевая корзина переносится на сервер.

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { cartApi, ApiError } from '../api';

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
  const [cart, setCart]   = useState(readLocal);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let alive = true;

    const fetchServer = async () => {
      setLoading(true);
      try {
        const local = readLocal();
        if (local.length) {
          for (const it of local) {
            try { await cartApi.addItem(it.id, it.qty); } catch {}
          }
          writeLocal([]);
        }
        const server = await cartApi.get();
        if (!alive) return;
        setCart(server.items);
      } catch (err) {
        if (alive) setError(err?.message || null);
      } finally {
        if (alive) setLoading(false);
      }
    };

    if (isAuthenticated) fetchServer();
    else                 setCart(readLocal());

    return () => { alive = false; };
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) writeLocal(cart);
  }, [cart, isAuthenticated]);

  const removeFromCart = useCallback(async (id) => {
    if (!isAuthenticated) {
      setCart(prev => prev.filter(item => item.id !== id));
      return;
    }
    try {
      const res = await cartApi.removeItem(id);
      setCart(res.items);
    } catch (err) {
      setError(err?.message || 'Не удалось удалить');
    }
  }, [isAuthenticated]);

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
      setCart(res.items);
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
      setCart(res.items);
    } catch (err) {
      setError(err?.message || 'Не удалось изменить количество');
    }
  }, [isAuthenticated, removeFromCart]);

  const clearCart = useCallback(async () => {
    setCart([]);
    if (isAuthenticated) {
      try { await cartApi.clear(); } catch {}
    }
  }, [isAuthenticated]);

  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <CartContext.Provider value={{
      cart, addToCart, removeFromCart, updateQty, clearCart,
      cartCount, cartTotal, loading, error,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);

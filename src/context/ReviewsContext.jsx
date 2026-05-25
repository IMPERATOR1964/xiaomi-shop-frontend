// Отзывы через бэк-API. Кэшируем в памяти контекста по productId.

import { createContext, useContext, useState, useCallback } from 'react';
import { reviewsApi } from '../api';

const ReviewsContext = createContext();

export function ReviewsProvider({ children }) {
  const [byProduct, setByProduct] = useState({}); // { [productId]: { items, total, avg } }

  const setEntry = (productId, patch) => {
    setByProduct(prev => ({
      ...prev,
      [productId]: { ...(prev[productId] || {}), ...patch },
    }));
  };

  const loadReviews = useCallback(async (productId) => {
    const res = await reviewsApi.forProduct(productId, { size: 50 });
    const summary = await reviewsApi.summary(productId).catch(() => null);
    setEntry(productId, {
      items: res.items,
      total: res.total,
      avg:   summary?.averageRating ?? (res.items.reduce((s, r) => s + r.rating, 0) / (res.items.length || 1)),
    });
    return res.items;
  }, []);

  const addReview = useCallback(async (productId, { rating, title, comment, photos }) => {
    const created = await reviewsApi.create(productId, { rating, title, comment, photos });
    setByProduct(prev => {
      const cur = prev[productId] || { items: [], total: 0, avg: 0 };
      const items = [created, ...cur.items];
      return {
        ...prev,
        [productId]: {
          items,
          total: cur.total + 1,
          avg:   items.reduce((s, r) => s + r.rating, 0) / items.length,
        },
      };
    });
    return created;
  }, []);

  const updateReview = useCallback(async (productId, reviewId, { rating, title, comment, photos }) => {
    const updated = await reviewsApi.update(reviewId, { rating, title, comment, photos });
    setByProduct(prev => {
      const cur = prev[productId];
      if (!cur) return prev;
      const items = cur.items.map(r => r.id === reviewId ? updated : r);
      return {
        ...prev,
        [productId]: {
          items,
          total: cur.total,
          avg:   items.reduce((s, r) => s + r.rating, 0) / (items.length || 1),
        },
      };
    });
    return updated;
  }, []);

  const removeReview = useCallback(async (productId, reviewId) => {
    await reviewsApi.remove(reviewId);
    setByProduct(prev => {
      const cur = prev[productId];
      if (!cur) return prev;
      const items = cur.items.filter(r => r.id !== reviewId);
      return {
        ...prev,
        [productId]: {
          items,
          total: Math.max(0, cur.total - 1),
          avg:   items.length ? items.reduce((s, r) => s + r.rating, 0) / items.length : 0,
        },
      };
    });
  }, []);

  const getReviews       = useCallback((id) => byProduct[id]?.items || [], [byProduct]);
  const getAverageRating = useCallback((id) => byProduct[id]?.avg || 0, [byProduct]);
  const getReviewsCount  = useCallback((id) => byProduct[id]?.total ?? (byProduct[id]?.items?.length || 0), [byProduct]);

  return (
    <ReviewsContext.Provider value={{
      loadReviews,
      addReview,
      updateReview,
      removeReview,
      getReviews,
      getAverageRating,
      getReviewsCount,
    }}>
      {children}
    </ReviewsContext.Provider>
  );
}

export const useReviews = () => useContext(ReviewsContext);

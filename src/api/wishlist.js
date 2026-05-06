// Контракты бэка (см. WishlistController.java):
//   GET    /api/wishlist                       → Page<WishlistResponse>
//   POST   /api/wishlist/{productId}           → 201 WishlistResponse
//   DELETE /api/wishlist/{productId}           → 204
//   GET    /api/wishlist/{productId}/exists    → { inWishlist: boolean }
//   GET    /api/wishlist/count                 → { count: number }

import { get, post, del } from './client';
import { adaptProduct } from './adapters';

const pageParams = ({ page = 0, size = 100 } = {}) => ({ page, size });

export const wishlistApi = {
  list: async (opts = {}) => {
    const data = await get('/wishlist', { params: pageParams(opts) });
    const items = (data?.content || []).map(w => adaptProduct(w.product || w));
    return {
      items,
      total: data?.totalElements ?? items.length,
      page:  data?.number ?? 0,
      size:  data?.size ?? items.length,
      pages: data?.totalPages ?? 1,
    };
  },

  add:    (productId) => post(`/wishlist/${productId}`),
  remove: (productId) => del(`/wishlist/${productId}`),
  exists: (productId) => get(`/wishlist/${productId}/exists`),
  count:  ()          => get('/wishlist/count'),
};

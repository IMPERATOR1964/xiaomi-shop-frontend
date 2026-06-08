// Контракты бэка (см. WishlistController.java):
//   GET    /api/wishlist                       → Page<WishlistResponse>
//   POST   /api/wishlist/{productId}           → 201 WishlistResponse
//   DELETE /api/wishlist/{productId}           → 204
//   GET    /api/wishlist/{productId}/exists    → { inWishlist: boolean }
//   GET    /api/wishlist/count                 → { count: number }
//
// ВАЖНО: бэк отдаёт ПЛОСКИЙ WishlistResponse:
//   { id, productId, productName, productSku, productPrice, addedAt }
// (нет вложенного product и нет imageUrl/категории). Поэтому для страницы
// «Избранное» подгружаем полный товар по productId — иначе у карточки нет
// цены/фото и формат цены падает.

import { get, post, del } from './client';
import { productsApi } from './products';

const pageParams = ({ page = 0, size = 100 } = {}) => ({ page, size });

// id товара из плоского ответа (с запасом на случай вложенного product).
const pickProductId = (w) => w?.productId ?? w?.product?.id ?? w?.id;

export const wishlistApi = {
  // Полные товары (с фото/категорией/наличием) — для страницы «Избранное».
  list: async (opts = {}) => {
    const data = await get('/wishlist', { params: pageParams(opts) });
    const rows = data?.content || [];
    const items = (await Promise.all(
      rows.map(w => productsApi.byId(pickProductId(w)).catch(() => null))
    )).filter(Boolean);
    return {
      items,
      total: data?.totalElements ?? items.length,
      page:  data?.number ?? 0,
      size:  data?.size ?? items.length,
      pages: data?.totalPages ?? 1,
    };
  },

  // Только id товаров — дёшево, без подгрузки карточек (для контекста: подсветка «сердечек»).
  listIds: async (opts = {}) => {
    const data = await get('/wishlist', { params: pageParams({ size: 200, ...opts }) });
    return (data?.content || []).map(pickProductId).filter(v => v != null);
  },

  add:    (productId) => post(`/wishlist/${productId}`),
  remove: (productId) => del(`/wishlist/${productId}`),
  exists: (productId) => get(`/wishlist/${productId}/exists`),
  count:  ()          => get('/wishlist/count'),
};

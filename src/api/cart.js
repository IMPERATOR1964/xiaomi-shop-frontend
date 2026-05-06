// Контракты бэка (см. CartController.java):
//   GET    /api/cart                                  → CartResponse
//   POST   /api/cart/items   { productId, quantity }  → CartResponse
//   PUT    /api/cart/items/{productId}?quantity=N     → CartResponse
//   DELETE /api/cart/items/{productId}                → CartResponse
//   DELETE /api/cart                                  → 204

import { get, post, put, del } from './client';
import { adaptCart } from './adapters';

export const cartApi = {
  get: async () => adaptCart(await get('/cart')),

  addItem: async (productId, quantity = 1) =>
    adaptCart(await post('/cart/items', { productId, quantity })),

  setQty: async (productId, quantity) =>
    adaptCart(await put(`/cart/items/${productId}`, undefined, { params: { quantity } })),

  removeItem: async (productId) =>
    adaptCart(await del(`/cart/items/${productId}`)),

  clear: () => del('/cart'),
};

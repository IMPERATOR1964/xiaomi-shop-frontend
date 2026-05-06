// Контракты бэка (см. OrderController.java):
//   POST   /api/orders/checkout              { deliveryAddress, contactPhone, customerNotes }  → OrderResponse
//   GET    /api/orders                                                                          → Page<OrderResponse>
//   GET    /api/orders/{id}                                                                     → OrderResponse
//   POST   /api/orders/{id}/cancel                                                               → OrderResponse
//   GET    /api/orders/admin?status=                                                             → Page<OrderResponse> (ADMIN)
//   PATCH  /api/orders/{id}/status   { status }                                                  → OrderResponse (ADMIN)

import { get, post, patch } from './client';
import { adaptOrder } from './adapters';

const pageParams = ({ page = 0, size = 20, sort } = {}) => {
  const p = { page, size };
  if (sort) p.sort = sort;
  return p;
};

const adaptPage = (data) => ({
  items:  (data?.content || []).map(adaptOrder),
  total:  data?.totalElements ?? 0,
  page:   data?.number ?? 0,
  size:   data?.size ?? 0,
  pages:  data?.totalPages ?? 0,
});

export const ordersApi = {
  checkout: async ({ deliveryAddress, contactPhone, customerNotes }) =>
    adaptOrder(await post('/orders/checkout', { deliveryAddress, contactPhone, customerNotes })),

  list: async (opts = {}) =>
    adaptPage(await get('/orders', { params: pageParams({ sort: 'createdAt,desc', ...opts }) })),

  byId: async (id) => adaptOrder(await get(`/orders/${id}`)),

  cancel: async (id) => adaptOrder(await post(`/orders/${id}/cancel`)),

  // ADMIN
  adminList: async ({ status, ...opts } = {}) =>
    adaptPage(await get('/orders/admin', { params: { status, ...pageParams(opts) } })),

  updateStatus: async (id, status) =>
    adaptOrder(await patch(`/orders/${id}/status`, { status })),
};

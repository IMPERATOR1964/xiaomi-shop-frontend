// Контракты бэка (см. ReviewController.java):
//   GET    /api/products/{productId}/reviews                                  → Page<ReviewResponse>
//   GET    /api/products/{productId}/reviews/summary                          → ReviewSummaryResponse
//   POST   /api/products/{productId}/reviews   { rating, title?, comment? }   → 201 ReviewResponse
//   PUT    /api/reviews/{reviewId}             { rating, title?, comment? }   → ReviewResponse
//   DELETE /api/reviews/{reviewId}                                            → 204
//   GET    /api/reviews/me                                                    → Page<ReviewResponse>

import { get, post, put, del } from './client';
import { adaptReview } from './adapters';

const pageParams = ({ page = 0, size = 20 } = {}) => ({ page, size });

export const reviewsApi = {
  forProduct: async (productId, opts = {}) => {
    const data = await get(`/products/${productId}/reviews`, { params: pageParams(opts), auth: false });
    return {
      items:  (data?.content || []).map(adaptReview),
      total:  data?.totalElements ?? 0,
      page:   data?.number ?? 0,
      size:   data?.size ?? 0,
      pages:  data?.totalPages ?? 0,
    };
  },

  summary: async (productId) =>
    get(`/products/${productId}/reviews/summary`, { auth: false }),

  create: async (productId, { rating, title, comment }) =>
    adaptReview(await post(`/products/${productId}/reviews`, { rating, title, comment })),

  update: async (reviewId, { rating, title, comment }) =>
    adaptReview(await put(`/reviews/${reviewId}`, { rating, title, comment })),

  remove: (reviewId) => del(`/reviews/${reviewId}`),

  mine: async (opts = {}) => {
    const data = await get('/reviews/me', { params: pageParams(opts) });
    return {
      items: (data?.content || []).map(adaptReview),
      total: data?.totalElements ?? 0,
    };
  },
};

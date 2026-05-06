// Контракты бэка (см. ProductController.java):
//   GET    /api/products                       → Page<ProductResponse>
//   GET    /api/products/{id}                  → ProductResponse
//   GET    /api/products/sku/{sku}             → ProductResponse
//   POST   /api/products                       → 201 ProductResponse  (ADMIN/MOD)
//   PUT    /api/products/{id}                  → ProductResponse      (ADMIN/MOD)
//   DELETE /api/products/{id}                  → 204                  (ADMIN/MOD soft delete)
//   POST   /api/products/{id}/restore          → ProductResponse      (ADMIN/MOD)
//   POST   /api/products/filter (+ Pageable)   → Page<ProductResponse>
//   GET    /api/products/search?q=             → Page<ProductResponse>
//   GET    /api/products/{id}/similar?limit=   → List<ProductResponse>
//   GET    /api/products/{id}/variants         → ProductVariantsResponse
//   GET    /api/products/compare?ids=1,2,3     → ComparisonResponse
//   GET    /api/products/filter-options?categoryId=  → FilterOptionsResponse
//   GET    /api/products/{id}/share            → ShareResponse
//   POST   /api/products/cache/clear           → 204 (ADMIN)

import { get, post, put, del } from './client';
import { adaptProduct, adaptProductList } from './adapters';

const pageParams = ({ page = 0, size = 20, sort } = {}) => {
  const p = { page, size };
  if (sort) p.sort = sort;
  return p;
};

export const productsApi = {
  list: async (opts = {}) => {
    const data = await get('/products', { params: pageParams(opts), auth: false });
    return adaptProductList(data);
  },

  byId: async (id) => {
    const data = await get(`/products/${id}`, { auth: false });
    return adaptProduct(data);
  },

  bySku: async (sku) => {
    const data = await get(`/products/sku/${sku}`, { auth: false });
    return adaptProduct(data);
  },

  // filterRequest: {
  //   categoryId, minPrice, maxPrice, query, inStockOnly,
  //   stringFilters: { 'Цвет': 'Чёрный' },
  //   multiValueFilters: { 'ОЗУ': ['12 ГБ','16 ГБ'] },
  //   numericFilters: {}, numericRangeFilters: { 'Ёмкость': { min, max } },
  //   sortBy: 'price_asc'|'price_desc'|'newest'|'popular'|'rating'
  // }
  filter: async (filterRequest = {}, opts = {}) => {
    const data = await post('/products/filter', filterRequest, {
      params: pageParams(opts),
      auth: false,
    });
    return adaptProductList(data);
  },

  search: async (query, opts = {}) => {
    const data = await get('/products/search', {
      params: { q: query, ...pageParams(opts) },
      auth: false,
    });
    return adaptProductList(data);
  },

  similar: async (id, limit = 8) => {
    const data = await get(`/products/${id}/similar`, { params: { limit }, auth: false });
    return (data || []).map(adaptProduct);
  },

  variants: async (id) => get(`/products/${id}/variants`, { auth: false }),

  compare: async (ids) =>
    get('/products/compare', { params: { ids: ids.join(',') }, auth: false }),

  filterOptions: async (categoryId) =>
    get('/products/filter-options', { params: { categoryId }, auth: false }),

  share: async (id) => get(`/products/${id}/share`, { auth: false }),

  // ===== ADMIN / MODERATOR =====
  create: async (body) => adaptProduct(await post('/products', body)),
  update: async (id, body) => adaptProduct(await put(`/products/${id}`, body)),
  softDelete: (id) => del(`/products/${id}`),
  restore: async (id) => adaptProduct(await post(`/products/${id}/restore`)),
  clearCache: () => post('/products/cache/clear'),
};

// Контракты бэка (см. CategoryController.java):
//   GET  /api/categories          → List<CategoryResponse>
//   GET  /api/categories/{id}     → CategoryResponse

import { get } from './client';
import { adaptCategory } from './adapters';

export const categoriesApi = {
  list: async () => {
    const data = await get('/categories', { auth: false });
    return (data || []).map(adaptCategory);
  },

  byId: async (id) => adaptCategory(await get(`/categories/${id}`, { auth: false })),
};

// Админ-эндпоинты бэка v4:
//   POST   /api/admin/products/{id}/image  (multipart/form-data, поле 'file')  → ProductResponse
//   DELETE /api/admin/products/{id}/image                                       → ProductResponse
//   GET    /api/admin/stats/dashboard                                           → AdminDashboardResponse
//   POST   /api/admin/categories            { name, description? }             → CategoryResponse
//   PUT    /api/admin/categories/{id}       { name, description? }             → CategoryResponse
//   DELETE /api/admin/categories/{id}                                           → 204

import { request, get, post, put, del, API_URL, tokenStore } from './client';
import { adaptProduct, adaptCategory } from './adapters';

// Multipart upload — fetch напрямую, чтобы не сериализовать FormData в JSON.
// files: один файл или массив. fieldName: имя поля multipart ('file' или 'files').
export async function uploadFile(path, files, fieldName = 'file') {
  const fd = new FormData();
  if (Array.isArray(files)) {
    for (const f of files) fd.append(fieldName, f);
  } else {
    fd.append(fieldName, files);
  }

  const headers = {};
  const t = tokenStore.get();
  if (t) headers.Authorization = `Bearer ${t}`;
  // Content-Type не ставим — браузер сам поставит multipart с boundary.

  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers,
    body: fd,
  });

  let data = null;
  const ctype = res.headers.get('content-type') || '';
  if (ctype.includes('application/json')) data = await res.json().catch(() => null);
  else                                     data = await res.text().catch(() => '');

  if (!res.ok) {
    const msg = (data && data.message) || (typeof data === 'string' ? data : `HTTP ${res.status}`);
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const adminApi = {
  // ===== Изображения товаров =====

  // Legacy: один файл, заменяет imageUrl и добавляет в галерею первой.
  uploadProductImage: async (productId, file) => {
    const data = await uploadFile(`/admin/products/${productId}/image`, file);
    return adaptProduct(data);
  },

  // Новое (бэк v6): пачка до 10 файлов в галерею.
  uploadProductImages: async (productId, files) => {
    const data = await uploadFile(`/admin/products/${productId}/images`, files, 'files');
    return adaptProduct(data);
  },

  // Удалить «главную» (первую) картинку и сбросить imageUrl.
  deleteProductImage: async (productId) => {
    const data = await request(`/admin/products/${productId}/image`, { method: 'DELETE' });
    return adaptProduct(data);
  },

  // Удалить одно фото из галереи по URL.
  deleteGalleryImage: async (productId, url) => {
    const data = await request(`/admin/products/${productId}/images`, {
      method: 'DELETE',
      params: { url },
    });
    return adaptProduct(data);
  },

  // Сменить порядок (первая = главная) — { urls: [...] }
  reorderGalleryImages: async (productId, urls) => {
    const data = await request(`/admin/products/${productId}/images/order`, {
      method: 'PUT',
      body: { urls },
    });
    return adaptProduct(data);
  },

  // ===== Сводка =====
  dashboard: () => get('/admin/stats/dashboard'),

  // ===== Категории =====
  categories: {
    create: async ({ name, description }) =>
      adaptCategory(await post('/admin/categories', { name, description })),

    update: async (id, { name, description }) =>
      adaptCategory(await put(`/admin/categories/${id}`, { name, description })),

    remove: (id) => del(`/admin/categories/${id}`),
  },
};

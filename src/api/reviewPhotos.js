// Загрузка фото к отзывам (ReviewPhotoController, v6).
//
//   POST /api/reviews/photos  (multipart, поле 'files', до 5 файлов)
//   → 200 { urls: [...] }
//
// Затем фронт подставляет эти URL в ReviewRequest.photos[].

import { uploadFile } from './admin';

export const reviewPhotosApi = {
  upload: async (files) => {
    const data = await uploadFile('/reviews/photos', files, 'files');
    return Array.isArray(data?.urls) ? data.urls : [];
  },
};

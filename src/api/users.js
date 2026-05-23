// Профиль текущего пользователя.
//
// Контракты бэка (UserMeController.java, v6):
//   POST   /api/users/me/avatar (multipart, поле 'file')  → 200 { avatarUrl }
//   DELETE /api/users/me/avatar                            → 204

import { request } from './client';
import { uploadFile } from './admin';

export const usersApi = {
  uploadAvatar: async (file) => {
    const data = await uploadFile('/users/me/avatar', file, 'file');
    return data?.avatarUrl || null;
  },

  removeAvatar: () => request('/users/me/avatar', { method: 'DELETE' }),
};

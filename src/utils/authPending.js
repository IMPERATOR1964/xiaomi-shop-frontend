// Запоминаем email пользователя, ожидающего подтверждения / сброса пароля.
// Нужно чтобы при обновлении страницы (например юзер закрыл вкладку и
// открыл ссылку из письма) email не потерялся — он нужен для POST-запроса.

const VERIFY_KEY = 'voltix-pending-verify-email';
const RESET_KEY  = 'voltix-pending-reset-email';

export const pendingVerify = {
  get:   () => localStorage.getItem(VERIFY_KEY) || '',
  set:   (email) => { if (email) localStorage.setItem(VERIFY_KEY, email); },
  clear: () => localStorage.removeItem(VERIFY_KEY),
};

export const pendingReset = {
  get:   () => localStorage.getItem(RESET_KEY) || '',
  set:   (email) => { if (email) localStorage.setItem(RESET_KEY, email); },
  clear: () => localStorage.removeItem(RESET_KEY),
};

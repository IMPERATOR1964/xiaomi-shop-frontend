// Низкоуровневый fetch-клиент Voltix.
// Автоматически добавляет JWT в заголовок Authorization,
// парсит JSON-ответы, бросает ApiError с понятным сообщением.

const TOKEN_KEY  = 'voltix-token';
const REFRESH_KEY = 'voltix-refresh-token';

export const API_URL = import.meta.env.VITE_API_URL || '/api';

// ============== Токены ==============
export const tokenStore = {
  get:        () => localStorage.getItem(TOKEN_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  set: (token, refreshToken) => {
    if (token)        localStorage.setItem(TOKEN_KEY, token);
    if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

// Декодер JWT (payload без проверки подписи — для UI-логики).
// Бэк кладёт в claim "auth" роли через запятую: "ROLE_USER,ROLE_ADMIN".
export function decodeJwt(token) {
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = payload + '='.repeat((4 - payload.length % 4) % 4);
    const json = decodeURIComponent(
      atob(padded)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// Возвращает массив ролей из текущего JWT: ['ROLE_USER', 'ROLE_ADMIN'].
export function getRolesFromToken(token) {
  const decoded = decodeJwt(token || tokenStore.get());
  if (!decoded?.auth) return [];
  return String(decoded.auth).split(',').map(s => s.trim()).filter(Boolean);
}

export const hasRole = (role) => getRolesFromToken().includes(role);
export const isAdmin     = () => hasRole('ROLE_ADMIN');
export const isModerator = () => hasRole('ROLE_MODERATOR');
export const isStaff     = () => isAdmin() || isModerator();

// ============== Ошибки ==============
export class ApiError extends Error {
  constructor(message, { status, data, path } = {}) {
    super(message);
    this.name   = 'ApiError';
    this.status = status;
    this.data   = data;
    this.path   = path;
  }
}

const friendlyMessage = (data, status) => {
  if (typeof data === 'string' && data.trim()) return data;
  if (data && typeof data === 'object') {
    if (data.message) return data.message;
    if (data.error)   return data.error;
  }
  if (status === 0)   return 'Не удалось связаться с сервером';
  if (status === 401) return 'Требуется вход в аккаунт';
  if (status === 403) return 'Доступ запрещён';
  if (status === 404) return 'Не найдено';
  if (status === 409) return 'Конфликт состояния';
  if (status >= 500)  return 'Ошибка сервера, попробуйте позже';
  return `Ошибка ${status}`;
};

// ============== request ==============
export async function request(path, { method = 'GET', body, params, headers, auth = true, raw = false } = {}) {
  let url = path.startsWith('http') ? path : `${API_URL}${path}`;
  if (params && Object.keys(params).length) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v == null) return;
      if (Array.isArray(v)) v.forEach(x => qs.append(k, String(x)));
      else qs.append(k, String(v));
    });
    const sep = url.includes('?') ? '&' : '?';
    url = `${url}${sep}${qs.toString()}`;
  }

  const finalHeaders = { Accept: 'application/json', ...(headers || {}) };
  if (body !== undefined && !(body instanceof FormData)) {
    finalHeaders['Content-Type'] = 'application/json';
  }
  if (auth) {
    const t = tokenStore.get();
    if (t) finalHeaders.Authorization = `Bearer ${t}`;
  }

  let res;
  try {
    res = await fetch(url, {
      method,
      headers: finalHeaders,
      body: body === undefined ? undefined : (body instanceof FormData ? body : JSON.stringify(body)),
    });
  } catch (e) {
    throw new ApiError('Не удалось связаться с сервером', { status: 0, path });
  }

  if (res.status === 204) return null;

  const ctype = res.headers.get('content-type') || '';
  let data;
  if (raw) {
    data = await res.blob();
  } else if (ctype.includes('application/json')) {
    data = await res.json().catch(() => null);
  } else {
    data = await res.text().catch(() => '');
  }

  if (!res.ok) {
    if (res.status === 401) tokenStore.clear();
    throw new ApiError(friendlyMessage(data, res.status), { status: res.status, data, path });
  }

  return data;
}

export const get    = (p, opts)        => request(p, { ...(opts||{}), method: 'GET' });
export const post   = (p, body, opts)  => request(p, { ...(opts||{}), method: 'POST', body });
export const put    = (p, body, opts)  => request(p, { ...(opts||{}), method: 'PUT', body });
export const patch  = (p, body, opts)  => request(p, { ...(opts||{}), method: 'PATCH', body });
export const del    = (p, opts)        => request(p, { ...(opts||{}), method: 'DELETE' });

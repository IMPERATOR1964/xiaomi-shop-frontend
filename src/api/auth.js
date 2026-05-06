// Контракты бэка (см. AuthController.java):
//   POST /api/auth/register             { username, email, password }     → 201 AuthResponse
//   POST /api/auth/login                { username, password }            → 200 AuthResponse
//   GET  /api/auth/verify-email?token=                                    → 200 EmailVerificationResponse
//   POST /api/auth/resend-verification?email=                             → 200 EmailVerificationResponse
//   POST /api/auth/forgot-password      { email }                         → 200 { message }
//   POST /api/auth/reset-password       { token, newPassword }            → 200 { message }
//
// AuthResponse: { token, refreshToken, username, email }

import { post, get, tokenStore } from './client';

export const authApi = {
  register: ({ username, email, password }) =>
    post('/auth/register', { username, email, password }, { auth: false }),

  login: async ({ username, password }) => {
    const res = await post('/auth/login', { username, password }, { auth: false });
    if (res?.token) tokenStore.set(res.token, res.refreshToken);
    return res;
  },

  logout: () => tokenStore.clear(),

  verifyEmail: (token) =>
    get('/auth/verify-email', { params: { token }, auth: false }),

  resendVerification: (email) =>
    post('/auth/resend-verification', undefined, { params: { email }, auth: false }),

  forgotPassword: (email) =>
    post('/auth/forgot-password', { email }, { auth: false }),

  resetPassword: ({ token, newPassword }) =>
    post('/auth/reset-password', { token, newPassword }, { auth: false }),
};

import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { authApi, tokenStore, getRolesFromToken } from '../api';

const AuthContext = createContext();
const USER_KEY = 'voltix-user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });

  // Роли из JWT: пересчитываются при каждом login/logout через token.
  const [tokenVer, setTokenVer] = useState(0);
  const roles = useMemo(() => getRolesFromToken(), [tokenVer]);
  const isAdmin     = roles.includes('ROLE_ADMIN');
  const isModerator = roles.includes('ROLE_MODERATOR');
  const isStaff     = isAdmin || isModerator;

  const persistUser = (u) => {
    if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
    else   localStorage.removeItem(USER_KEY);
    setUser(u);
  };

  const register = useCallback(async ({ username, email, password, name }) => {
    const res = await authApi.register({ username, email, password });
    const profile = {
      name:     name || res.username,
      username: res.username,
      email:    res.email,
    };
    persistUser(profile);
    setTokenVer(v => v + 1);
    return profile;
  }, []);

  const login = useCallback(async ({ username, password }) => {
    const res = await authApi.login({ username, password });
    const profile = {
      name:     res.username,
      username: res.username,
      email:    res.email,
    };
    persistUser(profile);
    setTokenVer(v => v + 1);
    return profile;
  }, []);

  const logout = useCallback(() => {
    authApi.logout();
    persistUser(null);
    setTokenVer(v => v + 1);
  }, []);

  const updateUser = useCallback((patch) => {
    setUser(prev => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      localStorage.setItem(USER_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const verifyEmail        = (token) => authApi.verifyEmail(token);
  const resendVerification = (email) => authApi.resendVerification(email);
  const forgotPassword     = (email) => authApi.forgotPassword(email);
  const resetPassword      = ({ token, newPassword }) => authApi.resetPassword({ token, newPassword });

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user && !!tokenStore.get(),
      roles,
      isAdmin,
      isModerator,
      isStaff,
      register,
      login,
      logout,
      updateUser,
      verifyEmail,
      resendVerification,
      forgotPassword,
      resetPassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

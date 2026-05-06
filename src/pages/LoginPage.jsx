import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api';
import '../styles/auth.css';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [needResend, setNeedResend] = useState(null);

  const { login, resendVerification } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setNeedResend(null);

    if (!username || !password) {
      setError('Заполните все поля');
      return;
    }

    setLoading(true);
    try {
      await login({ username: username.trim(), password });
      navigate('/profile');
    } catch (err) {
      if (err instanceof ApiError) {
        const msg = String(err.message || '').toLowerCase();
        if (msg.includes('email') && msg.includes('verif')) {
          setError('Email не подтверждён. Проверьте почту.');
          setNeedResend(username);
        } else if (err.status === 400 || err.status === 401) {
          setError('Неверный логин или пароль');
        } else {
          setError(err.message);
        }
      } else {
        setError('Не удалось войти. Попробуйте позже.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!needResend) return;
    try {
      await resendVerification(needResend);
      setError('Письмо отправлено повторно. Проверьте почту.');
      setNeedResend(null);
    } catch (err) {
      setError(err?.message || 'Не удалось повторно отправить письмо');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Вход</h1>
        <p className="auth-subtitle">Войдите в аккаунт Voltix</p>

        {error && <div className="auth-error">{error}</div>}
        {needResend && (
          <button type="button" className="auth-submit" style={{ marginBottom: 12 }} onClick={handleResend}>
            Отправить письмо повторно
          </button>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Логин</label>
            <input
              className="form-input"
              type="text"
              placeholder="Ваш логин"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Пароль</label>
            <input
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Входим…' : 'Войти'}
          </button>
        </form>

        <p className="auth-switch" style={{ marginTop: 12 }}>
          <Link to="/forgot-password">Забыли пароль?</Link>
        </p>
        <p className="auth-switch">
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
      </div>
    </div>
  );
}

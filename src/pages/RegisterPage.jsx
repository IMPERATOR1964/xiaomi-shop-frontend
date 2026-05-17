import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api';
import { pendingVerify } from '../utils/authPending';
import '../styles/auth.css';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!username || !email || !password || !password2) {
      setError('Заполните все поля');
      return;
    }
    if (username.length < 3 || username.length > 20) {
      setError('Логин должен быть от 3 до 20 символов');
      return;
    }
    if (password !== password2) {
      setError('Пароли не совпадают');
      return;
    }
    if (password.length < 8) {
      setError('Пароль должен содержать минимум 8 символов');
      return;
    }

    setLoading(true);
    try {
      const targetEmail = email.trim();
      const res = await register({ username: username.trim(), email: targetEmail, password });
      setSuccess('Аккаунт создан. Сейчас введёте 5-значный код из письма…');
      pendingVerify.set(targetEmail);
      setTimeout(() => navigate('/verify-email', {
        state: {
          email: targetEmail,
          // Дедлайны из AuthResponse — VerifyEmailPage запустит таймеры до удаления аккаунта
          // и до истечения кода (можно не ждать запрос verification-status).
          verificationRequiredUntil:   res?.verificationRequiredUntil,
          verificationCodeValidUntil:  res?.verificationCodeValidUntil,
        },
      }), 900);
    } catch (err) {
      if (err instanceof ApiError) {
        const msg = String(err.message || '').toLowerCase();
        if (msg.includes('username') || msg.includes('exist')) setError('Такой логин уже занят');
        else if (msg.includes('email')) setError('Этот email уже зарегистрирован');
        else setError(err.message);
      } else {
        setError('Не удалось создать аккаунт. Попробуйте позже.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Регистрация</h1>
        <p className="auth-subtitle">Создайте аккаунт в Voltix</p>

        {error   && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Логин</label>
            <input
              className="form-input"
              type="text"
              placeholder="3–20 символов, латиница"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              maxLength={20}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="mail@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Пароль</label>
            <input
              className="form-input"
              type="password"
              placeholder="Минимум 8 символов"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Повторите пароль</label>
            <input
              className="form-input"
              type="password"
              placeholder="Повторите пароль"
              value={password2}
              onChange={e => setPassword2(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Создаём…' : 'Создать аккаунт'}
          </button>
        </form>

        <p className="auth-switch">
          Уже есть аккаунт? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api';
import '../styles/auth.css';

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const navigate = useNavigate();
  const { resetPassword } = useAuth();

  const [password, setPassword]   = useState('');
  const [password2, setPassword2] = useState('');
  const [busy,  setBusy]   = useState(false);
  const [done,  setDone]   = useState(false);
  const [error, setError]  = useState('');

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="auth-title">Ошибка</h1>
          <div className="auth-error">Токен не найден в ссылке.</div>
          <Link to="/forgot-password" className="auth-submit" style={{ display: 'block', textAlign: 'center', marginTop: 16 }}>
            Запросить новую ссылку
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password || !password2) {
      setError('Заполните оба поля');
      return;
    }
    if (password !== password2) {
      setError('Пароли не совпадают');
      return;
    }
    if (password.length < 8) {
      setError('Пароль должен быть минимум 8 символов');
      return;
    }

    setBusy(true);
    try {
      await resetPassword({ token, newPassword: password });
      setDone(true);
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404) setError('Токен не найден');
        else if (err.status === 409) setError('Ссылка использована или просрочена. Запросите новую.');
        else setError(err.message);
      } else {
        setError('Не удалось сменить пароль. Попробуйте позже.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Новый пароль</h1>
        <p className="auth-subtitle">Введите новый пароль для вашего аккаунта</p>

        {error && <div className="auth-error">{error}</div>}
        {done && <div className="auth-success">Пароль изменён. Перенаправляем на страницу входа…</div>}

        {!done && (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Новый пароль</label>
              <input
                className="form-input"
                type="password"
                placeholder="Минимум 8 символов"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
                autoFocus
              />
            </div>

            <div className="form-group">
              <label className="form-label">Повторите пароль</label>
              <input
                className="form-input"
                type="password"
                placeholder="Ещё раз новый пароль"
                value={password2}
                onChange={e => setPassword2(e.target.value)}
                autoComplete="new-password"
              />
            </div>

            <button type="submit" className="auth-submit" disabled={busy}>
              {busy ? 'Меняем пароль…' : 'Сменить пароль'}
            </button>
          </form>
        )}

        <p className="auth-switch">
          <Link to="/login">Назад ко входу</Link>
        </p>
      </div>
    </div>
  );
}

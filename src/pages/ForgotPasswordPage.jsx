import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../api';
import '../styles/auth.css';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [busy,  setBusy]  = useState(false);
  const [done,  setDone]  = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Укажите email');
      return;
    }

    setBusy(true);
    try {
      await forgotPassword(email.trim());
      setDone(true);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Не удалось отправить письмо. Попробуйте позже.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Восстановление пароля</h1>
        <p className="auth-subtitle">Введите email — отправим ссылку для сброса</p>

        {error && <div className="auth-error">{error}</div>}
        {done ? (
          <>
            <div className="auth-success">
              Если этот email зарегистрирован, на него отправлено письмо со ссылкой.
              Проверьте почту, в том числе папку «Спам».
            </div>
            <Link to="/login" className="auth-submit" style={{ display: 'block', textAlign: 'center', marginTop: 16 }}>
              Назад ко входу
            </Link>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                placeholder="mail@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                autoFocus
              />
            </div>

            <button type="submit" className="auth-submit" disabled={busy}>
              {busy ? 'Отправляем…' : 'Отправить ссылку'}
            </button>
          </form>
        )}

        <p className="auth-switch">
          Вспомнили пароль? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  );
}

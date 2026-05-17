import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ApiError } from '../api';
import { pendingReset } from '../utils/authPending';
import '../styles/auth.css';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [busy,  setBusy]  = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const trimmed = email.trim();
    if (!trimmed) {
      setError('Укажите email');
      return;
    }

    setBusy(true);
    try {
      await forgotPassword(trimmed);
      toast?.success?.('Письмо с кодом отправлено');
      pendingReset.set(trimmed);
      navigate('/reset-password', { state: { email: trimmed } });
    } catch (err) {
      // Бэк должен отдавать 200 всегда, но на всякий случай.
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
        <p className="auth-subtitle">Введите email — отправим 5-значный код</p>

        {error && <div className="auth-error">{error}</div>}

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
            {busy ? 'Отправляем…' : 'Отправить код'}
          </button>
        </form>

        <p className="auth-switch">
          Уже есть код? <Link to="/reset-password">Ввести код</Link>
        </p>
        <p className="auth-switch">
          Вспомнили пароль? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  );
}

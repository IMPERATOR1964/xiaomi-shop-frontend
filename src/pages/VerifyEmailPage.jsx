import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/auth.css';

export default function VerifyEmailPage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const { verifyEmail } = useAuth();

  const [state, setState] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setState('error');
      setMessage('Токен не найден в ссылке');
      return;
    }
    let alive = true;
    verifyEmail(token)
      .then(res => {
        if (!alive) return;
        setState(res?.success === false ? 'error' : 'success');
        setMessage(res?.message || (res?.success === false ? 'Не удалось подтвердить email' : 'Email подтверждён'));
      })
      .catch(err => {
        if (!alive) return;
        setState('error');
        setMessage(err?.message || 'Ссылка недействительна или просрочена');
      });
    return () => { alive = false; };
  }, [token, verifyEmail]);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Подтверждение email</h1>

        {state === 'loading' && <p className="auth-subtitle">Проверяем токен...</p>}
        {state === 'success' && (
          <>
            <div className="auth-success" style={{ marginBottom: 16 }}>{message}</div>
            <p className="auth-subtitle">Можете войти в аккаунт.</p>
            <Link to="/login" className="auth-submit" style={{ display: 'block', textAlign: 'center', marginTop: 12 }}>
              Войти
            </Link>
          </>
        )}
        {state === 'error' && (
          <>
            <div className="auth-error" style={{ marginBottom: 16 }}>{message}</div>
            <Link to="/login" className="auth-submit" style={{ display: 'block', textAlign: 'center' }}>
              На страницу входа
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

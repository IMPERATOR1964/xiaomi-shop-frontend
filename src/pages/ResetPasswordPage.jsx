import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ApiError } from '../api';
import { pendingReset } from '../utils/authPending';
import CodeInput from '../components/CodeInput';
import '../styles/auth.css';

const CODE_LENGTH = 5;
const CODE_REGEX  = /^\d{5}$/;

export default function ResetPasswordPage() {
  const routerLoc = useLocation();
  const navigate = useNavigate();
  const { resetPassword, forgotPassword } = useAuth();
  const { toast } = useToast();

  const initialEmail = routerLoc.state?.email || pendingReset.get() || '';

  // Если email есть — сразу шаг кода. Если нет — пользователь должен сначала ввести email.
  const [step, setStep] = useState(initialEmail ? 'code' : 'email'); // 'email' | 'code' | 'password'
  const [email, setEmail]         = useState(initialEmail);
  const [code,  setCode]          = useState('');
  const [password, setPassword]   = useState('');
  const [password2, setPassword2] = useState('');
  const [busy,  setBusy]   = useState(false);
  const [done,  setDone]   = useState(false);
  const [error, setError]  = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // ===== Шаг 0: ввод email (если пользователь зашёл напрямую) =====
  const submitEmail = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim()) {
      setError('Укажите email');
      return;
    }
    setBusy(true);
    try {
      await forgotPassword(email.trim());
      pendingReset.set(email.trim());
      toast?.success?.('Письмо с кодом отправлено');
      setStep('code');
    } catch (err) {
      setError(err?.message || 'Не удалось отправить письмо');
    } finally {
      setBusy(false);
    }
  };

  // ===== Шаг 1: ввод кода =====
  const submitCode = () => {
    setError('');
    if (!CODE_REGEX.test(code)) {
      setError('Код должен состоять из 5 цифр');
      return;
    }
    setStep('password');
  };

  // ===== Шаг 2: новый пароль =====
  const submitPassword = async (e) => {
    e?.preventDefault?.();
    setError('');

    if (!email.trim()) {
      setError('Email не указан');
      setStep('email');
      return;
    }
    if (!CODE_REGEX.test(code)) {
      setError('Введите 5-значный код');
      setStep('code');
      return;
    }
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
      const res = await resetPassword({ email: email.trim(), code, newPassword: password });
      if (res?.success === false) {
        setError(res?.message || 'Неверный код');
        setStep('code');
        setCode('');
        return;
      }
      setDone(true);
      pendingReset.clear();
      toast?.success?.('Пароль изменён');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          setError('Запрос на сброс пароля не найден. Запросите новое письмо.');
          setStep('email');
        } else if (err.status === 409) {
          setError('Код истёк или использован. Запросите новое письмо.');
          setStep('email');
        } else {
          setError(err.message);
          setStep('code');
        }
      } else {
        setError('Не удалось сменить пароль. Попробуйте позже.');
      }
    } finally {
      setBusy(false);
    }
  };

  const resendCode = async () => {
    if (!email.trim()) return;
    try {
      await forgotPassword(email.trim());
      toast?.success?.('Письмо отправлено повторно');
      setResendCooldown(60);
      const t = setInterval(() => {
        setResendCooldown(s => {
          if (s <= 1) { clearInterval(t); return 0; }
          return s - 1;
        });
      }, 1000);
    } catch (err) {
      toast?.error?.(err?.message || 'Не удалось отправить письмо');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Новый пароль</h1>
        <p className="auth-subtitle">
          {step === 'email'    && 'Введите email, на который придёт код'}
          {step === 'code'     && (email
            ? <>Введите код, отправленный на <b>{email}</b></>
            : 'Введите 5-значный код')}
          {step === 'password' && 'Придумайте новый пароль для аккаунта'}
        </p>

        {error && <div className="auth-error">{error}</div>}
        {done  && <div className="auth-success">Пароль изменён. Перенаправляем на страницу входа…</div>}

        {/* ===== Шаг: email ===== */}
        {!done && step === 'email' && (
          <form onSubmit={submitEmail}>
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
        )}

        {/* ===== Шаг: code ===== */}
        {!done && step === 'code' && (
          <>
            <CodeInput
              length={CODE_LENGTH}
              value={code}
              onChange={setCode}
              onComplete={() => submitCode()}
              error={!!error}
              autoFocus
            />
            <button
              type="button"
              className="auth-submit"
              disabled={!CODE_REGEX.test(code)}
              onClick={submitCode}
              style={{ marginTop: 16 }}
            >
              Далее
            </button>
            <button
              type="button"
              className="auth-resend-btn"
              onClick={resendCode}
              disabled={resendCooldown > 0}
            >
              {resendCooldown > 0
                ? `Отправить повторно через ${resendCooldown} сек`
                : 'Отправить код повторно'}
            </button>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 10 }}>
              Код действителен 10 минут
            </p>
          </>
        )}

        {/* ===== Шаг: password ===== */}
        {!done && step === 'password' && (
          <form onSubmit={submitPassword}>
            <div style={{
              fontSize: 13,
              color: 'var(--text-muted)',
              marginBottom: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 8,
            }}>
              <span>Код: <b style={{ letterSpacing: 2, color: 'var(--text-primary)' }}>{code}</b></span>
              <button
                type="button"
                onClick={() => { setStep('code'); setError(''); }}
                style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600 }}
              >
                Изменить
              </button>
            </div>

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

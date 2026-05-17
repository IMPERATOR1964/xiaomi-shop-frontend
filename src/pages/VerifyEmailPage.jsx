import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ApiError } from '../api';
import { pendingVerify } from '../utils/authPending';
import CodeInput from '../components/CodeInput';
import '../styles/auth.css';

const CODE_LENGTH = 5;
const CODE_REGEX  = /^\d{5}$/;

// Высчитывает сколько секунд осталось до момента ISO-времени.
function secondsLeft(iso) {
  if (!iso) return 0;
  const ms = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.floor(ms / 1000));
}

// Форматирует секунды как «12:34».
function fmtClock(sec) {
  if (sec <= 0) return '0:00';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

// Форматирует крупно как «5 ч 10 мин» / «25 мин» / «42 сек».
function fmtVerbose(sec) {
  if (sec <= 0) return '0 секунд';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h} ч ${m} мин`;
  if (m > 0) return `${m} мин`;
  return `${sec} сек`;
}

export default function VerifyEmailPage() {
  const routerLoc = useLocation();
  const navigate = useNavigate();
  const { verifyEmail, resendVerification, verificationStatus } = useAuth();
  const { toast } = useToast();

  // Email: state из RegisterPage → fallback на localStorage.
  const initialEmail = routerLoc.state?.email || pendingVerify.get() || '';

  // Дедлайны: из state RegisterPage или из ответа /verification-status.
  const [email, setEmail]            = useState(initialEmail);
  const [requiredUntil, setReqUntil] = useState(routerLoc.state?.verificationRequiredUntil  || null);
  const [codeUntil,     setCodeUntil] = useState(routerLoc.state?.verificationCodeValidUntil || null);
  const [secondsToDelete, setSecondsToDelete] = useState(0);
  const [secondsToCode,   setSecondsToCode]   = useState(0);
  const [canResend, setCanResend] = useState(true);
  const [serverMsg, setServerMsg] = useState('');

  const [code,    setCode]    = useState('');
  const [busy,    setBusy]    = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  // ===== Запрос /verification-status =====
  const lastStatusFetch = useRef(0);
  const STATUS_THROTTLE_MS = 5_000; // rate-limit на бэке 20/min/IP

  const fetchStatus = async (silent = false) => {
    if (!email.trim()) return;
    const now = Date.now();
    if (silent && now - lastStatusFetch.current < STATUS_THROTTLE_MS) return;
    lastStatusFetch.current = now;
    try {
      const s = await verificationStatus(email.trim());
      if (s?.emailVerified) {
        setSuccess('Email уже подтверждён');
        pendingVerify.clear();
        setTimeout(() => navigate('/login'), 1500);
        return;
      }
      if (s?.verificationRequiredUntil)  setReqUntil(s.verificationRequiredUntil);
      if (s?.verificationCodeValidUntil) setCodeUntil(s.verificationCodeValidUntil);
      if (typeof s?.secondsUntilDeletion === 'number')    setSecondsToDelete(s.secondsUntilDeletion);
      if (typeof s?.secondsUntilCodeExpires === 'number') setSecondsToCode(s.secondsUntilCodeExpires);
      if (typeof s?.canResend === 'boolean')              setCanResend(s.canResend);
      if (s?.message) setServerMsg(s.message);
    } catch {
      // ignore — продолжаем по локальным таймерам
    }
  };

  // Первоначальная подгрузка статуса
  useEffect(() => {
    if (email) fetchStatus(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Тикалка таймеров каждую секунду на основе ISO-дедлайнов
  useEffect(() => {
    const tick = () => {
      setSecondsToDelete(requiredUntil ? secondsLeft(requiredUntil) : 0);
      setSecondsToCode(codeUntil ? secondsLeft(codeUntil) : 0);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [requiredUntil, codeUntil]);

  // Когда код истёк — resend становится доступен.
  useEffect(() => {
    if (codeUntil && secondsToCode === 0) setCanResend(true);
  }, [secondsToCode, codeUntil]);

  const deletionExpired = !!requiredUntil && secondsToDelete === 0;

  // ===== Сабмит =====
  const submit = async (codeValue) => {
    const value = (codeValue ?? code).trim();
    if (!email.trim()) {
      setError('Укажите email, на который пришёл код');
      return;
    }
    if (!CODE_REGEX.test(value)) {
      setError('Код должен состоять из 5 цифр');
      return;
    }

    setBusy(true);
    setError('');
    setSuccess('');
    try {
      const res = await verifyEmail({ email: email.trim(), code: value });
      if (res?.success === false) {
        setError(res?.message || 'Неверный код');
        setCode('');
        fetchStatus(false);
        return;
      }
      setSuccess(res?.message || 'Email подтверждён');
      pendingVerify.clear();
      toast?.success?.('Email подтверждён');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404)        setError('Запрос на подтверждение не найден. Зарегистрируйтесь заново.');
        else if (err.status === 409)   setError('Код истёк или заблокирован. Запросите новый.');
        else                            setError(err.message);
      } else {
        setError('Не удалось проверить код. Попробуйте позже.');
      }
      setCode('');
    } finally {
      setBusy(false);
    }
  };

  // ===== Resend =====
  const handleResend = async () => {
    const trimmed = email.trim();
    if (!trimmed) { toast?.error?.('Укажите email'); return; }
    if (!canResend) {
      toast?.info?.('Подождите немного перед повторной отправкой');
      return;
    }
    try {
      const res = await resendVerification(trimmed);
      if (res?.success === false) {
        toast?.error?.(res?.message || 'Не удалось отправить письмо');
        return;
      }
      pendingVerify.set(trimmed);
      toast?.success?.(res?.message || 'Письмо отправлено повторно');
      setCanResend(false);
      setCode('');
      setTimeout(() => fetchStatus(false), 500);
    } catch (err) {
      if (err instanceof ApiError && err.status === 429) {
        toast?.error?.('Слишком часто — подождите 60 секунд');
      } else {
        toast?.error?.(err?.message || 'Не удалось отправить письмо');
      }
    }
  };

  // ===== Если регистрация уже истекла — отдельный экран =====
  if (deletionExpired) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <h1 className="auth-title">Регистрация истекла</h1>
          <p className="auth-subtitle">
            Аккаунт не был подтверждён вовремя и был удалён. Зарегистрируйтесь заново.
          </p>
          <Link to="/register" className="auth-submit" style={{ display: 'block', textAlign: 'center' }}>
            Зарегистрироваться
          </Link>
          <p className="auth-switch">
            <Link to="/login">Вход</Link>
          </p>
        </div>
      </div>
    );
  }

  const codeExpired = !!codeUntil && secondsToCode === 0;

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1 className="auth-title">Подтверждение email</h1>
        <p className="auth-subtitle">
          {email
            ? <>Введите 5-значный код, отправленный на <b>{email}</b></>
            : 'Введите 5-значный код из письма'}
        </p>

        {serverMsg && !success && !error && (
          <div className="auth-info">{serverMsg}</div>
        )}

        {(requiredUntil || codeUntil) && !success && (
          <div className="auth-timers">
            {requiredUntil && (
              <div className="auth-timer">
                <span className="auth-timer-label">До удаления аккаунта</span>
                <span className="auth-timer-value">{fmtVerbose(secondsToDelete)}</span>
              </div>
            )}
            {codeUntil && !codeExpired && (
              <div className="auth-timer">
                <span className="auth-timer-label">Код истечёт через</span>
                <span className="auth-timer-value auth-timer-code">{fmtClock(secondsToCode)}</span>
              </div>
            )}
            {codeExpired && (
              <div className="auth-timer auth-timer-expired">
                <span className="auth-timer-label">Код истёк</span>
                <span className="auth-timer-value">запросите новый</span>
              </div>
            )}
          </div>
        )}

        {error   && <div className="auth-error">{error}</div>}
        {success && <div className="auth-success">{success}</div>}

        {!success && (
          <>
            <CodeInput
              length={CODE_LENGTH}
              value={code}
              onChange={setCode}
              onComplete={(c) => submit(c)}
              disabled={busy || codeExpired}
              error={!!error}
              autoFocus
            />

            {!initialEmail && (
              <div className="form-group" style={{ marginTop: 14 }}>
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
            )}

            <button
              type="button"
              className="auth-submit"
              disabled={busy || !CODE_REGEX.test(code) || codeExpired}
              onClick={() => submit()}
              style={{ marginTop: 16 }}
            >
              {busy ? 'Проверяем…' : 'Подтвердить'}
            </button>

            <button
              type="button"
              className="auth-resend-btn"
              onClick={handleResend}
              disabled={!canResend || !email.trim()}
            >
              {canResend
                ? (codeExpired ? 'Получить новый код' : 'Отправить код повторно')
                : 'Подождите перед повторной отправкой'}
            </button>
          </>
        )}

        <p className="auth-switch">
          Уже подтвердили? <Link to="/login">Войти</Link>
        </p>
      </div>
    </div>
  );
}

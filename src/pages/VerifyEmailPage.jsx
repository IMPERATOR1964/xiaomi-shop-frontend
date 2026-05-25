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

// Парсит ISO-строку как UTC (даже если в ней нет Z/+00:00).
// Используется как fallback, если бэк не дал seconds_until_*.
function isoUtcToMillis(iso) {
  if (!iso) return 0;
  // если в строке уже есть индикатор зоны — оставляем как есть
  const hasTz = /[zZ]|[+\-]\d{2}:?\d{2}$/.test(iso);
  return new Date(hasTz ? iso : iso + 'Z').getTime();
}

// Берёт seconds_until_* (число) от бэка приоритетно. Если только ISO без TZ — парсим как UTC.
function pickSeconds(secsField, isoField, now) {
  if (typeof secsField === 'number') return Math.max(0, Math.floor(secsField));
  if (typeof isoField === 'string') {
    const ms = isoUtcToMillis(isoField) - now;
    return Math.max(0, Math.floor(ms / 1000));
  }
  return 0;
}

export default function VerifyEmailPage() {
  const routerLoc = useLocation();
  const navigate = useNavigate();
  const { verifyEmail, resendVerification, verificationStatus } = useAuth();
  const { toast } = useToast();

  const initialEmail = routerLoc.state?.email || pendingVerify.get() || '';

  const [email, setEmail] = useState(initialEmail);

  // Дедлайны храним как АБСОЛЮТНЫЕ timestamp'ы (ms from epoch),
  // вычисленные на основе seconds_until_* + Date.now() в момент получения.
  // Это полностью устраняет проблему таймзон.
  const [deadlineDeleteMs, setDeadlineDeleteMs] = useState(null);
  const [deadlineCodeMs,   setDeadlineCodeMs]   = useState(null);

  // Тикалка пересчитывает каждую секунду
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const now = Date.now();
  const secondsToDelete = deadlineDeleteMs ? Math.max(0, Math.floor((deadlineDeleteMs - now) / 1000)) : 0;
  const secondsToCode   = deadlineCodeMs   ? Math.max(0, Math.floor((deadlineCodeMs   - now) / 1000)) : 0;

  const [canResend, setCanResend] = useState(true);
  const [serverMsg, setServerMsg] = useState('');

  const [code,    setCode]    = useState('');
  const [busy,    setBusy]    = useState(false);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  // Применяет дедлайны из ответа бэка (либо AuthResponse, либо VerificationStatusResponse).
  // Приоритет: seconds_until_* (snake_case или camelCase) → ISO с UTC fallback.
  const applyDeadlines = (data) => {
    if (!data) return;
    const nowMs = Date.now();

    const secDel = data.secondsUntilDeletion ?? data.seconds_until_deletion;
    const secCode = data.secondsUntilCodeExpires ?? data.seconds_until_code_expires;
    const isoDel  = data.verificationRequiredUntil  ?? data.verification_required_until;
    const isoCode = data.verificationCodeValidUntil ?? data.verification_code_valid_until;

    const sDel = pickSeconds(secDel, isoDel, nowMs);
    const sCode = pickSeconds(secCode, isoCode, nowMs);

    if (sDel > 0)  setDeadlineDeleteMs(nowMs + sDel * 1000);
    else if (secDel != null || isoDel) setDeadlineDeleteMs(0); // явно «истекло»

    if (sCode > 0) setDeadlineCodeMs(nowMs + sCode * 1000);
    else if (secCode != null || isoCode) setDeadlineCodeMs(0);

    if (typeof data.canResend === 'boolean')        setCanResend(data.canResend);
    if (typeof data.can_resend === 'boolean')        setCanResend(data.can_resend);
    if (data.message) setServerMsg(data.message);
  };

  // При первом монтаже применяем дедлайны из state RegisterPage (если есть)
  useEffect(() => {
    if (routerLoc.state) applyDeadlines(routerLoc.state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Опрос /verification-status
  const lastStatusFetch = useRef(0);
  const STATUS_THROTTLE_MS = 5_000;

  const fetchStatus = async (silent = false) => {
    if (!email.trim()) return;
    const t = Date.now();
    if (silent && t - lastStatusFetch.current < STATUS_THROTTLE_MS) return;
    lastStatusFetch.current = t;
    try {
      const s = await verificationStatus(email.trim());
      if (s?.emailVerified || s?.email_verified) {
        setSuccess('Email уже подтверждён');
        pendingVerify.clear();
        setTimeout(() => navigate('/login'), 1500);
        return;
      }
      applyDeadlines(s);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (email) fetchStatus(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Автоматический resend разрешён когда код истёк
  useEffect(() => {
    if (deadlineCodeMs != null && secondsToCode === 0) setCanResend(true);
  }, [secondsToCode, deadlineCodeMs]);

  const deletionExpired = deadlineDeleteMs !== null && secondsToDelete === 0;
  const codeExpired     = deadlineCodeMs   !== null && secondsToCode === 0;

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
        if (err.status === 404)      setError('Запрос на подтверждение не найден. Зарегистрируйтесь заново.');
        else if (err.status === 409) setError('Код истёк или заблокирован. Запросите новый.');
        else                          setError(err.message);
      } else {
        setError('Не удалось проверить код. Попробуйте позже.');
      }
      setCode('');
    } finally {
      setBusy(false);
    }
  };

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

        {(deadlineDeleteMs !== null || deadlineCodeMs !== null) && !success && (
          <div className="auth-timers">
            {deadlineDeleteMs !== null && (
              <div className="auth-timer">
                <span className="auth-timer-label">До удаления аккаунта</span>
                <span className="auth-timer-value">{fmtVerbose(secondsToDelete)}</span>
              </div>
            )}
            {deadlineCodeMs !== null && !codeExpired && (
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

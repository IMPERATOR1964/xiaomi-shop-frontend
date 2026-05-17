// Поле ввода кода из 5 ячеек.
// Поддерживает: автофокус следующей ячейки, Backspace на предыдущую,
// стрелки, paste 5 цифр сразу, очистку.
//
// Использование:
//   <CodeInput value={code} onChange={setCode} length={5} autoFocus />
//   onComplete вызывается когда введены все цифры.

import { useEffect, useRef, useState } from 'react';
import '../styles/code-input.css';

export default function CodeInput({
  length = 5,
  value = '',
  onChange,
  onComplete,
  disabled = false,
  error = false,
  autoFocus = true,
}) {
  // Внутренний массив символов. Синхронизируется с value.
  const [chars, setChars] = useState(() => {
    const arr = Array.from({ length }, () => '');
    String(value).slice(0, length).split('').forEach((c, i) => { arr[i] = c; });
    return arr;
  });
  const refs = useRef([]);

  useEffect(() => {
    if (autoFocus) refs.current[0]?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Если value снаружи сбросилось — сбрасываем ячейки.
  useEffect(() => {
    if (!value) {
      const arr = Array.from({ length }, () => '');
      setChars(arr);
    }
  }, [value, length]);

  const emit = (arr) => {
    const joined = arr.join('');
    onChange?.(joined);
    if (joined.length === length && !arr.includes('')) onComplete?.(joined);
  };

  const handleChange = (i, raw) => {
    // Берём только цифры
    const digit = raw.replace(/\D/g, '').slice(-1);
    const arr = [...chars];
    arr[i] = digit;
    setChars(arr);
    emit(arr);
    if (digit && i < length - 1) refs.current[i + 1]?.focus();
  };

  const handleKey = (i, e) => {
    if (e.key === 'Backspace') {
      if (chars[i]) {
        // очистить текущую
        const arr = [...chars];
        arr[i] = '';
        setChars(arr);
        emit(arr);
      } else if (i > 0) {
        refs.current[i - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && i > 0) {
      refs.current[i - 1]?.focus();
    } else if (e.key === 'ArrowRight' && i < length - 1) {
      refs.current[i + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    if (!text) return;
    e.preventDefault();
    const arr = Array.from({ length }, () => '');
    text.split('').forEach((c, i) => { arr[i] = c; });
    setChars(arr);
    emit(arr);
    const idx = Math.min(text.length, length - 1);
    refs.current[idx]?.focus();
  };

  return (
    <div className={`code-input ${error ? 'code-input-error' : ''}`}>
      {chars.map((c, i) => (
        <input
          key={i}
          ref={(el) => (refs.current[i] = el)}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={1}
          value={c}
          disabled={disabled}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={i === 0 ? handlePaste : undefined}
          aria-label={`Цифра ${i + 1} из ${length}`}
        />
      ))}
    </div>
  );
}

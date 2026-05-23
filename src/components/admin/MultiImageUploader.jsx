// Галерея фото товара — до MAX штук.
//
// Бэк v5 поддерживает ОДНО фото на товар (POST /admin/products/{id}/image):
// при загрузке нескольких — каждая последующая перезаписывает поле imageUrl у товара.
// В UI мы храним полный список URL локально (state), чтобы пользователь видел всё,
// что он отправлял. ГЛАВНОЕ фото = ПОСЛЕДНЕЕ в списке (которое сейчас в БД).
// Чтобы сделать главным другое — кликаем «Сделать главной» — оно отправляется заново.
//
// ⚠️ Чтобы фотки между сессиями не терялись и хранились все 10 — бэку нужно:
//   1. В Product добавить List<String> imageUrls (или таблицу product_images).
//   2. Эндпоинт POST /admin/products/{id}/images принимающий массив files.
//   3. ProductResponse возвращать imageUrls.
// До тех пор: галерея видна только пока юзер открыт на странице.

import { useEffect, useRef, useState } from 'react';
import { adminApi, productsApi } from '../../api';

const MAX = 10;
const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ACCEPT = 'image/png,image/jpeg,image/webp';

export default function MultiImageUploader({ productId, currentUrl, imageUrls, onChange }) {
  const fileRef = useRef(null);

  // Галерея: предпочитаем массив imageUrls с бэка, иначе fallback на currentUrl.
  const [gallery, setGallery] = useState(() =>
    Array.isArray(imageUrls) && imageUrls.length ? imageUrls : (currentUrl ? [currentUrl] : [])
  );
  const [busy, setBusy]   = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  // Когда родитель меняет imageUrls — синхронизируемся.
  useEffect(() => {
    if (Array.isArray(imageUrls)) setGallery(imageUrls);
  }, [imageUrls]);

  const pick = () => fileRef.current?.click();

  const remaining = MAX - gallery.length;

  // Подтягиваем актуальное состояние с бэка (после операций).
  const refresh = async () => {
    if (!productId) return;
    try {
      const p = await productsApi.byId(productId);
      if (Array.isArray(p?.imageUrls)) setGallery(p.imageUrls);
      onChange?.(p?.imageUrl || p?.imageUrls?.[0] || null);
    } catch {}
  };

  // Файлы выбраны → загружаем по одному
  const onSelect = async (e) => {
    setError('');
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (!productId) {
      setError('Сначала сохраните товар, чтобы загрузить фото');
      e.target.value = '';
      return;
    }

    const toUpload = files.slice(0, remaining);
    if (files.length > remaining) {
      setError(`Можно загрузить максимум ${MAX} фото. Лишние пропущены.`);
    }
    for (const f of toUpload) {
      if (f.size > MAX_FILE_SIZE) {
        setError(`Файл ${f.name} > 8 МБ — пропущен`);
        continue;
      }
      if (!f.type.startsWith('image/')) continue;
    }
    const valid = toUpload.filter(f => f.size <= MAX_FILE_SIZE && f.type.startsWith('image/'));
    if (valid.length === 0) { e.target.value = ''; return; }

    setBusy(true);
    setProgress({ done: 0, total: valid.length });
    try {
      // Бэк v6: один batch-запрос на весь массив через uploadProductImages.
      const updated = await adminApi.uploadProductImages(productId, valid);
      const urls = Array.isArray(updated?.imageUrls) ? updated.imageUrls : [];
      setGallery(urls);
      onChange?.(updated?.imageUrl || urls[0] || null);
    } catch (err) {
      setError(err?.message || 'Ошибка при загрузке');
    } finally {
      setBusy(false);
      setProgress({ done: 0, total: 0 });
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  // Сделать выбранное фото главным — реальный запрос на бэк (порядок массива).
  const setMain = async (url) => {
    const next = [url, ...gallery.filter(u => u !== url)];
    setGallery(next); // оптимистичный update
    try {
      const updated = await adminApi.reorderGalleryImages(productId, next);
      onChange?.(updated?.imageUrl || next[0] || null);
      if (Array.isArray(updated?.imageUrls)) setGallery(updated.imageUrls);
    } catch (err) {
      setError(err?.message || 'Не удалось сменить главное фото');
      refresh();
    }
  };

  // Удаление одного фото из галереи.
  const removeOne = async (url) => {
    if (!confirm('Удалить это фото из галереи?')) return;
    try {
      const updated = await adminApi.deleteGalleryImage(productId, url);
      const urls = Array.isArray(updated?.imageUrls) ? updated.imageUrls : [];
      setGallery(urls);
      onChange?.(updated?.imageUrl || urls[0] || null);
    } catch (err) {
      setError(err?.message || 'Не удалось удалить');
    }
  };

  return (
    <div className="image-uploader">
      <input
        ref={fileRef}
        type="file"
        accept={ACCEPT}
        multiple
        onChange={onSelect}
        style={{ display: 'none' }}
      />

      {/* Главное превью */}
      <div className="image-uploader-preview">
        {gallery[0]
          ? <img src={gallery[0]} alt="Главное фото" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          : (
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: 'var(--text-muted)' }}>
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <circle cx="9" cy="9" r="2"/>
              <path d="m21 15-5-5L5 21"/>
            </svg>
          )
        }
      </div>

      {/* Миниатюры галереи */}
      {gallery.length > 1 && (
        <div className="image-uploader-grid">
          {gallery.map((url, i) => (
            <div key={url} className={`image-uploader-thumb ${url === currentUrl ? 'is-main' : ''}`}>
              <img src={url} alt={`Фото ${i + 1}`} onError={(e) => { e.currentTarget.style.opacity = 0.3; }} />
              {url === currentUrl && <span className="image-uploader-main-badge">главное</span>}
              <div className="image-uploader-thumb-actions">
                {url !== currentUrl && (
                  <button type="button" onClick={() => setMain(url)} title="Сделать главной">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2 15.09 8.26 22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z"/></svg>
                  </button>
                )}
                <button type="button" onClick={() => removeOne(url)} title="Удалить">×</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && <div className="auth-error">{error}</div>}

      {progress.total > 0 && (
        <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
          Загружаем {progress.done} из {progress.total}…
        </p>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          type="button"
          className="btn-primary btn-sm"
          onClick={pick}
          disabled={busy || !productId || remaining <= 0}
        >
          {busy
            ? 'Загружаем…'
            : remaining <= 0
              ? `Лимит ${MAX} фото`
              : (gallery.length > 0 ? `Добавить ещё (${remaining})` : `Выбрать фотографии (до ${MAX})`)
          }
        </button>
        {gallery.length > 0 && currentUrl && (
          <button
            type="button"
            className="btn-outline btn-sm"
            onClick={() => removeOne(currentUrl)}
            disabled={busy}
            style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
          >
            Удалить главное
          </button>
        )}
      </div>

      {!productId && (
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Сначала создайте товар — после этого можно загружать фото.
        </p>
      )}

      <p style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.5 }}>
        PNG / JPG / WebP, до 8 МБ. Главное фото — то, что показывается в каталоге и корзине.
        Можно выбрать несколько файлов сразу — они загрузятся последовательно.
      </p>
    </div>
  );
}

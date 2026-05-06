// Загрузка фото товара через multipart на /api/admin/products/{id}/image.
import { useRef, useState } from 'react';
import { adminApi } from '../../api';

export default function ImageUploader({ productId, currentUrl, onChange }) {
  const fileRef = useRef(null);
  const [busy, setBusy]   = useState(false);
  const [error, setError] = useState('');

  const pick = () => fileRef.current?.click();

  const onSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!productId) {
      setError('Сохраните товар, прежде чем загружать фото');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError('Файл слишком большой (макс 8 МБ)');
      return;
    }

    setError('');
    setBusy(true);
    try {
      const updated = await adminApi.uploadProductImage(productId, file);
      onChange?.(updated.imageUrl);
    } catch (err) {
      setError(err?.message || 'Не удалось загрузить');
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const onDelete = async () => {
    if (!productId) return;
    if (!confirm('Удалить картинку?')) return;
    setBusy(true);
    setError('');
    try {
      const updated = await adminApi.deleteProductImage(productId);
      onChange?.(updated.imageUrl || null);
    } catch (err) {
      setError(err?.message || 'Не удалось удалить');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="image-uploader">
      <input
        ref={fileRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={onSelect}
        style={{ display: 'none' }}
      />

      <div className="image-uploader-preview">
        {currentUrl
          ? <img src={currentUrl} alt="Фото товара" />
          : <span style={{ fontSize: 48, color: 'var(--text-muted)' }}>📷</span>
        }
      </div>

      {error && <div className="auth-error">{error}</div>}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" className="btn-primary btn-sm" onClick={pick} disabled={busy || !productId}>
          {busy ? 'Загружаем…' : (currentUrl ? 'Заменить фото' : 'Загрузить фото')}
        </button>
        {currentUrl && (
          <button
            type="button"
            className="btn-outline btn-sm"
            onClick={onDelete}
            disabled={busy}
            style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
          >Удалить</button>
        )}
      </div>

      {!productId && (
        <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          Создайте товар, чтобы можно было загрузить фото.
        </p>
      )}
    </div>
  );
}

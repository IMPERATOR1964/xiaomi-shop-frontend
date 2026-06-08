import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { productsApi, ApiError } from '../../api';
import { useCategories } from '../../context/CategoriesContext';
import { Loading, ErrorState } from '../../components/UiStates';
import MultiImageUploader from '../../components/admin/MultiImageUploader';

export default function AdminProductFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { categories: CATEGORIES } = useCategories();

  const [loading, setLoading] = useState(isEdit);
  const [busy,    setBusy]    = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');

  // Поля формы (SKU и variantGroup — generates the backend automatically)
  const [name,        setName]        = useState('');
  const [description, setDescription] = useState('');
  const [price,       setPrice]       = useState('');
  const [stock,       setStock]       = useState('');
  const [categoryId,  setCategoryId]  = useState('');
  const [sku,         setSku]         = useState(''); // показывается в read-only при редактировании
  const [imageUrl,    setImageUrl]    = useState(null);
  const [imageUrls,   setImageUrls]   = useState([]);
  const [isActive,    setIsActive]    = useState(true);

  useEffect(() => {
    if (!isEdit) return;
    let alive = true;
    setLoading(true);
    productsApi.byId(id)
      .then(p => {
        if (!alive) return;
        setName(p.name || '');
        setDescription(p.desc || '');
        setPrice(String(p.price ?? ''));
        setStock(String(p.stock ?? 0));
        setCategoryId(String(p.categoryId || ''));
        setSku(p.sku || '');
        setImageUrl(p.imageUrl || null);
        setImageUrls(Array.isArray(p.imageUrls) ? p.imageUrls : []);
        setIsActive(p.isActive !== false);
      })
      .catch(err => { if (alive) setLoadError(err?.message || 'Товар не найден'); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [id, isEdit]);

  const validate = () => {
    if (!name.trim() || name.trim().length < 3) return 'Название минимум 3 символа';
    if (!price || Number(price) <= 0)            return 'Цена должна быть > 0';
    if (stock !== '' && Number(stock) < 0)       return 'Остаток не может быть отрицательным';
    if (!categoryId)                              return 'Выберите категорию';
    return null;
  };

  const submit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');

    const v = validate();
    if (v) { setError(v); return; }

    setBusy(true);
    try {
      if (isEdit) {
        const body = {
          name: name.trim(),
          description: description.trim() || null,
          price: Number(price),
          stockQuantity: stock === '' ? 0 : Number(stock),
          categoryId: Number(categoryId),
          isActive,
          imageUrl: imageUrl || null,
        };
        await productsApi.update(id, body);
        setSuccess('Изменения сохранены');
      } else {
        // SKU и variantGroupId генерирует бэк — не передаём.
        const body = {
          name: name.trim(),
          description: description.trim() || null,
          price: Number(price),
          stockQuantity: stock === '' ? 0 : Number(stock),
          categoryId: Number(categoryId),
        };
        const created = await productsApi.create(body);
        setSuccess('Товар создан. Теперь можно загрузить фото.');
        setTimeout(() => navigate(`/admin/products/${created.id}`), 600);
      }
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Не удалось сохранить. Попробуйте позже.');
    } finally {
      setBusy(false);
    }
  };

  const handleHardDelete = async () => {
    const ok = confirm(
      `Удалить товар «${name}» НАВСЕГДА?\n\n` +
      'Запись будет полностью удалена из базы — это необратимо.\n' +
      'Если нужно лишь временно убрать товар из каталога — снимите галочку «Активен».'
    );
    if (!ok) return;
    setBusy(true);
    try {
      await productsApi.hardDelete(id);
      navigate('/admin/products');
    } catch (err) {
      const status = err?.status;
      if (status === 404 || status === 405 || status === 501) {
        setError(
          'Полное удаление пока не поддерживается бэкендом. ' +
          'Нужен эндпоинт DELETE /api/admin/products/{id} (см. BACKEND_TODO.md, п.11). ' +
          'Пока можно снять галочку «Активен», чтобы скрыть товар.'
        );
      } else if (status === 409) {
        setError('Нельзя удалить: товар используется в заказах. Снимите «Активен», чтобы скрыть.');
      } else {
        setError(err instanceof ApiError ? err.message : 'Не удалось удалить');
      }
    } finally {
      setBusy(false);
    }
  };

  if (loading)   return <Loading label="Загружаем товар..." />;
  if (loadError) return <ErrorState message={loadError} />;

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <h1 className="admin-page-title">
          {isEdit ? `Товар #${id}` : 'Создание товара'}
        </h1>
        <Link to="/admin/products" className="btn-outline btn-sm">← К списку</Link>
      </div>

      {error   && <div className="auth-error">{error}</div>}
      {success && <div className="auth-success">{success}</div>}

      <div className="admin-form-grid">
        {/* Левая колонка — данные */}
        <form onSubmit={submit} className="admin-form">
          <div className="form-group">
            <label className="form-label">Название *</label>
            <input
              className="form-input"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={255}
              placeholder="Например: Смартфон Xiaomi 14 Pro 12/256GB Чёрный"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Описание</label>
            <textarea
              className="form-input"
              rows={5}
              value={description}
              onChange={e => setDescription(e.target.value)}
              maxLength={1000}
              placeholder="Полное описание товара"
              style={{ resize: 'vertical' }}
            />
          </div>

          <div className="admin-form-row">
            <div className="form-group">
              <label className="form-label">Цена, ₽ *</label>
              <input
                className="form-input"
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={e => setPrice(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Остаток на складе</label>
              <input
                className="form-input"
                type="number"
                min="0"
                value={stock}
                onChange={e => setStock(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Категория *</label>
            <select
              className="form-input"
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
            >
              <option value="">— выбрать —</option>
              {CATEGORIES.filter(c => c.backendId).map(c => (
                <option key={c.id} value={c.backendId}>{c.label}</option>
              ))}
            </select>
          </div>

          {isEdit && sku && (
            <div className="form-group">
              <label className="form-label">Артикул (SKU)</label>
              <input
                className="form-input"
                type="text"
                value={sku}
                disabled
                style={{ fontFamily: 'JetBrains Mono, Courier New, monospace', letterSpacing: 1 }}
              />
              <small style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Артикул генерируется автоматически и не меняется.
              </small>
            </div>
          )}

          {isEdit && (
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={e => setIsActive(e.target.checked)}
                />
                <span>Активен (показывать в каталоге)</span>
              </label>
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={busy} style={{ marginTop: 8 }}>
            {busy ? 'Сохраняем…' : (isEdit ? 'Сохранить изменения' : 'Создать товар')}
          </button>

          {isEdit && (
            <div
              style={{
                marginTop: 24,
                paddingTop: 16,
                borderTop: '1px solid var(--border)',
              }}
            >
              <label className="form-label" style={{ color: 'var(--danger)' }}>
                Опасная зона
              </label>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '4px 0 10px' }}>
                Полное удаление товара из базы. Действие необратимо.
                Для временного скрытия снимите галочку «Активен».
              </p>
              <button
                type="button"
                className="btn-outline btn-sm"
                onClick={handleHardDelete}
                disabled={busy}
                style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
              >
                Удалить товар навсегда
              </button>
            </div>
          )}
        </form>

        {/* Правая колонка — фото */}
        <aside className="admin-form-sidebar">
          <h3 className="admin-section-title">Фотографии товара</h3>
          <MultiImageUploader
            productId={isEdit ? Number(id) : null}
            currentUrl={imageUrl}
            imageUrls={imageUrls}
            onChange={setImageUrl}
          />
          {isEdit && imageUrl && (
            <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8, wordBreak: 'break-all' }}>
              {imageUrl}
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { categoriesApi, adminApi, ApiError } from '../../api';
import { Loading, ErrorState } from '../../components/UiStates';

export default function AdminCategoriesPage() {
  const [items, setItems]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  // Создание новой
  const [name, setName]       = useState('');
  const [desc, setDesc]       = useState('');
  const [busy, setBusy]       = useState(false);
  const [formError, setFormError] = useState('');

  const load = () => {
    setLoading(true);
    setError(null);
    categoriesApi.list()
      .then(setItems)
      .catch(err => setError(err?.message || 'Не удалось загрузить'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!name.trim() || name.trim().length < 2) {
      setFormError('Название минимум 2 символа');
      return;
    }
    setBusy(true);
    try {
      await adminApi.categories.create({ name: name.trim(), description: desc.trim() || null });
      setName(''); setDesc('');
      load();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : 'Не удалось создать');
    } finally {
      setBusy(false);
    }
  };

  const remove = async (cat) => {
    if (cat.productsCount > 0) {
      alert('Нельзя удалить категорию, в которой есть товары');
      return;
    }
    if (!confirm(`Удалить категорию «${cat.name}»?`)) return;
    try {
      await adminApi.categories.remove(cat.id);
      load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Не удалось удалить');
    }
  };

  const rename = async (cat) => {
    const newName = prompt('Новое название:', cat.name);
    if (!newName || newName.trim() === cat.name) return;
    try {
      await adminApi.categories.update(cat.id, { name: newName.trim(), description: cat.description });
      load();
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Не удалось обновить');
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-head">
        <h1 className="admin-page-title">Категории</h1>
      </div>

      <section className="admin-section">
        <h2 className="admin-section-title">Создать категорию</h2>
        <form onSubmit={create} className="admin-form" style={{ maxWidth: 560 }}>
          {formError && <div className="auth-error">{formError}</div>}
          <div className="form-group">
            <label className="form-label">Название *</label>
            <input
              className="form-input"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Например: Аксессуары для авто"
              maxLength={100}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Описание</label>
            <input
              className="form-input"
              type="text"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Краткое описание раздела"
              maxLength={500}
            />
          </div>
          <button type="submit" className="btn-primary btn-sm" disabled={busy}>
            {busy ? 'Создаём…' : 'Создать'}
          </button>
        </form>
      </section>

      <section className="admin-section">
        <h2 className="admin-section-title">Все категории</h2>
        {loading
          ? <Loading />
          : error
          ? <ErrorState message={error} onRetry={load} />
          : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th style={{ width: 60 }}>ID</th>
                    <th>Название</th>
                    <th>Описание</th>
                    <th style={{ width: 120 }}>Товаров</th>
                    <th style={{ width: 200 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map(c => (
                    <tr key={c.id}>
                      <td>{c.id}</td>
                      <td><b>{c.name}</b></td>
                      <td style={{ color: 'var(--text-muted)' }}>{c.description}</td>
                      <td>{c.productsCount}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          <button className="btn-outline btn-sm" onClick={() => rename(c)}>Переименовать</button>
                          <button
                            className="btn-outline btn-sm"
                            onClick={() => remove(c)}
                            disabled={c.productsCount > 0}
                            style={{ color: c.productsCount > 0 ? 'var(--text-muted)' : 'var(--danger)' }}
                          >Удалить</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
      </section>
    </div>
  );
}

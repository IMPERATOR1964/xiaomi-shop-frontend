import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';
import { useCompare } from '../context/CompareContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import '../styles/auth.css';

export default function ProfilePage() {
  const { user, logout, updateUser, isStaff, isAdmin } = useAuth();
  const { count: favCount } = useFavorites();
  const { count: cmpCount } = useCompare();
  const { cartCount } = useCart();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState('');
  const fileRef = useRef(null);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  if (!user) return null;

  const startEdit = () => {
    setDraftName(user.name);
    setEditing(true);
  };

  const saveEdit = () => {
    const trimmed = draftName.trim();
    if (trimmed && trimmed !== user.name) updateUser({ name: trimmed });
    setEditing(false);
  };

  const cancelEdit = () => setEditing(false);
  const handleKey = (e) => {
    if (e.key === 'Enter')  saveEdit();
    if (e.key === 'Escape') cancelEdit();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // ===== Аватар =====
  const pickAvatar = () => fileRef.current?.click();

  const onAvatarSelected = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 400 * 1024) {
      toast?.error?.('Выберите файл меньше 400 КБ');
      e.target.value = '';
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast?.error?.('Нужно изображение');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      updateUser({ avatarUrl: reader.result });
      toast?.success?.('Фото обновлено');
    };
    reader.onerror = () => toast?.error?.('Не удалось загрузить фото');
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const removeAvatar = () => {
    updateUser({ avatarUrl: null });
    toast?.info?.('Фото удалено');
  };

  const Badge = ({ n }) =>
    n > 0 ? <span style={{ marginLeft: 'auto', background: 'var(--accent)', color: '#fff', fontSize: 12, fontWeight: 700, padding: '2px 8px', borderRadius: 100 }}>{n}</span> : null;

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-card">
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={onAvatarSelected}
            style={{ display: 'none' }}
          />

          <button
            type="button"
            className="profile-avatar profile-avatar-btn"
            onClick={pickAvatar}
            title="Загрузить фото"
          >
            {user.avatarUrl
              ? <img src={user.avatarUrl} alt={user.name} />
              : user.name.charAt(0).toUpperCase()
            }
            <span className="profile-avatar-overlay">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                <circle cx="12" cy="13" r="4"/>
              </svg>
            </span>
          </button>
          {user.avatarUrl && (
            <button type="button" className="profile-avatar-remove" onClick={removeAvatar}>
              Удалить фото
            </button>
          )}

          {editing ? (
            <div className="profile-name-edit">
              <input
                className="form-input"
                type="text"
                value={draftName}
                onChange={e => setDraftName(e.target.value)}
                onKeyDown={handleKey}
                autoFocus
                maxLength={30}
              />
              <div className="profile-name-edit-actions">
                <button className="profile-icon-btn save" onClick={saveEdit} title="Сохранить">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </button>
                <button className="profile-icon-btn cancel" onClick={cancelEdit} title="Отмена">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>
          ) : (
            <div className="profile-name-row">
              <h1 className="profile-name">{user.name}</h1>
              <button className="profile-icon-btn" onClick={startEdit} title="Изменить имя">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"/>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                </svg>
              </button>
            </div>
          )}

          <p className="profile-email">{user.email}</p>

          <div className="profile-menu">
            <button className="profile-menu-item" onClick={() => navigate('/cart')}>
              Корзина <Badge n={cartCount} />
            </button>
            <button className="profile-menu-item" onClick={() => navigate('/orders')}>
              Мои заказы
            </button>
            <button className="profile-menu-item" onClick={() => navigate('/favorites')}>
              Избранное <Badge n={favCount} />
            </button>
            <button className="profile-menu-item" onClick={() => navigate('/compare')}>
              Сравнение <Badge n={cmpCount} />
            </button>
            {isStaff && (
              <button
                className="profile-menu-item profile-menu-item-admin"
                onClick={() => navigate('/admin')}
              >
                {isAdmin ? 'Админ-панель' : 'Панель модератора'}
              </button>
            )}
            <button className="profile-menu-item danger" onClick={handleLogout}>
              Выйти из аккаунта
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

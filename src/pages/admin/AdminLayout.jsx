import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminGuard from '../../components/admin/AdminGuard';
import '../../styles/admin.css';

export default function AdminLayout() {
  const { user, isAdmin } = useAuth();

  return (
    <AdminGuard>
      <div className="admin-layout">
        <aside className="admin-sidebar">
          <div className="admin-sidebar-head">
            <div className="admin-badge">{isAdmin ? 'ADMIN' : 'MODERATOR'}</div>
            <div className="admin-user">
              <div className="admin-user-avatar">{user?.name?.charAt(0).toUpperCase() || 'A'}</div>
              <div>
                <div className="admin-user-name">{user?.name}</div>
                <div className="admin-user-email">{user?.email}</div>
              </div>
            </div>
          </div>

          <nav className="admin-nav">
            <NavLink to="/admin" end className="admin-nav-link">
              <span className="admin-nav-icon">📊</span>
              <span>Дашборд</span>
            </NavLink>
            <NavLink to="/admin/products" className="admin-nav-link">
              <span className="admin-nav-icon">📦</span>
              <span>Товары</span>
            </NavLink>
            <NavLink to="/admin/products/new" className="admin-nav-link">
              <span className="admin-nav-icon">➕</span>
              <span>Создать товар</span>
            </NavLink>
            <NavLink to="/admin/categories" className="admin-nav-link">
              <span className="admin-nav-icon">🗂</span>
              <span>Категории</span>
            </NavLink>
          </nav>

          <div className="admin-sidebar-foot">
            <NavLink to="/" className="admin-nav-link">
              <span className="admin-nav-icon">←</span>
              <span>На сайт</span>
            </NavLink>
          </div>
        </aside>

        <div className="admin-main">
          <Outlet />
        </div>
      </div>
    </AdminGuard>
  );
}

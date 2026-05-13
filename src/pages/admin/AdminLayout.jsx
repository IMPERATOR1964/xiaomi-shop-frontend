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
              <span className="admin-nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="9" rx="1"/>
                  <rect x="14" y="3" width="7" height="5" rx="1"/>
                  <rect x="14" y="12" width="7" height="9" rx="1"/>
                  <rect x="3" y="16" width="7" height="5" rx="1"/>
                </svg>
              </span>
              <span>Дашборд</span>
            </NavLink>
            <NavLink to="/admin/products" className="admin-nav-link">
              <span className="admin-nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                  <line x1="12" y1="22.08" x2="12" y2="12"/>
                </svg>
              </span>
              <span>Товары</span>
            </NavLink>
            <NavLink to="/admin/products/new" className="admin-nav-link">
              <span className="admin-nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </span>
              <span>Создать товар</span>
            </NavLink>
            <NavLink to="/admin/orders" className="admin-nav-link">
              <span className="admin-nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 11l3 3L22 4"/>
                  <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                </svg>
              </span>
              <span>Заказы</span>
            </NavLink>
            <NavLink to="/admin/categories" className="admin-nav-link">
              <span className="admin-nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
                </svg>
              </span>
              <span>Категории</span>
            </NavLink>
          </nav>

          <div className="admin-sidebar-foot">
            <NavLink to="/" className="admin-nav-link">
              <span className="admin-nav-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                </svg>
              </span>
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

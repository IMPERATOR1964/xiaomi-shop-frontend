// Защищает админ-роуты: пускает только ROLE_ADMIN или ROLE_MODERATOR.
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminGuard({ children, requireAdmin = false }) {
  const { isAuthenticated, isAdmin, isStaff } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const allowed = requireAdmin ? isAdmin : isStaff;
  if (!allowed) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <h2 style={{ marginBottom: 12 }}>Доступ запрещён</h2>
        <p style={{ color: 'var(--text-muted)' }}>
          Эта страница доступна только администраторам.
        </p>
      </div>
    );
  }

  return children;
}

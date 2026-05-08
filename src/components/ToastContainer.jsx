import { useToast } from '../context/ToastContext';
import '../styles/toast.css';

const ICON_BY_TYPE = {
  success: '✓',
  error:   '✕',
  info:    '!',
};

export default function ToastContainer() {
  const { items, toast } = useToast();
  if (!items.length) return null;

  return (
    <div className="toast-container" role="status" aria-live="polite">
      {items.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`} onClick={() => toast.dismiss(t.id)}>
          <span className="toast-icon">{ICON_BY_TYPE[t.type] || 'i'}</span>
          <span className="toast-text">{t.text}</span>
        </div>
      ))}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { getNotifications, markAllRead, unreadCount } from '../../utils/notifications';
import './gamification.css';

export default function NotificationPanel({ open, onClose }) {
  const [items, setItems] = useState(getNotifications);

  useEffect(() => {
    const refresh = () => setItems(getNotifications());
    window.addEventListener('kijani-notifications-change', refresh);
    return () => window.removeEventListener('kijani-notifications-change', refresh);
  }, []);

  useEffect(() => {
    if (open) {
      markAllRead();
      setItems(getNotifications());
    }
  }, [open]);

  if (!open) return null;

  return (
    <>
      <div className="notif-backdrop" onClick={onClose} aria-hidden />
      <div className="notif-panel card" role="dialog" aria-label="Notifications">
        <div className="notif-panel-header">
          <h4>Activity</h4>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
        {items.length === 0 ? (
          <p className="text-sm text-muted" style={{ padding: '1rem' }}>
            Milestones and badges will appear here.
          </p>
        ) : (
          <ul className="notif-list">
            {items.map((n) => (
              <li key={n.id} className="notif-item">
                <span className="notif-emoji">{n.emoji}</span>
                <div>
                  <strong>{n.title}</strong>
                  <p>{n.body}</p>
                  <time>{new Date(n.at).toLocaleString()}</time>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}

export function useUnreadNotifications() {
  const [count, setCount] = useState(unreadCount);
  useEffect(() => {
    const refresh = () => setCount(unreadCount());
    window.addEventListener('kijani-notifications-change', refresh);
    return () => window.removeEventListener('kijani-notifications-change', refresh);
  }, []);
  return count;
}

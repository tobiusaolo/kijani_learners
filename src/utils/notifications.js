const KEY = 'kijani_notifications';
const MAX = 20;

export function pushNotification({ title, body, emoji = '✨' }) {
  try {
    const list = JSON.parse(localStorage.getItem(KEY) || '[]');
    list.unshift({
      id: Date.now(),
      title,
      body,
      emoji,
      at: new Date().toISOString(),
      read: false,
    });
    localStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX)));
    window.dispatchEvent(new CustomEvent('kijani-notifications-change'));
  } catch {
    /* ignore */
  }
}

export function getNotifications() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]');
  } catch {
    return [];
  }
}

export function markAllRead() {
  try {
    const list = getNotifications().map((n) => ({ ...n, read: true }));
    localStorage.setItem(KEY, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('kijani-notifications-change'));
  } catch {
    /* ignore */
  }
}

export function unreadCount() {
  return getNotifications().filter((n) => !n.read).length;
}

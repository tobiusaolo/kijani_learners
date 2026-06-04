const STORAGE_KEY = 'kijani_learner_avatar_id';
const DEFAULT_AVATAR_ID = 'guardian';

export const AVATAR_CHANGE_EVENT = 'kijani-avatar-change';

export function getStoredAvatarId() {
  try {
    const id = localStorage.getItem(STORAGE_KEY);
    return id || DEFAULT_AVATAR_ID;
  } catch {
    return DEFAULT_AVATAR_ID;
  }
}

export function setStoredAvatarId(avatarId) {
  localStorage.setItem(STORAGE_KEY, avatarId);
  window.dispatchEvent(new CustomEvent(AVATAR_CHANGE_EVENT, { detail: { avatarId } }));
}

export function subscribeAvatarChange(handler) {
  const onChange = (e) => handler(e.detail?.avatarId ?? getStoredAvatarId());
  window.addEventListener(AVATAR_CHANGE_EVENT, onChange);
  return () => window.removeEventListener(AVATAR_CHANGE_EVENT, onChange);
}

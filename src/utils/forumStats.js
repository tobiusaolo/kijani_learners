const KEY = 'kijani_forum_reply_count';

export function incrementForumReplies() {
  try {
    const n = parseInt(localStorage.getItem(KEY) || '0', 10) + 1;
    localStorage.setItem(KEY, String(n));
    return n;
  } catch {
    return 1;
  }
}

export function getForumReplyCount() {
  try {
    return parseInt(localStorage.getItem(KEY) || '0', 10);
  } catch {
    return 0;
  }
}

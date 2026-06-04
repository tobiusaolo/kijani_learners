import { BADGE_CATALOG, getBadgeMeta } from '../data/badgeCatalog';

const KEY = 'kijani_badges_unlocked';
export const BADGE_CHANGE_EVENT = 'kijani-badge-change';

function readUnlocked() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeUnlocked(ids) {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
    window.dispatchEvent(new CustomEvent(BADGE_CHANGE_EVENT, { detail: { ids } }));
  } catch {
    /* ignore */
  }
}

export function getUnlockedBadgeIds() {
  return readUnlocked();
}

export function isBadgeUnlocked(id) {
  return readUnlocked().includes(id);
}

export function unlockBadge(id) {
  const ids = readUnlocked();
  if (ids.includes(id)) return null;
  writeUnlocked([...ids, id]);
  return getBadgeMeta(id);
}

export function subscribeBadges(handler) {
  const onChange = () => handler(readUnlocked());
  window.addEventListener(BADGE_CHANGE_EVENT, onChange);
  return () => window.removeEventListener(BADGE_CHANGE_EVENT, onChange);
}

function countReflections(modules) {
  return (modules || []).filter((m) => m.reflection_saved || m.reflection_text).length;
}

/**
 * Evaluate rules; returns newly unlocked badge metas.
 */
export function evaluateBadges(ctx) {
  const {
    event,
    modules = [],
    assessments = [],
    story = null,
    certificate = null,
    quizScore,
    quizAttemptNumber,
    forumPosts = [],
    forumReplies = 0,
    hasRsvp = false,
  } = ctx;

  const unlocked = [];
  const tryUnlock = (id) => {
    const meta = unlockBadge(id);
    if (meta) unlocked.push(meta);
  };

  const completed = modules.filter((m) => m.status === 'completed').length;
  const hasBaseline = (assessments || []).some((a) => a.type === 'baseline');
  const hasEndline = (assessments || []).some((a) => a.type === 'endline');
  const baseline = (assessments || []).find((a) => a.type === 'baseline');
  const endline = (assessments || []).find((a) => a.type === 'endline');
  const storyDone = story && (story.status === 'pending' || story.status === 'approved');
  const certDone = Boolean(certificate?.can_download ?? certificate?.unlocked);

  if (event === 'module_open') tryUnlock('first_step');
  if (event === 'intro_video') tryUnlock('spotlight');
  if (event === 'quiz_pass') {
    tryUnlock('quiz_ready');
    if (quizScore >= 100) tryUnlock('sharp_mind');
    if (quizAttemptNumber === 1) tryUnlock('one_shot');
  }
  if (event === 'reflection' && countReflections(modules) >= 3) tryUnlock('reflector');

  for (let i = 1; i <= 6; i++) {
    if (modules.find((m) => m.id === i && m.status === 'completed')) {
      tryUnlock(`module_${i}`);
    }
  }
  if (completed >= 6) tryUnlock('full_circle');
  if (hasBaseline || event === 'baseline_done') tryUnlock('baseline');
  if (hasEndline && baseline && endline && endline.systems_thinking_score > baseline.systems_thinking_score) {
    tryUnlock('rising_tide');
  }
  if (storyDone || event === 'story_submit') tryUnlock('storyteller');
  if (certDone || event === 'cert_download') tryUnlock('certified');
  if (event === 'forum_post') tryUnlock('first_voice');
  if (forumReplies >= 5) tryUnlock('thread_builder');
  if ((forumPosts || []).some((p) => (p.likes_count || 0) >= 5)) tryUnlock('crowd_fav');
  if (hasRsvp || event === 'webinar_rsvp') tryUnlock('live_wire');

  return unlocked;
}

export function getBadgeProgress() {
  const ids = readUnlocked();
  return {
    unlocked: ids,
    total: BADGE_CATALOG.length,
    count: ids.length,
    catalog: BADGE_CATALOG,
  };
}

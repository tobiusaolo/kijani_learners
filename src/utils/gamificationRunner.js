import { cachedData } from './staleLoad';
import { evaluateBadges } from './learnerBadges';
import { celebrateBadges } from './celebrate';

function contextFromCache(extra = {}) {
  const modulesRaw = cachedData('modules:list', 'modules');
  const modules = modulesRaw?.data ?? modulesRaw ?? [];
  const assessmentsRaw = cachedData('assessments:my', 'assessments');
  const assessments = assessmentsRaw?.data ?? assessmentsRaw ?? [];
  const storyRaw = cachedData('story:mine', 'stories');
  const story = storyRaw?.data ?? storyRaw ?? null;
  const certRaw = cachedData('certificate:me', 'certificate');
  const certificate = certRaw?.data ?? certRaw ?? null;

  return {
    modules: Array.isArray(modules) ? modules : [],
    assessments: Array.isArray(assessments) ? assessments : [],
    story,
    certificate,
    ...extra,
  };
}

/** Run badge rules and toast new unlocks. */
export function runGamificationEvent(event, extra = {}) {
  const ctx = contextFromCache({ event, ...extra });
  const unlocked = evaluateBadges(ctx);
  if (unlocked.length) celebrateBadges(unlocked);
  return unlocked;
}

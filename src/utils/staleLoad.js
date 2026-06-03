import { peekCache, unwrapResponse } from '../api/cachedLearnerApi';

export function cachedData(cacheKey, cacheType = 'default') {
  const hit = peekCache(cacheKey, cacheType);
  return hit ? unwrapResponse(hit) : null;
}

export function showPageLoading(cacheKey, cacheType = 'default') {
  return !peekCache(cacheKey, cacheType);
}

export function assessmentsPageLoading(type) {
  return (
    showPageLoading(`assessments:instrument:${type}`, 'assessments')
    && showPageLoading('assessments:my', 'assessments')
  );
}

export function quizPageLoading(quizId) {
  return (
    showPageLoading(`quizzes:take:${quizId}`, 'modules')
    && showPageLoading(`quizzes:attempts:${quizId}`, 'modules')
  );
}

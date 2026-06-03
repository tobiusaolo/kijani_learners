import { useState, useEffect, useCallback } from 'react';
import {
  peekCache,
  fetchCached,
  unwrapResponse,
  CACHE_DURATIONS,
} from '../api/cachedLearnerApi';

/**
 * Stale-while-revalidate: show cached data instantly, refresh in background.
 */
export function useCachedQuery(cacheKey, apiFn, cacheType = 'default', deps = []) {
  const cachedHit = peekCache(cacheKey, cacheType);

  const [data, setData] = useState(() =>
    cachedHit ? unwrapResponse(cachedHit) : null
  );
  const [loading, setLoading] = useState(!cachedHit);
  const [revalidating, setRevalidating] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(
    async (force = false) => {
      const hasCache = !force && peekCache(cacheKey, cacheType);
      if (hasCache) {
        setData(unwrapResponse(peekCache(cacheKey, cacheType)));
        setLoading(false);
        setRevalidating(true);
      } else {
        setLoading(true);
        setRevalidating(false);
      }
      setError(null);
      try {
        const res = await fetchCached(cacheKey, apiFn, cacheType, { force });
        setData(unwrapResponse(res));
      } catch (err) {
        setError(err);
        if (!hasCache) setData(null);
      } finally {
        setLoading(false);
        setRevalidating(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cacheKey, cacheType, ...deps]
  );

  useEffect(() => {
    load();
  }, [load]);

  return {
    data,
    loading,
    revalidating,
    error,
    refresh: () => load(true),
    isCached: Boolean(peekCache(cacheKey, cacheType)),
  };
}

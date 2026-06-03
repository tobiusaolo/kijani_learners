import { useEffect, useRef } from 'react';
import { prefetchLearnerData } from '../api/cachedLearnerApi';

/** Warm common learner API caches after login (non-blocking). */
export default function BackgroundPrefetch() {
  const ran = useRef(false);
  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    prefetchLearnerData();
  }, []);
  return null;
}

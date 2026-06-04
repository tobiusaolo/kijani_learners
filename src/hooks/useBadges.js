import { useState, useEffect } from 'react';
import { getUnlockedBadgeIds, subscribeBadges } from '../utils/learnerBadges';

export function useBadges() {
  const [unlockedIds, setUnlockedIds] = useState(getUnlockedBadgeIds);

  useEffect(() => subscribeBadges(setUnlockedIds), []);

  return { unlockedIds };
}

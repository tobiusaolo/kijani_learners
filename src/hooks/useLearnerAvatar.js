import { useState, useEffect } from 'react';
import { getStoredAvatarId, subscribeAvatarChange } from '../utils/learnerAvatar';
import { getAvatarMeta } from '../data/avatarCatalog';

export function useLearnerAvatar() {
  const [avatarId, setAvatarId] = useState(getStoredAvatarId);

  useEffect(() => subscribeAvatarChange(setAvatarId), []);

  return {
    avatarId,
    avatarMeta: getAvatarMeta(avatarId),
  };
}

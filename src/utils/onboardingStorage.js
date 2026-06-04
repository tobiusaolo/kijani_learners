const KEY = 'kijani_onboarding_done';

export function isOnboardingDone() {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

export function setOnboardingDone() {
  try {
    localStorage.setItem(KEY, '1');
  } catch {
    /* ignore */
  }
}

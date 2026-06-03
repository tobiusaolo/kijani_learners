/** Map GET /profile/ response to UI-friendly fields. */
export function profileFromApi(data) {
  if (!data) {
    return {
      firstName: '',
      lastName: '',
      email: '',
      country: '',
      region: '',
      background: '',
      bio: '',
      cohortName: null,
    };
  }
  return {
    firstName: data.first_name || '',
    lastName: data.last_name || '',
    email: data.email || '',
    country: data.country || '',
    region: data.region || '',
    background: data.background || '',
    bio: data.bio || '',
    cohortName: data.cohort?.name || null,
    cohortId: data.cohort_id ?? null,
  };
}

export function getDisplayName(profile, authUser) {
  if (profile?.firstName || profile?.lastName) {
    return `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
  }
  if (authUser?.email) {
    const local = authUser.email.split('@')[0];
    return local.charAt(0).toUpperCase() + local.slice(1);
  }
  return 'Learner';
}

export function getInitials(profile, authUser) {
  if (profile?.firstName || profile?.lastName) {
    const a = (profile.firstName || '').charAt(0);
    const b = (profile.lastName || '').charAt(0);
    const combined = `${a}${b}`.toUpperCase();
    if (combined) return combined;
  }
  if (authUser?.email) return authUser.email.charAt(0).toUpperCase();
  return '?';
}

export function getRoleLine(profile) {
  if (profile?.cohortName) return `Learner · ${profile.cohortName}`;
  if (profile?.cohortId) return `Learner · Cohort ${profile.cohortId}`;
  return 'Learner';
}

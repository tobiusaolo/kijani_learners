/** Conservation-themed learner avatars (frontend only, localStorage). */
export const AVATAR_CATALOG = [
  { id: 'guardian', label: 'Forest Guardian', role: 'Protects wild places' },
  { id: 'ranger', label: 'Park Ranger', role: 'On-the-ground stewardship' },
  { id: 'researcher', label: 'Field Researcher', role: 'Science & discovery' },
  { id: 'storyteller', label: 'Storyteller', role: 'Voices for nature' },
  { id: 'community', label: 'Community Leader', role: 'People & place' },
  { id: 'technologist', label: 'Eco Technologist', role: 'Tools for conservation' },
  { id: 'advocate', label: 'Youth Advocate', role: 'Policy & action' },
  { id: 'explorer', label: 'Terrascape Explorer', role: 'Systems thinking' },
];

export function getAvatarMeta(id) {
  return AVATAR_CATALOG.find((a) => a.id === id) || AVATAR_CATALOG[0];
}

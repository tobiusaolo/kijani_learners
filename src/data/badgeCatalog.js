/** Achievement badges — frontend only (localStorage). */
export const BADGE_CATALOG = [
  { id: 'first_step', label: 'First Step', emoji: '👣', desc: 'Opened your first module' },
  { id: 'spotlight', label: 'Spotlight', emoji: '🎬', desc: 'Watched an intro video' },
  { id: 'quiz_ready', label: 'Quiz Ready', emoji: '✅', desc: 'Passed your first quiz' },
  { id: 'sharp_mind', label: 'Sharp Mind', emoji: '💯', desc: 'Scored 100% on a quiz' },
  { id: 'one_shot', label: 'One Shot', emoji: '🎯', desc: 'Passed a quiz on the first try' },
  { id: 'reflector', label: 'Reflector', emoji: '📝', desc: 'Saved reflections in 3 modules' },
  { id: 'module_1', label: 'Module 1 Hero', emoji: '🌿', desc: 'Completed Module 1' },
  { id: 'module_2', label: 'Module 2 Hero', emoji: '🤝', desc: 'Completed Module 2' },
  { id: 'module_3', label: 'Module 3 Hero', emoji: '🦁', desc: 'Completed Module 3' },
  { id: 'module_4', label: 'Module 4 Hero', emoji: '🌍', desc: 'Completed Module 4' },
  { id: 'module_5', label: 'Module 5 Hero', emoji: '🛰️', desc: 'Completed Module 5' },
  { id: 'module_6', label: 'Module 6 Hero', emoji: '✨', desc: 'Completed Module 6' },
  { id: 'full_circle', label: 'Full Circle', emoji: '🔄', desc: 'Completed all 6 modules' },
  { id: 'baseline', label: 'Systems Snapshot', emoji: '📊', desc: 'Completed baseline assessment' },
  { id: 'rising_tide', label: 'Rising Tide', emoji: '📈', desc: 'Endline score beat baseline' },
  { id: 'storyteller', label: 'Voice of the Land', emoji: '🎙️', desc: 'Submitted your capstone story' },
  { id: 'certified', label: 'Terrascape Graduate', emoji: '🎓', desc: 'Downloaded your certificate' },
  { id: 'first_voice', label: 'First Voice', emoji: '💬', desc: 'Posted in the forum' },
  { id: 'thread_builder', label: 'Thread Builder', emoji: '🧵', desc: 'Posted 5 forum replies' },
  { id: 'crowd_fav', label: 'Community Favourite', emoji: '⭐', desc: 'A post reached 5 likes' },
  { id: 'live_wire', label: 'Live Wire', emoji: '📡', desc: 'RSVP’d to a webinar' },
];

export function getBadgeMeta(id) {
  return BADGE_CATALOG.find((b) => b.id === id);
}

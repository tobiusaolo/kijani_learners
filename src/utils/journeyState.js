export const PHASES = [
  { id: 'newcomer', label: 'Newcomer', min: 0 },
  { id: 'grounded', label: 'Grounded', min: 1 },
  { id: 'pathfinder', label: 'Pathfinder', min: 2 },
  { id: 'connector', label: 'Connector', min: 4 },
  { id: 'steward', label: 'Steward', min: 7 },
  { id: 'storyteller', label: 'Storyteller', min: 8 },
  { id: 'graduate', label: 'Terrascape Graduate', min: 9 },
];

function hasAssessment(assessments, type) {
  return (assessments || []).some((a) => a.type === type);
}

function storySubmitted(story) {
  if (!story) return false;
  return story.status === 'pending' || story.status === 'approved';
}

export function buildJourneyNodes({ modules = [], assessments = [], story = null, certificate = null }) {
  const completedCount = modules.filter((m) => m.status === 'completed').length;
  const baselineDone = hasAssessment(assessments, 'baseline');
  const endlineDone = hasAssessment(assessments, 'endline');
  const storyDone = storySubmitted(story);
  const certDone = Boolean(certificate?.can_download ?? certificate?.unlocked);

  const sequence = [
    { id: 'join', label: 'Join', done: true, available: true, to: '/learn/dashboard' },
    { id: 'baseline', label: 'Baseline', done: baselineDone, available: true, to: '/learn/assessment' },
    ...[1, 2, 3, 4, 5, 6].map((id) => {
      const m = modules.find((mod) => mod.id === id);
      return {
        id: `m${id}`,
        label: `M${id}`,
        done: m?.status === 'completed',
        available: m?.status !== 'locked',
        to: m?.status !== 'locked' ? `/learn/modules/${id}` : null,
      };
    }),
    {
      id: 'story',
      label: 'Story',
      done: storyDone,
      available: completedCount >= 6,
      to: '/learn/storytelling',
    },
    {
      id: 'endline',
      label: 'Endline',
      done: endlineDone,
      available: storyDone,
      to: '/learn/assessment/endline',
    },
    {
      id: 'cert',
      label: 'Cert',
      done: certDone,
      available: storyDone && endlineDone,
      to: '/learn/certificate',
    },
  ];

  let currentSet = false;
  return sequence.map((node) => {
    let state;
    if (node.done) state = 'done';
    else if (!node.available) state = 'locked';
    else if (!currentSet) {
      state = 'current';
      currentSet = true;
    } else {
      state = 'upcoming';
    }
    return { ...node, state };
  });
}

export function getPhase({ modules = [], assessments = [], story = null, certificate = null }) {
  const completedCount = modules.filter((m) => m.status === 'completed').length;
  const baselineDone = hasAssessment(assessments, 'baseline');
  const endlineDone = hasAssessment(assessments, 'endline');
  const storyDone = storySubmitted(story);
  const certDone = Boolean(certificate?.can_download ?? certificate?.unlocked);

  let score = 0;
  if (baselineDone) score = 1;
  if (completedCount >= 1) score = Math.max(score, 2);
  if (completedCount >= 3) score = Math.max(score, 4);
  if (completedCount >= 6) score = Math.max(score, 7);
  if (storyDone) score = Math.max(score, 8);
  if (certDone) score = 9;
  else if (endlineDone) score = Math.max(score, 8);

  let phase = PHASES[0];
  for (const p of PHASES) {
    if (score >= p.min) phase = p;
  }
  return phase;
}

export function getNextMission(ctx) {
  const nodes = buildJourneyNodes(ctx);
  const current = nodes.find((n) => n.state === 'current');

  if (!current) {
    return {
      title: 'Terrascape complete',
      description: 'Celebrate your progress and download your certificate.',
      cta: 'View certificate',
      to: '/learn/certificate',
      emoji: '🎓',
    };
  }

  const presets = {
    baseline: {
      title: 'Complete your baseline',
      description: 'Capture your systems thinking starting point.',
      cta: 'Start baseline',
      to: '/learn/assessment',
      emoji: '📊',
    },
    story: {
      title: 'Submit your capstone story',
      description: 'Your narrative unlocks the endline and certificate path.',
      cta: 'Open storytelling',
      to: '/learn/storytelling',
      emoji: '✨',
    },
    endline: {
      title: 'Take the endline assessment',
      description: 'Show how far you have grown since baseline.',
      cta: 'Start endline',
      to: '/learn/assessment/endline',
      emoji: '📈',
    },
    cert: {
      title: 'Claim your certificate',
      description: 'Download your Terrascape credential.',
      cta: 'Open certificate',
      to: '/learn/certificate',
      emoji: '🏆',
    },
  };

  if (presets[current.id]) return presets[current.id];

  if (current.id.startsWith('m')) {
    const modId = parseInt(current.id.slice(1), 10);
    const m = ctx.modules?.find((mod) => mod.id === modId);
    return {
      title: m ? `Continue ${m.title}` : `Module ${modId}`,
      description: 'Videos, readings, quizzes, and reflection await.',
      cta: `Resume module ${modId}`,
      to: `/learn/modules/${modId}`,
      emoji: m?.emoji || '📚',
    };
  }

  return {
    title: 'Continue your journey',
    description: 'Head to modules and keep momentum.',
    cta: 'My modules',
    to: '/learn/modules',
    emoji: '🌿',
  };
}

import './gamification.css';

export function masteryFromQuiz(score, passed) {
  if (!passed) return { label: 'Try again', variant: 'fail' };
  if (score >= 100) return { label: 'Perfect', variant: 'perfect' };
  if (score >= 85) return { label: 'Strong', variant: 'strong' };
  return { label: 'Passed', variant: 'pass' };
}

export default function MasteryChip({ label, variant = 'pass', small }) {
  return (
    <span className={`mastery-chip mastery-chip--${variant} ${small ? 'mastery-chip--sm' : ''}`}>
      {label}
    </span>
  );
}

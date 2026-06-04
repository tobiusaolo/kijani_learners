import './gamification.css';

export default function PhaseBadge({ phase, compact = false }) {
  if (!phase) return null;
  return (
    <span className={`phase-badge ${compact ? 'phase-badge--compact' : ''}`} title="Your Terrascape phase">
      <span className="phase-badge-dot" aria-hidden />
      {phase.label}
    </span>
  );
}

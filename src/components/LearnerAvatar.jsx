import { AvatarGraphic } from './avatars/AvatarArt';
import { getAvatarMeta } from '../data/avatarCatalog';
import './LearnerAvatar.css';

const SIZES = {
  xs: 32,
  sm: 38,
  md: 48,
  lg: 90,
  xl: 120,
};

/**
 * Cartoon learner avatar (stored in localStorage only).
 * @param {string} [avatarId] — if omitted, uses id prop only (caller passes from hook)
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} [size]
 * @param {boolean} [showRing]
 * @param {string} [className]
 */
export default function LearnerAvatar({
  avatarId,
  size = 'md',
  showRing = false,
  className = '',
  title,
}) {
  const px = SIZES[size] || SIZES.md;
  const meta = getAvatarMeta(avatarId);
  const label = title || meta.label;

  return (
    <div
      className={`learner-avatar learner-avatar--${size} ${showRing ? 'learner-avatar--ring' : ''} ${className}`.trim()}
      style={{ width: px, height: px }}
      title={label}
      role="img"
      aria-label={label}
    >
      <AvatarGraphic id={avatarId} />
    </div>
  );
}

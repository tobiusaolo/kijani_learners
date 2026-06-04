import { BADGE_CATALOG } from '../../data/badgeCatalog';
import './gamification.css';

export default function BadgeGrid({ unlockedIds = [] }) {
  const catalog = BADGE_CATALOG;

  return (
    <div className="badge-grid" id="badges">
      {catalog.map((b) => {
        const earned = unlockedIds.includes(b.id);
        return (
          <div key={b.id} className={`badge-grid-item ${earned ? 'earned' : 'locked'}`} title={b.desc}>
            <span className="badge-grid-emoji">{earned ? b.emoji : '🔒'}</span>
            <span className="badge-grid-label">{b.label}</span>
            <span className="badge-grid-desc">{b.desc}</span>
          </div>
        );
      })}
    </div>
  );
}

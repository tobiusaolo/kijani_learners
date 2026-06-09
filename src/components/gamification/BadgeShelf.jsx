import { Link } from 'react-router-dom';
import { getBadgeMeta } from '../../data/badgeCatalog';
import './gamification.css';

export default function BadgeShelf({ unlockedIds = [], limit = 4 }) {
  const recent = unlockedIds.slice(-limit).reverse();
  if (!recent.length) {
    return (
      <div className="badge-shelf card">
        <h4>Achievements</h4>
        <p className="text-sm text-muted">Complete missions to earn your first badge.</p>
        <Link to="/learn/profile" className="btn btn-outline btn-sm" style={{ marginTop: '0.75rem' }}>
          View all badges
        </Link>
      </div>
    );
  }

  return (
    <div className="badge-shelf card">
      <div className="badge-shelf-header">
        <h4>Achievements</h4>
        <span className="badge badge-brand">{unlockedIds.length} earned</span>
      </div>
      <div className="badge-shelf-row">
        {recent.map((id) => {
          const b = getBadgeMeta(id);
          if (!b) return null;
          return (
            <div key={id} className="badge-shelf-item" title={b.desc}>
              <span className="badge-shelf-emoji">{b.emoji}</span>
              <span className="badge-shelf-label">{b.label}</span>
            </div>
          );
        })}
      </div>
      <Link to="/learn/profile#badges" className="text-sm text-brand" style={{ marginTop: '0.75rem', display: 'inline-block' }}>
        View all →
      </Link>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { ArrowRight, Target } from 'lucide-react';
import './gamification.css';

export default function MissionCard({ mission }) {
  if (!mission) return null;
  return (
    <div className="mission-card card">
      <div className="mission-card-header">
        <Target size={18} color="var(--k-500)" />
        <span>Next mission</span>
      </div>
      <div className="mission-card-body">
        <span className="mission-emoji" aria-hidden>{mission.emoji}</span>
        <div>
          <h4 className="mission-title">{mission.title}</h4>
          <p className="mission-desc">{mission.description}</p>
        </div>
      </div>
      {mission.to && (
        <Link to={mission.to} className="btn btn-primary mission-cta">
          {mission.cta} <ArrowRight size={16} />
        </Link>
      )}
    </div>
  );
}

import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import './gamification.css';

export default function JourneyRail({ nodes = [] }) {
  return (
    <div className="journey-rail card">
      <div className="journey-rail-header">
        <h4>Terrascape Journey</h4>
        <span className="text-xs text-muted">Tap a step to jump in</span>
      </div>
      <div className="journey-rail-track" role="list">
        {nodes.map((node, i) => {
          const inner = (
            <>
              <span className={`journey-node-dot journey-node--${node.state}`}>
                {node.state === 'done' ? <Check size={12} strokeWidth={3} /> : null}
              </span>
              <span className="journey-node-label">{node.label}</span>
            </>
          );

          const className = `journey-node journey-node-wrap--${node.state}`;

          if (node.to && node.state !== 'locked') {
            return (
              <Link key={node.id} to={node.to} className={className} role="listitem" title={node.label}>
                {inner}
              </Link>
            );
          }

          return (
            <div key={node.id} className={className} role="listitem" aria-disabled={node.state === 'locked'}>
              {inner}
            </div>
          );
        })}
      </div>
      {nodes.length > 1 && (
        <div className="journey-rail-progress-line" aria-hidden>
          <div
            className="journey-rail-progress-fill"
            style={{
              width: `${(nodes.filter((n) => n.state === 'done').length / (nodes.length - 1)) * 100}%`,
            }}
          />
        </div>
      )}
    </div>
  );
}

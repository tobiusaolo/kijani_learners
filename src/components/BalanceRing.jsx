import { Link } from 'react-router-dom';
import { Info } from 'lucide-react';
import './BalanceRing.css';

export default function BalanceRing({ progress = 0, modules = [] }) {
  const moduleList = modules.length ? modules : [1, 2, 3, 4, 5, 6].map((id) => ({ id }));
  const positions = [
    { id: 1, x: 200, y: 60 },
    { id: 2, x: 321, y: 130 },
    { id: 3, x: 321, y: 270 },
    { id: 4, x: 200, y: 340 },
    { id: 5, x: 79, y: 270 },
    { id: 6, x: 79, y: 130 },
  ];
  const arcPct = Math.min(100, Math.max(0, progress)) / 100;
  const arcVisible = arcPct > 0;
  // A simple SVG implementation of the Terrascape Balance Ring
  // Inner circle: Social Foundation
  // Outer circle: Ecological Ceiling
  // Middle ring: The Safe and Just Space for Humanity / Conservation

  return (
    <div className="balance-ring-container">
      <div className="balance-ring-header">
        <h4>The Terrascape Balance Ring</h4>
        <Info size={16} color="var(--grey-400)" />
      </div>
      <p className="balance-ring-desc">
        Your conceptual framework: balancing social foundations with environmental limits.
      </p>
      
      <div className="svg-wrapper">
        <svg viewBox="0 0 400 400" className="balance-ring-svg">
          {/* Outer Boundary: Ecological Ceiling */}
          <circle cx="200" cy="200" r="180" fill="var(--g-50)" stroke="var(--g-500)" strokeWidth="4" strokeDasharray="10 10" />
          
          {/* Inner Boundary: Social Foundation */}
          <circle cx="200" cy="200" r="100" fill="#fff" stroke="var(--info)" strokeWidth="4" strokeDasharray="10 10" />
          
          {/* The Safe Space (Filled area) */}
          <circle cx="200" cy="200" r="140" fill="transparent" stroke="var(--g-500)" strokeWidth="80" opacity="0.15" />
          
          {arcVisible && (
            <path
              d="M 200 60 A 140 140 0 0 1 330 145"
              fill="none"
              stroke="var(--g-600)"
              strokeWidth="80"
              opacity={0.35 + arcPct * 0.55}
              strokeLinecap="round"
              pathLength="100"
              strokeDasharray={`${arcPct * 45} 100`}
            />
          )}

          {/* Labels */}
          <text x="200" y="30" textAnchor="middle" fill="var(--g-700)" fontSize="14" fontWeight="bold">Ecological Ceiling</text>
          <text x="200" y="205" textAnchor="middle" fill="var(--info)" fontSize="14" fontWeight="bold">Social Foundation</text>
          
          {positions.map(({ id, x, y }) => {
            const m = moduleList.find((mod) => mod.id === id);
            const done = m?.status === 'completed';
            const active = m?.status === 'active';
            const fill = done ? 'var(--g-600)' : active ? 'var(--g-400)' : 'var(--grey-300)';
            const textFill = done || active ? 'white' : 'var(--grey-600)';
            return (
              <g key={id} transform={`translate(${x}, ${y})`}>
                <circle cx="0" cy="0" r="15" fill={fill} />
                <text x="0" y="5" textAnchor="middle" fill={textFill} fontSize="12" fontWeight="bold">
                  {id}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="balance-ring-footer">
        <span>Framework Progress: <strong>{Math.round(progress)}%</strong></span>
        <Link to="/learn/modules" className="btn btn-outline btn-sm">View modules</Link>
      </div>
    </div>
  );
}

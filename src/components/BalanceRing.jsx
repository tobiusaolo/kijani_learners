import { Info } from 'lucide-react';
import './BalanceRing.css';

export default function BalanceRing({ progress = 0 }) {
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
          <circle cx="200" cy="200" r="180" fill="#e8f5e9" stroke="var(--green-500)" strokeWidth="4" strokeDasharray="10 10" />
          
          {/* Inner Boundary: Social Foundation */}
          <circle cx="200" cy="200" r="100" fill="#fff" stroke="var(--info)" strokeWidth="4" strokeDasharray="10 10" />
          
          {/* The Safe Space (Filled area) */}
          <circle cx="200" cy="200" r="140" fill="transparent" stroke="var(--k-500)" strokeWidth="80" opacity="0.15" />
          
          {/* Progress Indicator Arc */}
          <path 
            d="M 200 60 A 140 140 0 0 1 330 145" 
            fill="none" 
            stroke="var(--k-600)" 
            strokeWidth="80" 
            opacity="0.8"
            strokeLinecap="round"
          />

          {/* Labels */}
          <text x="200" y="30" textAnchor="middle" fill="var(--green-700)" fontSize="14" fontWeight="bold">Ecological Ceiling</text>
          <text x="200" y="205" textAnchor="middle" fill="var(--info)" fontSize="14" fontWeight="bold">Social Foundation</text>
          
          {/* Module Nodes */}
          <g transform="translate(200, 60)">
            <circle cx="0" cy="0" r="15" fill="var(--k-600)" />
            <text x="0" y="5" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">1</text>
          </g>
          <g transform="translate(321, 130)">
            <circle cx="0" cy="0" r="15" fill="var(--k-600)" />
            <text x="0" y="5" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">2</text>
          </g>
          <g transform="translate(321, 270)">
            <circle cx="0" cy="0" r="15" fill="var(--grey-300)" />
            <text x="0" y="5" textAnchor="middle" fill="var(--grey-600)" fontSize="12" fontWeight="bold">3</text>
          </g>
          <g transform="translate(200, 340)">
            <circle cx="0" cy="0" r="15" fill="var(--grey-300)" />
            <text x="0" y="5" textAnchor="middle" fill="var(--grey-600)" fontSize="12" fontWeight="bold">4</text>
          </g>
          <g transform="translate(79, 270)">
            <circle cx="0" cy="0" r="15" fill="var(--grey-300)" />
            <text x="0" y="5" textAnchor="middle" fill="var(--grey-600)" fontSize="12" fontWeight="bold">5</text>
          </g>
          <g transform="translate(79, 130)">
            <circle cx="0" cy="0" r="15" fill="var(--grey-300)" />
            <text x="0" y="5" textAnchor="middle" fill="var(--grey-600)" fontSize="12" fontWeight="bold">6</text>
          </g>
        </svg>
      </div>

      <div className="balance-ring-footer">
        <span>Framework Progress: <strong>33%</strong></span>
        <button className="btn btn-outline btn-sm">View Details</button>
      </div>
    </div>
  );
}

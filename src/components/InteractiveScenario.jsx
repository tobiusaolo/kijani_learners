import { useState } from 'react';
import { Target, ArrowRight, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import './InteractiveScenario.css';

export default function InteractiveScenario() {
  // Trade-off Decision Matrix Simulation
  const [protectionLevel, setProtectionLevel] = useState(50);
  const [tourismLevel, setTourismLevel] = useState(50);

  // Simple logic to calculate outcomes based on slider values
  const ecologicalHealth = Math.min(100, Math.max(0, protectionLevel * 1.2 - (tourismLevel * 0.3)));
  const communityIncome = Math.min(100, Math.max(0, tourismLevel * 1.1 - (protectionLevel * 0.2)));
  
  const isOptimal = ecologicalHealth > 65 && communityIncome > 65;

  return (
    <div className="scenario-block">
      <div className="scenario-header">
        <div className="scenario-icon"><Target size={20} /></div>
        <div>
          <h3>Interactive Scenario: The Trade-off Matrix</h3>
          <p className="text-sm text-muted">Adjust the management policies for the Kijani Reserve to find a balance between ecological health and community income.</p>
        </div>
      </div>

      <div className="scenario-content">
        <div className="scenario-controls">
          <div className="slider-group">
            <div className="slider-label-row">
              <label>Strict Protection vs. Resource Access</label>
              <span>{protectionLevel}% Strict</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={protectionLevel}
              onChange={(e) => setProtectionLevel(Number(e.target.value))}
              className="scenario-slider"
            />
            <div className="slider-hints">
              <span>More Community Access</span>
              <span>Stricter Ranger Enforcement</span>
            </div>
          </div>

          <div className="slider-group" style={{ marginTop: '1.5rem' }}>
            <div className="slider-label-row">
              <label>Eco-Tourism Development</label>
              <span>{tourismLevel}% Developed</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={tourismLevel}
              onChange={(e) => setTourismLevel(Number(e.target.value))}
              className="scenario-slider"
            />
            <div className="slider-hints">
              <span>Low Footprint</span>
              <span>High Infrastructure</span>
            </div>
          </div>
        </div>

        <div className="scenario-outcomes">
          <h4>Projected Outcomes</h4>
          
          <div className="outcome-row">
            <div className="outcome-label">Ecological Health</div>
            <div className="progress-bar" style={{ height: '8px', flex: 1, margin: '0 1rem' }}>
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${ecologicalHealth}%`, 
                  background: ecologicalHealth > 50 ? 'var(--g-500)' : 'var(--error)' 
                }} 
              />
            </div>
            <div className="outcome-value">{Math.round(ecologicalHealth)}/100</div>
          </div>

          <div className="outcome-row">
            <div className="outcome-label">Community Income</div>
            <div className="progress-bar" style={{ height: '8px', flex: 1, margin: '0 1rem' }}>
              <div 
                className="progress-fill" 
                style={{ 
                  width: `${communityIncome}%`, 
                  background: communityIncome > 50 ? 'var(--info)' : 'var(--error)' 
                }} 
              />
            </div>
            <div className="outcome-value">{Math.round(communityIncome)}/100</div>
          </div>

          <div className={`scenario-feedback ${isOptimal ? 'feedback-success' : 'feedback-warn'}`}>
            {isOptimal ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
            <span style={{ fontSize: '.85rem' }}>
              {isOptimal 
                ? "Optimal Balance Reached! The system is resilient." 
                : "Imbalance Detected: Adjust policies to ensure neither ecology nor communities collapse."
              }
            </span>
          </div>
        </div>
      </div>
      
      <div className="scenario-footer">
        <Info size={16} color="var(--grey-400)" />
        <span className="text-xs text-muted">This simulation represents a simplified socioecological system. In reality, dynamics are non-linear.</span>
      </div>
    </div>
  );
}

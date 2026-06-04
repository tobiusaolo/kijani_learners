import './gamification.css';

export default function GrowthChart({ assessments = [] }) {
  const baseline = assessments.find((a) => a.type === 'baseline');
  const endline = assessments.find((a) => a.type === 'endline');

  if (!baseline && !endline) {
    return (
      <p className="text-sm text-muted">Complete baseline and endline assessments to see your growth.</p>
    );
  }

  const bScore = baseline?.systems_thinking_score ?? 0;
  const eScore = endline?.systems_thinking_score ?? null;
  const growth = eScore != null ? eScore - bScore : null;

  return (
    <div className="growth-chart">
      <div className="growth-bars">
        <div className="growth-bar-col">
          <div className="growth-bar-track">
            <div className="growth-bar-fill baseline" style={{ height: `${bScore}%` }} />
          </div>
          <span className="growth-bar-label">Baseline</span>
          <span className="growth-bar-value">{bScore}%</span>
        </div>
        {eScore != null && (
          <div className="growth-bar-col">
            <div className="growth-bar-track">
              <div className="growth-bar-fill endline" style={{ height: `${eScore}%` }} />
            </div>
            <span className="growth-bar-label">Endline</span>
            <span className="growth-bar-value">{eScore}%</span>
          </div>
        )}
      </div>
      {growth != null && (
        <p className={`growth-delta ${growth >= 0 ? 'positive' : ''}`}>
          {growth >= 0 ? '▲' : '▼'} {Math.abs(growth)} point{Math.abs(growth) !== 1 ? 's' : ''} systems thinking growth
        </p>
      )}
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle, Lock, Play, Loader } from 'lucide-react';
import LearnerLayout from '../../components/LearnerLayout';
import { getModules } from '../../api/cachedLearnerApi';
import { cachedData, showPageLoading } from '../../utils/staleLoad';
import './Modules.css';

const MODULE_EMOJIS = {
  1: '🌿', 2: '🤝', 3: '🦁', 4: '🌍', 5: '🛰️', 6: '✨'
};

const MODULE_COLORS = {
  1: '#1a5c38', 2: '#2e8b57', 3: '#4caf7d', 4: '#237048', 5: '#0d3320', 6: '#1a5c38'
};

export default function Modules() {
  const mapMods = (list) =>
    (list || []).map((m) => ({
      ...m,
      emoji: MODULE_EMOJIS[m.id] || '📚',
      color: MODULE_COLORS[m.id] || '#2e8b57',
      num: String(m.id).padStart(2, '0'),
      progress: m.progress_pct ?? m.progress ?? 0,
    }));

  const [modules, setModules] = useState(() => mapMods(cachedData('modules:list', 'modules')));
  const [loading, setLoading] = useState(() => showPageLoading('modules:list', 'modules'));

  useEffect(() => {
    getModules()
      .then((res) => setModules(mapMods(res.data)))
      .catch((err) => console.error('Failed to load modules', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <LearnerLayout title="My Modules" subtitle="Your Kijani Learning Journey">
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', color: 'var(--grey-400)' }}>
          <Loader size={24} style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ marginLeft: '10px' }}>Loading Modules…</span>
        </div>
      ) : (
        <div className="modules-page-grid">
          {modules.map(m => (
            <div key={m.id} className={`module-grid-card ${m.status} ${m.status === 'completed' ? 'mg-complete-glow' : ''}`}>
              <div className="mg-card-top" style={{ borderTopColor: m.color }}>
                <div className="mg-header">
                  <span className="mg-num" style={{ color: m.color }}>MODULE {m.num}</span>
                  {m.status === 'completed' && <CheckCircle size={18} color="var(--k-500)" />}
                  {m.status === 'locked' && <Lock size={16} color="var(--grey-400)" />}
                </div>
                <div className="mg-emoji">{m.emoji}</div>
                <h3 className="mg-title">{m.title}</h3>
                <p className="mg-desc">{m.description || m.desc || 'A module in the Kijani learning journey.'}</p>
                {m.status === 'locked' && m.lock_reason && (
                  <p className="mg-lock-hint">{m.lock_reason}</p>
                )}
              </div>
              
              <div className="mg-card-bottom">
                {m.status !== 'locked' && (
                  <>
                <div className="mg-progress-row">
                  <span className="text-xs text-muted">Progress</span>
                  <span className="text-xs font-semibold">{m.progress}%</span>
                </div>
                <div className="progress-bar" style={{ height: '6px', marginBottom: '1rem' }}>
                  <div className="progress-fill" style={{ width: `${m.progress}%`, background: m.progress === 100 ? 'var(--k-500)' : 'linear-gradient(90deg, var(--k-500), var(--k-300))' }} />
                </div>
                  </>
                )}
                
                {m.status === 'completed' ? (
                  <Link to={`/learn/modules/${m.id}`} className="btn btn-outline" style={{ width: '100%' }}>Review Module</Link>
                ) : m.status === 'active' ? (
                  <Link to={`/learn/modules/${m.id}`} className="btn btn-primary" style={{ width: '100%' }}>
                    <Play size={15} /> Continue Learning
                  </Link>
                ) : (
                  <>
                    {m.unlocks_after_module_id && (
                      <Link
                        to={`/learn/modules/${m.unlocks_after_module_id}`}
                        className="btn btn-outline btn-sm"
                        style={{ width: '100%', marginBottom: '0.5rem' }}
                      >
                        Go to Module {String(m.unlocks_after_module_id).padStart(2, '0')}
                      </Link>
                    )}
                    <button className="btn btn-ghost" style={{ width: '100%' }} disabled title={m.lock_reason || undefined}>
                      <Lock size={14} /> Locked
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </LearnerLayout>
  );
}

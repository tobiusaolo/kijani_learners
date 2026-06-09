import { useState, useEffect } from 'react';
import { Calendar, Video, Loader, CheckCircle } from 'lucide-react';
import LearnerLayout from '../../components/LearnerLayout';
import { getWebinars, rsvpWebinar } from '../../api/cachedLearnerApi';
import { cachedData, showPageLoading } from '../../utils/staleLoad';
import { showError, apiErrorMessage } from '../../utils/swal';
import { runGamificationEvent } from '../../utils/gamificationRunner';
import './Webinars.css';

export default function Webinars() {
  const [webinars, setWebinars] = useState(() => cachedData('webinars:list', 'webinars') || []);
  const [loading, setLoading] = useState(() => showPageLoading('webinars:list', 'webinars'));
  const [rsvping, setRsvping] = useState(null);

  useEffect(() => {
    getWebinars()
      .then(res => setWebinars(res.data || []))
      .catch(err => console.error('Failed to load webinars', err))
      .finally(() => setLoading(false));
  }, []);

  const handleRsvp = async (id) => {
    setRsvping(id);
    try {
      await rsvpWebinar(id);
      const res = await getWebinars();
      setWebinars(res.data || []);
      runGamificationEvent('webinar_rsvp', { hasRsvp: true });
    } catch (err) {
      showError('RSVP failed', apiErrorMessage(err, 'Could not RSVP.'));
    } finally {
      setRsvping(null);
    }
  };

  return (
    <LearnerLayout title="Reflection Webinars" subtitle="Structured peer-learning sessions">
      {loading ? (
        <div className="webinars-page webinars-loading">
          <Loader size={28} className="spin" />
        </div>
      ) : webinars.length === 0 ? (
        <div className="webinars-page">
          <div className="card webinars-empty">
            <Video size={40} color="var(--grey-400)" />
            <h3>No webinars scheduled yet</h3>
            <p className="text-muted">Check back soon for reflection webinar dates.</p>
          </div>
        </div>
      ) : (
        <div className="webinars-page">
          <div className="webinars-list">
            {webinars.map(w => (
            <div key={w.id} className="card webinar-card">
              <div className="webinar-card-body">
                <h3 className="webinar-title">{w.title}</h3>
                {w.description && <p className="webinar-description text-muted">{w.description}</p>}
                <div className="webinar-meta">
                  <Calendar size={14} aria-hidden />
                  <span>{w.scheduled_at ? new Date(w.scheduled_at).toLocaleString() : 'TBC'}</span>
                  {w.duration_minutes && <span> · {w.duration_minutes} min</span>}
                </div>
              </div>
              <div className="webinar-actions">
                {w.has_rsvped ? (
                  <span className="badge badge-success"><CheckCircle size={14} /> RSVP'd</span>
                ) : (
                  <button className="btn btn-primary btn-sm" disabled={rsvping === w.id} onClick={() => handleRsvp(w.id)}>
                    {rsvping === w.id ? 'Saving…' : 'RSVP'}
                  </button>
                )}
                {w.zoom_url && (
                  <a href={w.zoom_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm">
                    Join Link
                  </a>
                )}
              </div>
            </div>
            ))}
          </div>
        </div>
      )}
    </LearnerLayout>
  );
}

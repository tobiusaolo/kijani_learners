import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Award, TrendingUp, Clock, ArrowRight, CheckCircle, Lock, Play, Calendar, MessageSquare, Star, Target, Loader } from 'lucide-react';
import LearnerLayout from '../../components/LearnerLayout';
import BalanceRing from '../../components/BalanceRing';
import OnboardingOverlay from '../../components/OnboardingOverlay';
import JourneyRail from '../../components/gamification/JourneyRail';
import MissionCard from '../../components/gamification/MissionCard';
import PhaseBadge from '../../components/gamification/PhaseBadge';
import BadgeShelf from '../../components/gamification/BadgeShelf';
import { useBadges } from '../../hooks/useBadges';
import { getModules, getWebinars } from '../../api/cachedLearnerApi';
import { cachedData, showPageLoading } from '../../utils/staleLoad';
import { isOnboardingDone, setOnboardingDone } from '../../utils/onboardingStorage';
import CacheStatus from '../../components/CacheStatus';
import { useAuth } from '../../contexts/AuthContext';
import { getDisplayName } from '../../utils/profileDisplay';
import { useLearnerAvatar } from '../../hooks/useLearnerAvatar';
import { useGamification } from '../../hooks/useGamification';
import LearnerAvatar from '../../components/LearnerAvatar';
import DashboardScene from '../../components/avatars/DashboardScene';
import '../../components/gamification/gamification.css';
import './LearnerDashboard.css';

export default function LearnerDashboard() {
  const [showOnboarding, setShowOnboarding] = useState(() => !isOnboardingDone());
  const mapModules = (list) =>
    (list || []).map((m) => ({
      ...m,
      num: String(m.id).padStart(2, '0'),
      progress: m.progress_pct ?? m.progress ?? 0,
    }));

  const [modules, setModules] = useState(() => mapModules(cachedData('modules:list', 'modules')));
  const [nextWebinar, setNextWebinar] = useState(null);
  const [loading, setLoading] = useState(() => showPageLoading('modules:list', 'modules'));
  const [revalidating, setRevalidating] = useState(false);
  const { user, profile } = useAuth();
  const { avatarId, avatarMeta } = useLearnerAvatar();
  const { journeyNodes, phase, mission, mastery } = useGamification(modules);
  const { unlockedIds } = useBadges();

  const pickNextWebinar = (list) => {
    const now = new Date();
    const upcoming = (list || [])
      .filter((w) => w.scheduled_at && new Date(w.scheduled_at) >= now)
      .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));
    return upcoming[0] || null;
  };

  useEffect(() => {
    const cachedWeb = cachedData('webinars:list', 'webinars');
    if (cachedWeb) setNextWebinar(pickNextWebinar(cachedWeb));

    if (!showPageLoading('modules:list', 'modules')) setRevalidating(true);

    getModules()
      .then((res) => setModules(mapModules(res.data)))
      .catch((err) => console.error('Failed to load modules', err))
      .finally(() => {
        setLoading(false);
        setRevalidating(false);
      });

    getWebinars()
      .then((res) => setNextWebinar(pickNextWebinar(res.data)))
      .catch(() => {});
  }, []);

  const completedModules = modules.filter(m => m.status === 'completed').length;
  const overall = Math.round((completedModules / (modules.length || 1)) * 100);
  const activeModule = modules.find(m => m.status === 'active') || modules.find(m => m.status === 'locked') || modules[modules.length - 1];

  const displayName = getDisplayName(profile, user);
  const firstName = profile?.firstName || (user?.email ? user.email.split('@')[0] : 'Learner');

  const avgQuizDisplay = mastery.avgQuiz != null ? `${mastery.avgQuiz}%` : '—';
  const avgQuizSub = mastery.quizCount > 0 ? `Across ${mastery.quizCount} quizzes` : 'Complete a quiz to track';
  const timeDisplay = mastery.totalMinutes > 0 ? `${mastery.totalMinutes} min` : '—';
  const timeSub = mastery.totalMinutes > 0 ? 'On this device' : 'Time adds as you learn';

  const finishOnboarding = () => {
    setOnboardingDone();
    setShowOnboarding(false);
  };

  if (loading) {
    return (
      <LearnerLayout title="My Dashboard" subtitle={`Welcome back, ${displayName} 👋`}>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px', color: 'var(--grey-400)' }}>
          <Loader size={24} style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ marginLeft: '10px' }}>Loading Dashboard…</span>
        </div>
      </LearnerLayout>
    );
  }

  return (
    <LearnerLayout title="My Dashboard" subtitle={`Welcome back, ${firstName} 👋`}>
      <CacheStatus revalidating={revalidating} />
      {showOnboarding && <OnboardingOverlay onComplete={finishOnboarding} />}

      <section className="dash-welcome-band card">
        <div className="dash-welcome-scene">
          <DashboardScene />
        </div>
        <div className="dash-welcome-body">
          <LearnerAvatar avatarId={avatarId} size="lg" showRing />
          <div>
            <p className="dash-welcome-eyebrow">Your Terrascape journey</p>
            <h3 className="dash-welcome-title">Welcome back, {firstName}</h3>
            <p className="dash-welcome-sub">
              <PhaseBadge phase={phase} /> · exploring as <strong>{avatarMeta.label}</strong>
            </p>
            <Link to="/learn/profile" className="btn btn-outline btn-sm" style={{ marginTop: '0.75rem' }}>
              Change character
            </Link>
          </div>
        </div>
      </section>

      <JourneyRail nodes={journeyNodes} />

      <div className="dashboard-grid">

        <div className="dash-stats-row">
          {[
            { icon: TrendingUp, label: 'Overall Progress', value: `${overall}%`, sub: `${completedModules} of ${modules.length} modules done`, color: 'var(--g-500)' },
            { icon: Star,       label: 'Quiz Strength',   value: avgQuizDisplay, sub: avgQuizSub, color: '#f59e0b' },
            { icon: Clock,      label: 'Time Invested',    value: timeDisplay, sub: timeSub, color: 'var(--info)' },
            { icon: Target,     label: 'Current Module',   value: activeModule ? `Module ${activeModule.id}` : 'All done!', sub: activeModule?.title || 'Congratulations', color: 'var(--g-400)' },
          ].map((s, i) => (
            <div key={i} className="dash-stat-card">
              <div className="dash-stat-icon icon-surface">
                <s.icon size={20} />
              </div>
              <div>
                <div className="dash-stat-value">{s.value}</div>
                <div className="dash-stat-label">{s.label}</div>
                <div className="dash-stat-sub">{s.sub}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="dash-left">
          <MissionCard mission={mission} />

          <div className="card">
            <div className="dash-card-header">
              <h4>Journey Progress</h4>
              <span className="badge badge-brand">{completedModules}/{modules.length} Complete</span>
            </div>
            <div className="journey-bar-wrap">
              <div className="progress-bar" style={{ height: '12px', marginBottom: '0.5rem' }}>
                <div className="progress-fill" style={{ width: `${overall}%` }} />
              </div>
              <div className="journey-bar-labels">
                <span className="text-sm text-muted">Start</span>
                <span className="text-sm font-semibold text-primary">{overall}% Complete</span>
                <span className="text-sm text-muted">Certificate</span>
              </div>
            </div>
            <div className="module-progress-list">
              {modules.map(m => (
                <div key={m.id} className={`module-prog-item ${m.status}`}>
                  <div className="mod-prog-info">
                    <div className="mod-prog-title">
                      <span className="mod-prog-num">{m.num}</span>
                      {m.title}
                    </div>
                    <div className="progress-bar" style={{ height: '5px', marginTop: '6px' }}>
                      <div className="progress-fill" style={{ width: `${m.progress || 0}%` }} />
                    </div>
                  </div>
                  <div className="mod-prog-right">
                    {m.status === 'completed' && <span className="icon-surface icon-surface-sm"><CheckCircle size={14} /></span>}
                    {m.status === 'active' && <span className="badge badge-warn" style={{ fontSize: '.7rem' }}>{m.progress || 0}%</span>}
                    {m.status === 'locked' && <span className="icon-surface icon-surface-sm" style={{ opacity: 0.55 }}><Lock size={14} /></span>}
                  </div>
                </div>
              ))}
            </div>
            {activeModule && (
              <Link to={`/learn/modules/${activeModule.id}`} className="btn btn-primary" style={{ width: '100%', marginTop: '1.25rem' }}>
                Continue Module {activeModule.id} <ArrowRight size={16} />
              </Link>
            )}
          </div>

          <BalanceRing progress={overall} modules={modules} />
        </div>

        <div className="dash-right">
          <BadgeShelf unlockedIds={unlockedIds} />

          {activeModule && (
            <div className="card card-brand dash-next-card">
              <div style={{ fontSize: '.75rem', fontWeight: 700, letterSpacing: '.08em', color: 'rgba(255,255,255,.6)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Next Up</div>
              <h4 style={{ color: 'var(--white)', marginBottom: '0.25rem' }}>Module {activeModule.id}</h4>
              <p style={{ color: 'rgba(255,255,255,.7)', fontSize: '.88rem', marginBottom: '1rem' }}>{activeModule.title} — {activeModule.progress || 0}% complete</p>
              <div className="progress-bar" style={{ background: 'rgba(255,255,255,.2)', marginBottom: '1rem' }}>
                <div className="progress-fill" style={{ width: `${activeModule.progress || 0}%`, background: 'rgba(255,255,255,.8)' }} />
              </div>
              <Link to={`/learn/modules/${activeModule.id}`} className="btn btn-dark" style={{ width: '100%', background: 'rgba(0,0,0,.3)', color: 'var(--white)' }}>
                <Play size={15} /> Resume
              </Link>
            </div>
          )}

          <div className="card" style={{ marginTop: '1.25rem' }}>
            <div className="dash-card-header">
              <h4>Upcoming Webinar</h4>
              <span className="icon-surface icon-surface-sm"><Calendar size={14} /></span>
            </div>
            {nextWebinar ? (
              <>
                <div className="webinar-card-inner">
                  <div className="webinar-date-badge">
                    <span className="webinar-date-day">
                      {new Date(nextWebinar.scheduled_at).getDate()}
                    </span>
                    <span className="webinar-date-mon">
                      {new Date(nextWebinar.scheduled_at).toLocaleString('en', { month: 'short' }).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p style={{ font: 'bold .92rem/1.4 var(--font-display)', color: 'var(--g-800)' }}>{nextWebinar.title}</p>
                    <p style={{ fontSize: '.8rem', color: 'var(--grey-500)', marginTop: '4px' }}>
                      {new Date(nextWebinar.scheduled_at).toLocaleString()}
                    </p>
                  </div>
                </div>
                <Link to="/learn/webinars" className="btn btn-outline btn-sm" style={{ width: '100%', marginTop: '1rem', display: 'block', textAlign: 'center' }}>
                  {nextWebinar.has_rsvped ? 'View Webinars' : 'RSVP Now'}
                </Link>
              </>
            ) : (
              <p className="text-sm text-muted" style={{ padding: '0.5rem 0' }}>No upcoming webinars scheduled.</p>
            )}
          </div>

          <div className="card" style={{ marginTop: '1.25rem' }}>
            <h4 style={{ marginBottom: '1rem' }}>Quick Actions</h4>
            <div className="quick-links">
              {[
                { icon: BookOpen, label: 'All Modules', to: '/learn/modules' },
                { icon: Award, label: 'My Certificate', to: '/learn/certificate' },
                { icon: Calendar, label: 'Webinars', to: '/learn/webinars' },
                { icon: MessageSquare, label: 'Discussion Forum', to: '/learn/forum' },
              ].map(({ icon: Icon, label, to }) => (
                <Link key={to} to={to} className="quick-link-item">
                  <div className="quick-link-icon icon-surface"><Icon size={16} /></div>
                  <span>{label}</span>
                  <ArrowRight size={14} style={{ marginLeft: 'auto' }} />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </LearnerLayout>
  );
}

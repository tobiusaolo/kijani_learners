/* ============================================================
   LEARNER LAYOUT & SIDEBAR
   ============================================================ */
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Mic2, MessageSquare, User,
  Award, Bell, ChevronLeft, ChevronRight, LogOut,
  Leaf, Menu, HardDrive, Calendar,
  // ClipboardList,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getDisplayName, getRoleLine } from '../utils/profileDisplay';
import { useLearnerAvatar } from '../hooks/useLearnerAvatar';
import LearnerAvatar from './LearnerAvatar';
import PhaseBadge from './gamification/PhaseBadge';
import { useGamification } from '../hooks/useGamification';
import NotificationPanel, { useUnreadNotifications } from './gamification/NotificationPanel';
import AppFooter from './AppFooter';
import './LearnerLayout.css';
import './gamification/gamification.css';

const learningNav = [
  { icon: LayoutDashboard, label: 'Dashboard',    path: '/learn/dashboard' },
  { icon: BookOpen,        label: 'My Modules',   path: '/learn/modules' },
  // { icon: ClipboardList,   label: 'Assessments',  path: '/learn/assessment' },
  { icon: Mic2,            label: 'Storytelling', path: '/learn/storytelling' },
  { icon: MessageSquare,   label: 'Forum',        path: '/learn/forum' },
  { icon: Calendar,        label: 'Webinars',     path: '/learn/webinars' },
  { icon: HardDrive,       label: 'Offline Hub',  path: '/learn/offline' },
  { icon: Award,           label: 'Certificate',  path: '/learn/certificate' },
];

const accountNav = [
  { icon: User, label: 'Profile', path: '/learn/profile' },
];

function isNavActive(pathname, path) {
  // if (path === '/learn/assessment') {
  //   return pathname.startsWith('/learn/assessment');
  // }
  return pathname === path;
}

export default function LearnerLayout({ children, title, subtitle }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const unreadNotifs = useUnreadNotifications();
  const location = useLocation();
  const { user, profile, logout } = useAuth();

  const displayName = getDisplayName(profile, user);
  const roleLine = getRoleLine(profile);
  const { avatarId } = useLearnerAvatar();
  const { phase } = useGamification([]);

  const closeMobile = () => setMobileOpen(false);

  const renderNavLink = ({ icon: Icon, label, path }) => {
    const active = isNavActive(location.pathname, path);
    return (
      <Link
        key={path}
        to={path}
        className={`sidebar-nav-link ${active ? 'is-active' : ''}`}
        title={collapsed ? label : undefined}
        aria-current={active ? 'page' : undefined}
        onClick={closeMobile}
      >
        <span className="sidebar-nav-icon icon-surface" aria-hidden>
          <Icon size={18} strokeWidth={active ? 2.25 : 2} />
        </span>
        {!collapsed && <span className="sidebar-nav-text">{label}</span>}
      </Link>
    );
  };

  return (
    <div className={`learner-layout ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {mobileOpen && <div className="mobile-overlay" onClick={closeMobile} role="presentation" />}

      <aside
        className={`learner-sidebar ${mobileOpen ? 'mobile-open' : ''}`}
        aria-label="Learner navigation"
      >
        <header className="sidebar-header">
          <Link to="/learn/dashboard" className="sidebar-brand" onClick={closeMobile}>
            <span className="sidebar-brand-mark icon-surface">
              <Leaf size={20} />
            </span>
            {!collapsed && (
              <span className="sidebar-brand-copy">
                <span className="sidebar-brand-title">Kijani Terrascape</span>
                <span className="sidebar-brand-tag">Digital Learning Journey</span>
              </span>
            )}
          </Link>
          <button
            type="button"
            className="sidebar-collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </header>

        <nav className="sidebar-nav">
          <div className="sidebar-nav-group">
            {!collapsed && <span className="sidebar-nav-heading">Learn</span>}
            <div className="sidebar-nav-list">
              {learningNav.map(renderNavLink)}
            </div>
          </div>

          <div className="sidebar-nav-group">
            {!collapsed && <span className="sidebar-nav-heading">Account</span>}
            <div className="sidebar-nav-list">
              {accountNav.map(renderNavLink)}
            </div>
          </div>
        </nav>

        <footer className={`sidebar-footer ${collapsed ? 'sidebar-footer--collapsed' : ''}`}>
          <div className="sidebar-profile">
            <Link
              to="/learn/profile"
              className="sidebar-profile-link"
              title={collapsed ? `${displayName} — Profile` : undefined}
              onClick={closeMobile}
            >
              <LearnerAvatar
                avatarId={avatarId}
                size="sm"
                className="sidebar-profile-avatar"
                title={displayName}
              />
              {!collapsed && (
                <span className="sidebar-profile-details">
                  <span className="sidebar-profile-name">{displayName}</span>
                  <span className="sidebar-profile-role">{roleLine}</span>
                  <PhaseBadge phase={phase} compact />
                </span>
              )}
            </Link>
          </div>
          <button
            type="button"
            className="sidebar-sign-out"
            onClick={logout}
            title={collapsed ? 'Sign out' : undefined}
          >
            <LogOut size={18} />
            {!collapsed && <span>Sign out</span>}
          </button>
          {!collapsed && (
            <p className="sidebar-footer-meta">© Kijani Terrascape</p>
          )}
        </footer>
      </aside>

      <div className="learner-main">
        <header className="learner-topbar">
          <div className="topbar-left">
            <button
              type="button"
              className="mobile-menu-btn"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={22} />
            </button>
            <div>
              {title && <h2 className="page-title">{title}</h2>}
              {subtitle && <p className="page-subtitle">{subtitle}</p>}
            </div>
          </div>
          <div className="topbar-right">
            <button
              type="button"
              className="topbar-icon-btn icon-surface"
              style={{ position: 'relative' }}
              aria-label="Notifications"
              onClick={() => setNotifOpen((o) => !o)}
            >
              <Bell size={20} />
              {unreadNotifs > 0 && <span className="notif-dot" />}
            </button>
            <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
            <Link to="/learn/profile" className="topbar-avatar-wrap" title="Profile & avatar">
              <LearnerAvatar avatarId={avatarId} size="sm" showRing />
            </Link>
          </div>
        </header>

        <main className="learner-content">{children}</main>
        <AppFooter variant="compact" />
      </div>
    </div>
  );
}

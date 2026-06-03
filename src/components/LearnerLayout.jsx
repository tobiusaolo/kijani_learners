/* ============================================================
   LEARNER LAYOUT & SIDEBAR
   ============================================================ */
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, BookOpen, Mic2, MessageSquare, User,
  Award, Bell, ChevronLeft, ChevronRight, LogOut,
  Leaf, Menu, HardDrive, Calendar
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getDisplayName, getInitials, getRoleLine } from '../utils/profileDisplay';
import './LearnerLayout.css';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard',    path: '/learn/dashboard' },
  { icon: BookOpen,        label: 'My Modules',   path: '/learn/modules' },
  { icon: Mic2,            label: 'Storytelling', path: '/learn/storytelling' },
  { icon: MessageSquare,   label: 'Forum',        path: '/learn/forum' },
  { icon: Calendar,        label: 'Webinars',     path: '/learn/webinars' },
  { icon: HardDrive,       label: 'Offline Hub',  path: '/learn/offline' },
  { icon: Award,           label: 'Certificate',  path: '/learn/certificate' },
];

const bottomItems = [
  { icon: User,       label: 'Profile',  path: '/learn/profile' },
];

export default function LearnerLayout({ children, title, subtitle }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { user, profile, logout } = useAuth();

  const displayName = getDisplayName(profile, user);
  const initials = getInitials(profile, user);
  const roleLine = getRoleLine(profile);

  return (
    <div className={`learner-layout ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {mobileOpen && <div className="mobile-overlay" onClick={() => setMobileOpen(false)} />}

      <aside className={`learner-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">
            <Leaf size={20} />
          </div>
          {!collapsed && (
            <div className="brand-text">
              <span className="brand-name">Kijani</span>
              <span className="brand-sub">Terrascape</span>
            </div>
          )}
        </div>

        <button type="button" className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>

        {!collapsed && (
          <div className="sidebar-user">
            <div className="user-avatar" title={displayName}>{initials}</div>
            <div className="user-info">
              <span className="user-name">{displayName}</span>
              <span className="user-role">{roleLine}</span>
              {user?.email && (
                <span className="user-email" title={user.email}>{user.email}</span>
              )}
            </div>
          </div>
        )}

        {collapsed && (
          <div className="sidebar-user-collapsed" title={displayName}>
            <div className="user-avatar">{initials}</div>
          </div>
        )}

        <nav className="sidebar-nav">
          <span className={`nav-section-label ${collapsed ? 'hidden' : ''}`}>Learning</span>
          {navItems.map(({ icon: Icon, label, path }) => (
            <Link
              key={path}
              to={path}
              className={`nav-item ${location.pathname === path ? 'active' : ''}`}
              title={collapsed ? label : ''}
            >
              <Icon size={19} />
              {!collapsed && <span>{label}</span>}
              {location.pathname === path && !collapsed && <div className="nav-active-dot" />}
            </Link>
          ))}

          <div className="nav-divider" />
          <span className={`nav-section-label ${collapsed ? 'hidden' : ''}`}>Account</span>
          {bottomItems.map(({ icon: Icon, label, path }) => (
            <Link
              key={path}
              to={path}
              className={`nav-item ${location.pathname === path ? 'active' : ''}`}
              title={collapsed ? label : ''}
            >
              <Icon size={19} />
              {!collapsed && <span>{label}</span>}
            </Link>
          ))}
        </nav>

        <button type="button" className="nav-item logout-btn" onClick={logout}>
          <LogOut size={19} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </aside>

      <div className="learner-main">
        <header className="learner-topbar">
          <div className="topbar-left">
            <button type="button" className="mobile-menu-btn" onClick={() => setMobileOpen(true)}>
              <Menu size={22} />
            </button>
            <div>
              {title && <h2 className="page-title">{title}</h2>}
              {subtitle && <p className="page-subtitle">{subtitle}</p>}
            </div>
          </div>
          <div className="topbar-right">
            <button type="button" className="topbar-icon-btn" style={{ position: 'relative' }} aria-label="Notifications">
              <Bell size={20} />
              <span className="notif-dot" />
            </button>
            <div className="topbar-avatar" title={displayName}>{initials}</div>
          </div>
        </header>

        <main className="learner-content">{children}</main>
      </div>
    </div>
  );
}

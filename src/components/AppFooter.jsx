import { Link } from 'react-router-dom';
import { Leaf } from 'lucide-react';
import './AppFooter.css';

export default function AppFooter({ variant = 'compact' }) {
  if (variant === 'full') {
    return (
      <footer className="app-footer app-footer--full">
        <div className="container">
          <div className="app-footer-top">
            <div className="app-footer-brand">
              <div className="app-footer-logo">
                <div className="app-footer-logo-icon icon-surface"><Leaf size={16} /></div>
                <div>
                  <span className="app-footer-logo-name">Kijani Terrascape</span>
                </div>
              </div>
              <p>Strengthening systems thinking and integrated conservation literacy among African youth.</p>
            </div>
            <div className="app-footer-links">
              <div className="app-footer-col">
                <span className="app-footer-col-title">Platform</span>
                <Link to="/apply">Apply</Link>
                <Link to="/login">Sign In</Link>
                <a href="/#modules">Modules</a>
              </div>
              <div className="app-footer-col">
                <span className="app-footer-col-title">Resources</span>
                <a href="#">FAQ</a>
                <a href="#">Support</a>
                <a href="#">Privacy Policy</a>
              </div>
              <div className="app-footer-col">
                <span className="app-footer-col-title">Organisation</span>
                <a href="#">terrascapes.org</a>
                <a href="#">About Us</a>
                <a href="#">Contact</a>
              </div>
            </div>
          </div>
          <div className="app-footer-bottom">
            <span>© 2026 Kijani Terrascape · terrascapes.org</span>
            <span>Built for African Youth Conservation Leaders</span>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="app-footer app-footer--compact">
      <div className="app-footer-compact-inner">
        <span>© 2026 Kijani Terrascape · terrascapes.org</span>
        <span className="app-footer-compact-tagline">Built for African Youth Conservation Leaders</span>
      </div>
    </footer>
  );
}

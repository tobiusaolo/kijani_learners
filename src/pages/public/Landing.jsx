import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play, Users, BookOpen, Award, ChevronDown, Globe, Leaf, Zap, Shield, Star, MapPin } from 'lucide-react';
import AppFooter from '../../components/AppFooter';
import './Landing.css';

const modules = [
  { num: '01', title: 'Area-Based Conservation', desc: 'Protected areas as dynamic governance systems — national parks, community conserved areas, and beyond.', color: '#06402B' },
  { num: '02', title: 'Conservation & Society', desc: 'Human dimensions — culture, indigenous knowledge, gender equity, environmental justice.', color: '#674736' },
  { num: '03', title: 'Species Conservation', desc: 'Ecological science and public perception — population dynamics, keystone species, wildlife trade.', color: '#2a6649' },
  { num: '04', title: 'Nature & Climate', desc: 'Biodiversity meets climate resilience — mangrove restoration, watershed management, agroforestry.', color: '#5a3d2f' },
  { num: '05', title: 'Conservation Technologies', desc: 'Digital innovation — drones, AI species recognition, satellite monitoring, citizen science.', color: '#043528' },
  { num: '06', title: 'Digital Storytelling', desc: 'Synthesise all learning into advocacy outputs. Your voice, your conservation story.', color: '#674736' },
];

const stats = [
  { value: '100', label: 'Youth Leaders', icon: Users },
  { value: '6', label: 'Modules', icon: BookOpen },
  { value: '5', label: 'Conservation Themes', icon: Globe },
  { value: '2hr', label: 'Immersive Journey', icon: Zap },
];

const testimonials = [
  { name: 'Fatoumata Diallo', role: 'Environmental Activist, Senegal', quote: 'This journey transformed how I see the connection between people and nature. The systems thinking approach is something I use every day in my advocacy work.', initials: 'FD' },
  { name: 'Kofi Mensah', role: 'Wildlife Ranger, Ghana', quote: 'The technology module opened my eyes to tools I didn\'t know existed. Now our patrol team uses drone monitoring — it came from what I learned here.', initials: 'KM' },
  { name: 'Amara Osei', role: 'Community Leader, Kenya', quote: 'For the first time, I could see how my community\'s livelihood connects to the larger conservation picture. Incredibly empowering.', initials: 'AO' },
];

export default function Landing() {
  const [scrolled, setScrolled] = useState(false);
  const [activeModule, setActiveModule] = useState(0);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <div className="landing">
      {/* Navbar */}
      <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-inner">
          <Link to="/" className="nav-logo">
            <div className="nav-logo-icon icon-surface"><Leaf size={18} /></div>
            <div>
              <span className="nav-logo-name">Kijani</span>
              <span className="nav-logo-sub">Terrascape</span>
            </div>
          </Link>
          <div className="nav-links">
            <a href="#modules">Modules</a>
            <a href="#stories">Stories</a>
            <Link to="/apply" className="btn btn-sm nav-apply-btn">Apply Now</Link>
            <Link to="/login" className="btn btn-primary btn-sm">Sign In</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="hero">
        <div className="hero-bg">
          <div className="hero-orb hero-orb-1" />
          <div className="hero-orb hero-orb-2" />
          <div className="hero-grid" />
        </div>
        <div className="container">
          <h1 className="hero-headline animate-fade-up">
            Where African Youth<br />
            <span className="hero-headline-brand">Shape Conservation</span><br />
            Futures
          </h1>
          <p className="hero-desc animate-fade-up delay-200">
            A 2-hour immersive digital learning journey across five interconnected conservation themes.
            Build systems thinking. Create impact. Tell your story.
          </p>
          <div className="hero-ctas animate-fade-up delay-300">
            <Link to="/apply" className="btn btn-primary btn-lg">
              Start Your Journey <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn-play">
              <div className="play-circle"><Play size={16} fill="white" /></div>
              <span>Watch Overview</span>
            </Link>
          </div>

          {/* Stats Row */}
          <div className="hero-stats animate-fade-up delay-400">
            {stats.map(({ value, label, icon: Icon }) => (
              <div key={label} className="hero-stat">
                <div className="hero-stat-icon icon-surface"><Icon size={16} /></div>
                <span className="hero-stat-value">{value}</span>
                <span className="hero-stat-label">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="scroll-hint">
          <ChevronDown size={20} />
        </div>
      </section>

      {/* Modules */}
      <section className="modules-section" id="modules">
        <div className="container">
          <div className="section-header text-center">
            <div className="section-tag">Curriculum</div>
            <h2>Six Modules. One Journey.</h2>
            <p>Each module is self-paced with essays, videos, quizzes, and reflective exercises.</p>
          </div>
          <div className="modules-grid">
            {modules.map((mod, i) => (
              <div
                key={i}
                className={`module-card ${activeModule === i ? 'active' : ''}`}
                onClick={() => setActiveModule(i)}
              >
                <div className="module-card-num" style={{ color: mod.color }}>{mod.num}</div>
                <h4 className="module-card-title">{mod.title}</h4>
                <p className="module-card-desc">{mod.desc}</p>
                <div className="module-card-tag">
                  <BookOpen size={12} /> Essay · Video · Quiz · Reflection
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="how-section">
        <div className="container">
          <div className="section-header text-center">
            <div className="section-tag">Process</div>
            <h2>Your Learning Path</h2>
          </div>
          <div className="how-steps">
            {[
              { step: '01', title: 'Apply & Enrol', desc: 'Submit your application. Selected cohort members receive access to the platform.', icon: '📋' },
              { step: '02', title: 'Complete Baseline', desc: 'Take the systems thinking baseline assessment to measure your starting point.', icon: '📊' },
              { step: '03', title: 'Learn Across 6 Modules', desc: 'Progress through immersive modules at your own pace. Complete quizzes to unlock next steps.', icon: '🎓' },
              { step: '04', title: 'Tell Your Story', desc: 'Create a digital advocacy output that communicates integrated conservation solutions.', icon: '🎙️' },
              { step: '05', title: 'Earn Your Certificate', desc: 'Complete the endline assessment, receive your certificate, and join the alumni network.', icon: '🏆' },
            ].map((s, i) => (
              <div key={i} className="how-step">
                <div className="how-step-num">{s.step}</div>
                <div className="how-step-emoji">{s.icon}</div>
                <h4>{s.title}</h4>
                <p>{s.desc}</p>
                {i < 4 && <div className="how-step-arrow" />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section" id="stories">
        <div className="container">
          <div className="section-header text-center">
            <div className="section-tag">Voices</div>
            <h2>From the Cohort</h2>
            <p>What learners say after completing their Kijani journey.</p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((t, i) => (
              <div key={i} className="testimonial-card">
                <div className="testimonial-stars">
                  {[...Array(5)].map((_, s) => <Star key={s} size={14} fill="var(--k-400)" color="var(--k-400)" />)}
                </div>
                <p className="testimonial-quote">"{t.quote}"</p>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.initials}</div>
                  <div>
                    <span className="testimonial-name">{t.name}</span>
                    <span className="testimonial-role"><MapPin size={11} /> {t.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-card">
            <div className="cta-orb" />
            <span className="icon-surface icon-surface-lg" style={{ marginBottom: '1rem' }}><Shield size={26} /></span>
            <h2>Ready to Shape Conservation?</h2>
            <p>Join 100 African youth on a transformative digital learning journey.</p>
            <div className="cta-btns">
              <Link to="/apply" className="btn btn-primary btn-lg">Apply for Cohort 1</Link>
              <Link to="/login" className="btn btn-outline btn-lg" style={{ borderColor: 'rgba(255,255,255,.4)', color: 'var(--white)' }}>
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      <AppFooter variant="full" />
    </div>
  );
}

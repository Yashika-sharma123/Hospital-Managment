import { Sparkles } from 'lucide-react';
import LanguageToggle from './LanguageToggle';
import { useLanguage } from '../../context/LanguageContext';

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
  else window.scrollTo({ top: 0, behavior: 'smooth' });
};

export default function Navbar() {
  const { t } = useLanguage();

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            background: 'var(--gradient-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Sparkles size={20} color="#fff" />
        </div>
        <div>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 16, color: 'var(--ink)' }}>{t('hospitalName')}</p>
          <p style={{ margin: 0, fontSize: 11.5, color: 'var(--ink-soft)' }}>AI Queue System</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 28 }} className="navbar-links">
        <button onClick={() => scrollTo('top')} className="nav-link-btn">Home</button>
        <button onClick={() => scrollTo('departments-section')} className="nav-link-btn">Departments</button>
        <button onClick={() => scrollTo('about-section')} className="nav-link-btn">About</button>
        <button onClick={() => scrollTo('contact-section')} className="nav-link-btn">Contact</button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <LanguageToggle />
        <a href="/login" className="btn btn-primary" style={{ textDecoration: 'none', fontSize: 13, padding: '10px 18px' }}>
          Staff Login
        </a>
      </div>
    </nav>
  );
}
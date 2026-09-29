import { Twitter, Instagram, Facebook, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

const scrollTo = (id) => {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
};

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="dark-footer" id="about-section">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 32,
          maxWidth: 1000,
          margin: '0 auto',
        }}
      >
        {/* Brand column */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div
              style={{
                width: 38, height: 38, borderRadius: 10, background: 'var(--gradient-primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <span style={{ color: '#fff', fontSize: 16 }}>✦</span>
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 700, color: '#fff', fontSize: 14.5 }}>{t('hospitalName')}</p>
              <p style={{ margin: 0, fontSize: 11, color: '#a5a3d6' }}>AI Queue System</p>
            </div>
          </div>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: '#b7b6de', marginBottom: 18 }}>
            Reducing patient wait times through smart, AI-assisted queue management — so you spend
            less time in line and more time being cared for.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <a href="#" className="footer-social" aria-label="Twitter"><Twitter size={15} /></a>
            <a href="#" className="footer-social" aria-label="Instagram"><Instagram size={15} /></a>
            <a href="#" className="footer-social" aria-label="Facebook"><Facebook size={15} /></a>
          </div>
        </div>

        {/* Quick links column */}
        <div>
          <h4>Quick Links</h4>
          <button className="footer-link" onClick={() => scrollTo('departments-section')}>› Book Token</button>
          <button className="footer-link" onClick={() => scrollTo('departments-section')}>› General OPD</button>
          <button className="footer-link" onClick={() => scrollTo('departments-section')}>› Lab Tests</button>
          <button className="footer-link" onClick={() => scrollTo('departments-section')}>› Pharmacy</button>
          <button className="footer-link" onClick={() => scrollTo('departments-section')}>› Billing Counter</button>
          <a href="/login">› Staff / Admin Login</a>
        </div>

        {/* Contact column */}
        <div id="contact-section">
          <h4>Contact Us</h4>
          <div style={{ display: 'flex', gap: 10, marginBottom: 14, fontSize: 13.5, color: '#c7c6ea' }}>
            <MapPin size={15} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>123 Hospital Road, Jaipur, Rajasthan</span>
          </div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 14, fontSize: 13.5, color: '#c7c6ea' }}>
            <Phone size={15} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>+91 98765 43210</span>
          </div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 14, fontSize: 13.5, color: '#c7c6ea' }}>
            <Mail size={15} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>care@sbmhospital.example</span>
          </div>
          <div style={{ display: 'flex', gap: 10, fontSize: 13.5, color: '#c7c6ea' }}>
            <Clock size={15} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>Mon–Sat: 8 AM – 8 PM</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom" style={{ maxWidth: 1000, margin: '32px auto 0' }}>
        <span>© {new Date().getFullYear()} {t('hospitalName')}. Built for demonstration purposes.</span>
        <div style={{ display: 'flex', gap: 18 }}>
          <span>Privacy Policy</span>
          <span>Terms of Use</span>
          <span>Accessibility</span>
        </div>
      </div>
    </footer>
  );
}
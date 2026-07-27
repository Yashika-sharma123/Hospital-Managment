import { Building2, Phone, Mail, MapPin } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <div style={{ marginTop: 40 }}>
      <div className="aurora-card" style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <Building2 size={16} color="var(--indigo)" />
          <h2 style={{ fontSize: 14 }}>About {t('hospitalName')}</h2>
        </div>
        <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', lineHeight: 1.6, margin: 0 }}>
          {t('hospitalName')} is committed to reducing patient wait times through smart, AI-assisted
          queue management — so you spend less time standing in line and more time being cared for.
          Our token system covers General OPD, Billing, Pharmacy, and Lab Tests, with live wait-time
          estimates and a fair, priority-aware queue for every patient.
        </p>
      </div>

      <div className="aurora-card">
        <h2 style={{ fontSize: 14, marginBottom: 12 }}>Contact Us</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <MapPin size={15} color="var(--ink-soft)" />
            <span style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>123 Hospital Road, Jaipur, Rajasthan</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Phone size={15} color="var(--ink-soft)" />
            <span style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>+91 98765 43210</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Mail size={15} color="var(--ink-soft)" />
            <span style={{ fontSize: 12.5, color: 'var(--ink-soft)' }}>care@sbmhospital.example</span>
          </div>
        </div>
      </div>

      <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--ink-soft)', marginTop: 20 }}>
        © {new Date().getFullYear()} {t('hospitalName')}. Built for demonstration purposes.
      </p>
    </div>
  );
}

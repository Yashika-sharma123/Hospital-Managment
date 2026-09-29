import { Sparkles } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

// `children` renders on the right side — pass whatever actions that
// page needs (language toggle, logout button, staff console label, etc.)
export default function BrandHeader({ children, subtitle }) {
  const { t } = useLanguage();

  return (
    <div
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
          <p style={{ margin: 0, fontSize: 11.5, color: 'var(--ink-soft)' }}>{subtitle || 'AI Queue System'}</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>{children}</div>
    </div>
  );
}
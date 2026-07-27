import { Stethoscope, Receipt, Pill, FlaskConical, ArrowRight } from 'lucide-react';

const ICON_MAP = {
  A: Stethoscope,
  B: Receipt,
  C: Pill,
  D: FlaskConical,
};

export default function ServiceList({ services, onSelect }) {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {services.map((s, i) => {
        const Icon = ICON_MAP[s.code] || Stethoscope;
        return (
          <button
            key={s._id}
            onClick={() => onSelect(s)}
            className="aurora-card hover-lift stagger-item"
            style={{
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              '--delay': `${i * 0.06}s`,
            }}
          >
            <div
              style={{
                width: 44, height: 44, borderRadius: 12, background: 'var(--gradient-soft)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >
              <Icon size={20} color="var(--indigo)" />
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 600, margin: 0, fontSize: 14 }}>{s.name}</p>
              <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', margin: '3px 0 0' }}>{s.description}</p>
            </div>
            <ArrowRight size={18} color="var(--ink-soft)" />
          </button>
        );
      })}
    </div>
  );
}

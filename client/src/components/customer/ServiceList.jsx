import { useState } from 'react';
import { Monitor, Activity, LayoutGrid, ShoppingCart, ArrowRight } from 'lucide-react';

const ICON_MAP = {
  B: Monitor,       // Billing Counter
  A: Activity,      // General OPD
  D: LayoutGrid,    // Lab Tests
  C: ShoppingCart,  // Pharmacy
};

export default function ServiceList({ services, onSelect }) {
  const [hoveredId, setHoveredId] = useState(null);

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {services.map((s, i) => {
        const Icon = ICON_MAP[s.code] || Monitor;
        const isHovered = hoveredId === s._id;
        return (
          <button
            key={s._id}
            onClick={() => onSelect(s)}
            onMouseEnter={() => setHoveredId(s._id)}
            onMouseLeave={() => setHoveredId(null)}
            className="aurora-card stagger-item"
            style={{
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              '--delay': `${i * 0.06}s`,
              border: isHovered ? '1.5px solid var(--indigo)' : '1px solid var(--border)',
              background: isHovered ? 'var(--gradient-soft)' : 'var(--surface)',
              transform: isHovered ? 'translateY(-2px)' : 'none',
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
            <ArrowRight size={18} color={isHovered ? 'var(--indigo)' : 'var(--ink-soft)'} />
          </button>
        );
      })}
    </div>
  );
}
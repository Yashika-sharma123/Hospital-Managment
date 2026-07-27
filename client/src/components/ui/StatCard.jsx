import { useEffect, useState } from 'react';

function useCountUp(target, duration = 800) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    const numericTarget = typeof target === 'number' ? target : parseFloat(target) || 0;
    let start = null;
    function step(timestamp) {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setValue(Math.round(progress * numericTarget));
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }, [target, duration]);
  return value;
}

export default function StatCard({ icon: Icon, value, suffix = '', label, accent = 'indigo' }) {
  const isNumeric = typeof value === 'number';
  const animated = useCountUp(isNumeric ? value : 0);

  const accentBg = {
    indigo: 'rgba(67, 56, 202, 0.1)',
    cyan: 'rgba(6, 182, 212, 0.12)',
    violet: 'rgba(124, 58, 237, 0.1)',
  }[accent];
  const accentColor = { indigo: 'var(--indigo)', cyan: 'var(--cyan)', violet: 'var(--violet)' }[accent];

  return (
    <div className="aurora-card hover-lift">
      <div
        style={{
          width: 40, height: 40, borderRadius: 12, background: accentBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14,
        }}
      >
        {Icon && <Icon size={20} color={accentColor} />}
      </div>
      <p style={{ fontSize: 26, fontWeight: 700, margin: 0, color: 'var(--ink)' }}>
        {isNumeric ? animated : value}{suffix}
      </p>
      <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: '4px 0 0' }}>{label}</p>
    </div>
  );
}

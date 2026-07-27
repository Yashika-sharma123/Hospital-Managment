export default function StatCards({ dashboard }) {
  if (!dashboard) return null;

  const cards = [
    { label: 'Tokens Today', value: dashboard.tokensToday },
    { label: 'Avg Wait Time', value: `${dashboard.avgWaitMinutes} min` },
    { label: 'Active Counters', value: `${dashboard.activeCounters} / ${dashboard.totalCounters}` },
    { label: 'No-Show Rate', value: `${dashboard.noShowRatePercent}%`, highlight: true },
  ];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 24 }}>
      {cards.map((c) => (
        <div
          key={c.label}
          className="card"
          style={c.highlight ? { background: 'var(--green)', color: '#fff', border: 'none' } : {}}
        >
          <p style={{ fontSize: 26, fontFamily: 'var(--font-serif)', margin: 0 }}>{c.value}</p>
          <p style={{ fontSize: 12, margin: '6px 0 0', opacity: c.highlight ? 0.9 : 1, color: c.highlight ? '#fff' : 'var(--muted-text)' }}>
            {c.label}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function PeakHoursChart({ hourlyCounts }) {
  if (!hourlyCounts) return null;
  const max = Math.max(...hourlyCounts, 1);

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <h2 style={{ fontSize: 16, marginBottom: 16 }}>Peak Hours (Last 7 Days)</h2>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 120 }}>
        {hourlyCounts.map((count, hour) => (
          <div key={hour} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              title={`${hour}:00 — ${count} tokens`}
              style={{
                width: '100%',
                height: `${(count / max) * 100}px`,
                background: count / max > 0.7 ? 'var(--danger)' : 'var(--green)',
                borderRadius: '3px 3px 0 0',
                minHeight: 2,
              }}
            />
            {hour % 3 === 0 && <span style={{ fontSize: 9, color: 'var(--muted-text)', marginTop: 4 }}>{hour}h</span>}
          </div>
        ))}
      </div>
    </div>
  );
}

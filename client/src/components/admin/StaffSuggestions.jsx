export default function StaffSuggestions({ suggestions }) {
  if (!suggestions || suggestions.length === 0) return null;

  return (
    <div className="card" style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
        <h2 style={{ fontSize: 16 }}>AI Staff Allocation Suggestions</h2>
        <span className="pill pill-green">AI predicting</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {suggestions.map((s) => (
          <div
            key={s.service}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 12px',
              background: s.needsAttention ? 'var(--danger-bg)' : 'var(--bg)',
              borderRadius: 10,
            }}
          >
            <div>
              <p style={{ fontSize: 13, fontWeight: 500, margin: 0 }}>{s.service}</p>
              <p style={{ fontSize: 12, color: 'var(--muted-text)', margin: '2px 0 0' }}>{s.recommendation}</p>
            </div>
            <span style={{ fontSize: 12, color: s.needsAttention ? 'var(--danger)' : 'var(--muted-text)', whiteSpace: 'nowrap' }}>
              {s.queueLength} waiting · {s.predictedWaitMinutes} min
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

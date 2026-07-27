export default function EmptyState({ icon: Icon, title, description }) {
  return (
    <div style={{ textAlign: 'center', padding: '48px 20px' }}>
      {Icon && (
        <div
          style={{
            width: 56, height: 56, borderRadius: 16, background: 'var(--gradient-soft)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
          }}
        >
          <Icon size={26} color="var(--indigo)" />
        </div>
      )}
      <p style={{ fontSize: 15, fontWeight: 600, margin: 0, color: 'var(--ink)' }}>{title}</p>
      {description && <p style={{ fontSize: 13, color: 'var(--ink-soft)', margin: '6px 0 0' }}>{description}</p>}
    </div>
  );
}

export function SkeletonLine({ width = '100%', height = 14, style = {} }) {
  return <div className="skeleton" style={{ width, height, ...style }} />;
}

export function SkeletonCard() {
  return (
    <div className="aurora-card">
      <SkeletonLine width="60%" height={16} style={{ marginBottom: 10 }} />
      <SkeletonLine width="90%" height={12} style={{ marginBottom: 6 }} />
      <SkeletonLine width="40%" height={12} />
    </div>
  );
}

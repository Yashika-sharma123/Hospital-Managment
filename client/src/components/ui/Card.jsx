export default function Card({ glass = false, hoverLift = false, children, className = '', style = {}, ...props }) {
  const base = glass ? 'aurora-glass' : 'aurora-card';
  const lift = hoverLift ? 'hover-lift' : '';
  return (
    <div className={`${base} ${lift} ${className}`} style={style} {...props}>
      {children}
    </div>
  );
}

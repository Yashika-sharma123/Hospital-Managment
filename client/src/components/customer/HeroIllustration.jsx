export default function HeroIllustration() {
  return (
    <svg viewBox="0 0 320 220" width="100%" style={{ maxWidth: 300, display: 'block', margin: '0 auto' }}>
      <defs>
        <radialGradient id="orbCore" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#4338ca" />
        </radialGradient>
        <linearGradient id="ringGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#4338ca" />
        </linearGradient>
      </defs>

      {/* orbiting rings representing AI prediction */}
      <ellipse cx="160" cy="110" rx="120" ry="46" fill="none" stroke="url(#ringGrad)" strokeWidth="1.5" opacity="0.35" className="float-slow" />
      <ellipse cx="160" cy="110" rx="90" ry="70" fill="none" stroke="url(#ringGrad)" strokeWidth="1.5" opacity="0.25" className="float-slower" />

      {/* floating data nodes */}
      <circle cx="60" cy="70" r="5" fill="#06b6d4" className="pulse-glow" />
      <circle cx="260" cy="150" r="5" fill="#7c3aed" className="pulse-glow" style={{ animationDelay: '0.6s' }} />
      <circle cx="90" cy="160" r="4" fill="#4338ca" className="pulse-glow" style={{ animationDelay: '1.1s' }} />
      <circle cx="240" cy="60" r="4" fill="#06b6d4" className="pulse-glow" style={{ animationDelay: '1.6s' }} />

      {/* core orb — the "AI" at the center */}
      <circle cx="160" cy="110" r="34" fill="url(#orbCore)" className="float-slow" />
      <circle cx="160" cy="110" r="34" fill="none" stroke="#fff" strokeWidth="1" opacity="0.3" />

      {/* medical cross inside the orb */}
      <rect x="152" y="96" width="16" height="28" rx="3" fill="#fff" opacity="0.95" />
      <rect x="146" y="102" width="28" height="16" rx="3" fill="#fff" opacity="0.95" />

      {/* connecting lines from nodes to orb */}
      <line x1="60" y1="70" x2="140" y2="98" stroke="#06b6d4" strokeWidth="1" opacity="0.25" />
      <line x1="260" y1="150" x2="184" y2="122" stroke="#7c3aed" strokeWidth="1" opacity="0.25" />
    </svg>
  );
}

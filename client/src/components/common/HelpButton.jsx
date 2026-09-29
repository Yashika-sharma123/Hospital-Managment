import { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

export default function HelpButton() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 30 }}>
      {open && (
        <div className="aurora-card fade-in-up" style={{ width: 240, marginBottom: 12, padding: 16 }}>
          <p style={{ fontSize: 13, fontWeight: 600, margin: '0 0 6px' }}>Need help?</p>
          <p style={{ fontSize: 12, color: 'var(--ink-soft)', margin: 0, lineHeight: 1.5 }}>
            Select a department above to book a token, or use "Staff Login" if you work here.
          </p>
        </div>
      )}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'var(--ink)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: 'none',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-lg)',
          marginLeft: 'auto',
        }}
      >
        {open ? <X size={20} /> : <HelpCircle size={20} />}
      </button>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { QrCode, Printer } from 'lucide-react';
import { getServices } from '../../services/queueApi';

export default function QRCodes() {
  const [services, setServices] = useState([]);

  useEffect(() => {
    getServices().then(({ data }) => setServices(data.data.services));
  }, []);

  // The URL each QR encodes — scanning it opens the app straight on that
  // department's booking form with bookingType set to "walk-in".
  const buildUrl = (serviceId) => {
    const origin = window.location.origin;
    return `${origin}/?walkin=1&service=${serviceId}`;
  };

  return (
    <div className="aurora-card" style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <QrCode size={18} color="var(--indigo)" /> Reception QR Codes
        </h2>
        <button className="btn btn-secondary" onClick={() => window.print()}>
          <Printer size={14} /> Print
        </button>
      </div>
      <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', marginBottom: 18 }}>
        Print one per department and place it at reception / the department entrance.
        Patients scan it with their phone camera to check in instantly as a walk-in.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16 }}>
        {services.map((s) => (
          <div key={s._id} style={{ textAlign: 'center', border: '1px solid var(--border)', borderRadius: 14, padding: 16 }}>
            <QRCodeSVG value={buildUrl(s._id)} size={140} bgColor="#ffffff" fgColor="#14132b" style={{ margin: '0 auto' }} />
            <p style={{ fontSize: 13, fontWeight: 600, marginTop: 12, marginBottom: 0 }}>{s.name}</p>
            <p style={{ fontSize: 10.5, color: 'var(--ink-soft)', marginTop: 2, wordBreak: 'break-all' }}>{buildUrl(s._id)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

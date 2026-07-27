import { useEffect, useState } from 'react';
import { Activity, UserPlus, PhoneCall, CheckCircle2, AlertTriangle, RotateCcw, XCircle } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import EmptyState from '../ui/EmptyState';

const ICON_MAP = {
  booked: { icon: UserPlus, color: 'var(--indigo)' },
  called: { icon: PhoneCall, color: 'var(--cyan)' },
  served: { icon: CheckCircle2, color: 'var(--success)' },
  'no-show': { icon: AlertTriangle, color: 'var(--danger)' },
  're-queued': { icon: RotateCcw, color: 'var(--violet)' },
  cancelled: { icon: XCircle, color: 'var(--danger)' },
};

function timeAgo(timestamp) {
  const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

export default function ActivityFeed() {
  const [events, setEvents] = useState([]);
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;
    socket.emit('joinAdminRoom');

    const handleActivity = (event) => {
      setEvents((prev) => [event, ...prev].slice(0, 15)); // keep the most recent 15
    };

    socket.on('activity', handleActivity);
    return () => socket.off('activity', handleActivity);
  }, [socket]);

  return (
    <div className="aurora-card" style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <Activity size={18} color="var(--indigo)" />
        <h2 style={{ fontSize: 16 }}>Live Activity</h2>
        <span className="badge badge-success" style={{ marginLeft: 'auto' }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} className="pulse-glow" /> Live
        </span>
      </div>

      {events.length === 0 && (
        <EmptyState icon={Activity} title="No activity yet" description="Events will appear here the moment something happens in the queue." />
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, maxHeight: 320, overflowY: 'auto' }}>
        {events.map((e, i) => {
          const config = ICON_MAP[e.type] || ICON_MAP.booked;
          const Icon = config.icon;
          return (
            <div
              key={`${e.timestamp}-${i}`}
              className="fade-in-up"
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 4px', borderBottom: i < events.length - 1 ? '1px solid var(--border)' : 'none' }}
            >
              <Icon size={16} color={config.color} style={{ flexShrink: 0 }} />
              <p style={{ fontSize: 13, margin: 0, flex: 1 }}>{e.message}</p>
              <span style={{ fontSize: 11, color: 'var(--ink-soft)', whiteSpace: 'nowrap' }}>{timeAgo(e.timestamp)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

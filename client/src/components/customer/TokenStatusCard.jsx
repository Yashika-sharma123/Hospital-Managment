import { useEffect, useState } from 'react';
import { Users, Clock, CheckCircle2, AlertTriangle, Star } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { useLanguage } from '../../context/LanguageContext';
import { getTokenStatus, cancelToken, reEnterQueue, submitRating } from '../../services/queueApi';
import StatusBadge from '../ui/StatusBadge';

export default function TokenStatusCard({ initialToken, onNewBooking }) {
  const [token, setToken] = useState(initialToken.token);
  const [position, setPosition] = useState(initialToken.position);
  const [eta, setEta] = useState(initialToken.predictedWaitMinutes);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);
  const socket = useSocket();
  const { t } = useLanguage();

  useEffect(() => {
    if (!socket) return;
    socket.emit('joinTokenRoom', token._id);

    const refresh = async () => {
      const { data } = await getTokenStatus(token._id);
      setToken(data.data.token);
      setPosition(data.data.position);
      setEta(data.data.liveEtaMinutes);
    };

    socket.on('token:called', refresh);
    socket.on('token:served', refresh);
    socket.on('token:no-show', refresh);
    socket.on('token:re-queued', refresh);
    socket.on('token:cancelled', refresh);
    const interval = setInterval(refresh, 15000);

    return () => {
      socket.off('token:called', refresh);
      socket.off('token:served', refresh);
      socket.off('token:no-show', refresh);
      socket.off('token:re-queued', refresh);
      socket.off('token:cancelled', refresh);
      clearInterval(interval);
    };
  }, [socket, token._id]);

  const handleCancel = async () => {
    const { data } = await cancelToken(token._id);
    setToken(data.data.token);
  };
  const handleReEnter = async () => {
    const { data } = await reEnterQueue(token._id);
    setToken(data.data.token);
  };
  const handleRate = async (stars) => {
    const { data } = await submitRating(token._id, stars);
    setToken(data.data.token);
    setRatingSubmitted(true);
  };

  const isActive = ['waiting', 're-queued'].includes(token.status);
  const isCalled = token.status === 'called';
  const isServed = token.status === 'served';

  return (
    <div className="aurora-card" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
      {isCalled && <div className="aurora-blob" style={{ width: 200, height: 200, background: 'var(--success)', opacity: 0.08, top: -60, left: '50%', transform: 'translateX(-50%)' }} />}

      <p style={{ color: 'var(--ink-soft)', fontSize: 13, position: 'relative' }}>{t('yourToken')}</p>
      <h1 style={{ fontSize: 46, margin: '4px 0 12px', background: 'var(--gradient-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', position: 'relative' }}>
        {token.tokenNumber}
      </h1>
      <StatusBadge status={token.status} />

      {isActive && (
        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'center', gap: 12 }}>
          <div className="aurora-card" style={{ flex: 1, padding: '14px 10px', boxShadow: 'none' }}>
            <Users size={18} color="var(--indigo)" style={{ marginBottom: 6 }} />
            <p style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{position}</p>
            <p style={{ fontSize: 11, color: 'var(--ink-soft)', margin: '2px 0 0' }}>{t('ahead')}</p>
          </div>
          <div className="aurora-card" style={{ flex: 1, padding: '14px 10px', boxShadow: 'none' }}>
            <Clock size={18} color="var(--cyan)" style={{ marginBottom: 6 }} />
            <p style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{eta}m</p>
            <p style={{ fontSize: 11, color: 'var(--ink-soft)', margin: '2px 0 0' }}>{t('estWait')}</p>
          </div>
        </div>
      )}

      {isCalled && (
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={32} color="var(--success)" className="pulse-glow" />
          <p style={{ fontSize: 13, color: 'var(--ink-soft)' }}>Please proceed to your counter now</p>
        </div>
      )}

      {token.status === 'no-show' && (
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
          <AlertTriangle size={26} color="var(--danger)" />
        </div>
      )}

      {isServed && !token.rating && !ratingSubmitted && (
        <div style={{ marginTop: 20 }}>
          <p style={{ fontSize: 13, color: 'var(--ink-soft)', marginBottom: 10 }}>How was your visit?</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6 }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => handleRate(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
              >
                <Star
                  size={28}
                  color={star <= hoverRating ? '#f59e0b' : 'var(--border)'}
                  fill={star <= hoverRating ? '#f59e0b' : 'none'}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {isServed && (token.rating || ratingSubmitted) && (
        <p style={{ fontSize: 13, color: 'var(--success)', marginTop: 20, fontWeight: 600 }}>Thanks for your feedback! 🙏</p>
      )}

      {isActive && (
        <button onClick={handleCancel} className="btn btn-secondary" style={{ marginTop: 22, width: '100%' }}>
          {t('cancelToken')}
        </button>
      )}
      {token.status === 'no-show' && (
        <button onClick={handleReEnter} className="btn btn-primary" style={{ marginTop: 16, width: '100%' }}>
          {t('rejoinQueue')}
        </button>
      )}
      {['served', 'cancelled'].includes(token.status) && (
        <button onClick={onNewBooking} className="btn btn-primary" style={{ marginTop: 22, width: '100%' }}>
          {t('bookAnother')}
        </button>
      )}
    </div>
  );
}

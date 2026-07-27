import { useState, useEffect } from 'react';
import { ArrowLeft, User, Phone, Sparkles, Clock, Users as UsersIcon } from 'lucide-react';
import { getQueueSummary, bookToken } from '../../services/queueApi';
import { useLanguage } from '../../context/LanguageContext';
import { SkeletonLine } from '../ui/Skeleton';

export default function BookingForm({ service, bookingType = 'online', onBack, onBooked }) {
  const [queueInfo, setQueueInfo] = useState(null);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [priorityType, setPriorityType] = useState('normal');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { t } = useLanguage();

  useEffect(() => {
    getQueueSummary(service._id).then(({ data }) => setQueueInfo(data.data));
  }, [service._id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await bookToken({
        serviceId: service._id,
        bookingType,
        priorityType,
        guestName,
        guestPhone,
      });
      onBooked(data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={onBack} className="btn btn-ghost" style={{ marginBottom: 16, paddingLeft: 0 }}>
        <ArrowLeft size={16} /> {t('back')}
      </button>

      <div className="aurora-card" style={{ marginBottom: 16, background: 'var(--gradient-soft)', border: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <Sparkles size={16} color="var(--indigo)" />
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--indigo)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
            AI Live Estimate
          </span>
        </div>
        <h2 style={{ fontSize: 18, marginBottom: 10 }}>{service.name}</h2>
        {queueInfo ? (
          <div style={{ display: 'flex', gap: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <UsersIcon size={15} color="var(--ink-soft)" />
              <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{queueInfo.queueLength} {t('peopleWaiting')}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Clock size={15} color="var(--ink-soft)" />
              <span style={{ fontSize: 13, color: 'var(--ink-soft)' }}>~{queueInfo.estimatedWaitForNextBooking} min</span>
            </div>
          </div>
        ) : (
          <SkeletonLine width="70%" />
        )}
      </div>

      <form onSubmit={handleSubmit} className="aurora-card">
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <User size={14} /> {t('fullName')}
          </label>
          <input value={guestName} onChange={(e) => setGuestName(e.target.value)} required />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
            <Phone size={14} /> {t('phoneNumber')}
          </label>
          <input value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} required />
        </div>
        <div style={{ marginBottom: 22 }}>
          <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 8 }}>{t('priority')}</label>
          <select value={priorityType} onChange={(e) => setPriorityType(e.target.value)}>
            <option value="normal">{t('normal')}</option>
            <option value="senior-citizen">{t('seniorCitizen')}</option>
            <option value="pregnant">{t('pregnant')}</option>
            <option value="emergency">{t('emergency')}</option>
          </select>
        </div>

        {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 14 }}>{error}</p>}

        <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
          {loading ? t('booking') : t('bookToken')}
        </button>
      </form>
    </div>
  );
}

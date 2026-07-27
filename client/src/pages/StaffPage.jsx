import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { listCounters } from '../services/queueApi';
import CounterPanel from '../components/staff/CounterPanel';
import LanguageToggle from '../components/common/LanguageToggle';

export default function StaffPage() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [counters, setCounters] = useState([]);

  const refresh = useCallback(async () => {
    const { data } = await listCounters();
    // admin sees everything; staff only sees their own assigned counter(s)
    const mine =
      user.role === 'admin' ? data.data.counters : data.data.counters.filter((c) => c.assignedStaff?._id === user._id);
    setCounters(mine);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: 480, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22 }}>{t('welcomeBack')}, {user?.name}</h1>
            <p style={{ fontSize: 13, color: 'var(--muted-text)' }}>{t('hospitalName')} — {t('staffConsole')}</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <LanguageToggle />
            <button className="btn-secondary" onClick={logout}>{t('logOut')}</button>
          </div>
        </div>

        {counters.length === 0 && (
          <p style={{ color: 'var(--muted-text)', fontSize: 14 }}>No counter assigned to you yet — ask an admin.</p>
        )}

        {counters.map((counter) => (
          <CounterPanel key={counter._id} counter={counter} onRefresh={refresh} />
        ))}
      </div>
    </div>
  );
}

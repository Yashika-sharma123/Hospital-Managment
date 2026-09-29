import { useCallback, useEffect, useState } from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { listCounters } from '../services/queueApi';
import CounterPanel from '../components/staff/CounterPanel';
import BrandHeader from '../components/common/BrandHeader';
import LanguageToggle from '../components/common/LanguageToggle';

export default function StaffPage() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [counters, setCounters] = useState([]);

  const refresh = useCallback(async () => {
    const { data } = await listCounters();
    const mine =
      user.role === 'admin' ? data.data.counters : data.data.counters.filter((c) => c.assignedStaff?._id === user._id);
    setCounters(mine);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <div style={{ minHeight: '100vh' }}>
      <BrandHeader subtitle={t('staffConsole')}>
        <LanguageToggle />
        <button className="btn btn-secondary" onClick={logout}>
          <LogOut size={14} /> {t('logOut')}
        </button>
      </BrandHeader>

      <div style={{ padding: '32px 20px 60px' }}>
        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          <div className="fade-in-up" style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 22 }}>{t('welcomeBack')}, {user?.name}</h1>
          </div>

          {counters.length === 0 && (
            <p style={{ color: 'var(--ink-soft)', fontSize: 14 }}>No counter assigned to you yet — ask an admin.</p>
          )}

          {counters.map((counter) => (
            <CounterPanel key={counter._id} counter={counter} onRefresh={refresh} />
          ))}
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getDashboard, getAnalytics, getStaffSuggestion } from '../services/queueApi';
import StatCards from '../components/admin/StatCards';
import StaffSuggestions from '../components/admin/StaffSuggestions';
import ActivityFeed from '../components/admin/ActivityFeed';
import PeakHoursChart from '../components/admin/PeakHoursChart';
import CounterManagement from '../components/admin/CounterManagement';
import QRCodes from '../components/admin/QRCodes';
import LanguageToggle from '../components/common/LanguageToggle';

export default function AdminPage() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [dashboard, setDashboard] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [suggestions, setSuggestions] = useState(null);

  useEffect(() => {
    getDashboard().then(({ data }) => setDashboard(data.data));
    getAnalytics(7).then(({ data }) => setAnalytics(data.data));
    getStaffSuggestion().then(({ data }) => setSuggestions(data.data.suggestions));

    const interval = setInterval(() => {
      getDashboard().then(({ data }) => setDashboard(data.data));
      getStaffSuggestion().then(({ data }) => setSuggestions(data.data.suggestions));
    }, 20000); // refresh every 20s
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22 }}>{t('goodDay')}, {user?.name}</h1>
            <p style={{ fontSize: 13, color: 'var(--muted-text)' }}>{t('hospitalName')} — {t('dashboard')}</p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <LanguageToggle />
            <button className="btn-secondary" onClick={logout}>{t('logOut')}</button>
          </div>
        </div>

        <StatCards dashboard={dashboard} />
        <ActivityFeed />
        <StaffSuggestions suggestions={suggestions} />
        {analytics && <PeakHoursChart hourlyCounts={analytics.hourlyCounts} />}
        <QRCodes />
        <CounterManagement />
      </div>
    </div>
  );
}

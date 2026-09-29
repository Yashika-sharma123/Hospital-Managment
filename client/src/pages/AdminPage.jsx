import { useEffect, useState } from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { getDashboard, getAnalytics, getStaffSuggestion } from '../services/queueApi';
import StatCards from '../components/admin/StatCards';
import StaffSuggestions from '../components/admin/StaffSuggestions';
import ActivityFeed from '../components/admin/ActivityFeed';
import PeakHoursChart from '../components/admin/PeakHoursChart';
import CounterManagement from '../components/admin/CounterManagement';
import QRCodes from '../components/admin/QRCodes';
import BrandHeader from '../components/common/BrandHeader';
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
    }, 20000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ minHeight: '100vh' }}>
      <BrandHeader subtitle={t('dashboard')}>
        <LanguageToggle />
        <button className="btn btn-secondary" onClick={logout}>
          <LogOut size={14} /> {t('logOut')}
        </button>
      </BrandHeader>

      <div style={{ padding: '32px 20px 60px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <div className="fade-in-up" style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 22 }}>{t('goodDay')}, {user?.name}</h1>
          </div>

          <StatCards dashboard={dashboard} />
          <ActivityFeed />
          <StaffSuggestions suggestions={suggestions} />
          {analytics && <PeakHoursChart hourlyCounts={analytics.hourlyCounts} />}
          <QRCodes />
          <CounterManagement />
        </div>
      </div>
    </div>
  );
}
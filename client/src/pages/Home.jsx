import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Clock, ShieldCheck, QrCode, ArrowRight } from 'lucide-react';
import { getServices } from '../services/queueApi';
import { useLanguage } from '../context/LanguageContext';
import ServiceList from '../components/customer/ServiceList';
import BookingForm from '../components/customer/BookingForm';
import TokenStatusCard from '../components/customer/TokenStatusCard';
import HeroIllustration from '../components/customer/HeroIllustration';
import LanguageToggle from '../components/common/LanguageToggle';
import { SkeletonCard } from '../components/ui/Skeleton';
import Footer from '../components/customer/Footer';

const FEATURES = [
  { icon: Sparkles, label: 'AI Wait-Time Prediction', accent: 'indigo' },
  { icon: Clock, label: 'Live Queue Tracking', accent: 'cyan' },
  { icon: ShieldCheck, label: 'Fair Priority System', accent: 'violet' },
];

export default function Home() {
  const [services, setServices] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [bookingResult, setBookingResult] = useState(null);
  const [isWalkIn, setIsWalkIn] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    getServices()
      .then(({ data }) => {
        const list = data.data.services;
        setServices(list);

        // ---- QR check-in deep link ----
        // A QR code printed at reception encodes a URL like:
        //   http://<app>/?walkin=1&service=<serviceId>
        // Scanning it lands the patient straight on that department's
        // booking form, skipping the department list entirely.
        const params = new URLSearchParams(window.location.search);
        const walkin = params.get('walkin') === '1';
        const serviceId = params.get('service');
        if (walkin && serviceId) {
          const match = list.find((s) => s._id === serviceId);
          if (match) {
            setSelectedService(match);
            setIsWalkIn(true);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load services:', err);
        setServices([]); // stop showing skeletons forever — show empty state instead
      });
  }, []);

  const handleNewBooking = () => {
    setBookingResult(null);
    setSelectedService(null);
    setIsWalkIn(false);
    // clear the walk-in query params so a "book another" doesn't re-trigger it
    window.history.replaceState({}, '', window.location.pathname);
  };

  const showHero = !bookingResult && !selectedService;

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
      <div className="aurora-blob" style={{ width: 420, height: 420, background: 'var(--indigo)', opacity: 0.08, top: -140, left: -100 }} />
      <div className="aurora-blob" style={{ width: 380, height: 380, background: 'var(--cyan)', opacity: 0.08, top: 60, right: -140 }} />

      <div style={{ position: 'relative', zIndex: 1, padding: '32px 20px 60px' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', maxWidth: 480, margin: '0 auto 8px' }}>
          <LanguageToggle />
        </div>

        <div style={{ maxWidth: 480, margin: '0 auto' }}>
          {showHero && (
            <>
              <div className="fade-in-up" style={{ textAlign: 'center' }}>
                <span className="badge badge-indigo" style={{ marginBottom: 16 }}>
                  <Sparkles size={12} /> AI-Powered Queue System
                </span>
                <HeroIllustration />
              </div>

              <div className="fade-in-up" style={{ textAlign: 'center', marginTop: 4, marginBottom: 28, animationDelay: '0.1s' }}>
                <h1 style={{ fontSize: 32 }}>{t('hospitalName')}</h1>
                <p style={{ color: 'var(--ink-soft)', fontSize: 14.5, marginTop: 8 }}>{t('tagline')}</p>
              </div>

              <div
                className="fade-in-up"
                style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 28, animationDelay: '0.15s' }}
              >
                {FEATURES.map((f) => (
                  <div key={f.label} className="aurora-card" style={{ textAlign: 'center', padding: '14px 8px' }}>
                    <f.icon size={18} color={`var(--${f.accent})`} style={{ marginBottom: 6 }} />
                    <p style={{ fontSize: 10.5, fontWeight: 600, color: 'var(--ink-soft)', margin: 0, lineHeight: 1.3 }}>{f.label}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {bookingResult && (
            <div className="fade-in-up">
              <TokenStatusCard initialToken={bookingResult} onNewBooking={handleNewBooking} />
            </div>
          )}

          {!bookingResult && selectedService && (
            <div className="fade-in-up">
              {isWalkIn && (
                <div className="badge badge-success" style={{ marginBottom: 12 }}>
                  <QrCode size={12} /> Checked in via QR at reception
                </div>
              )}
              <BookingForm
                service={selectedService}
                bookingType={isWalkIn ? 'walk-in' : 'online'}
                onBack={() => { setSelectedService(null); setIsWalkIn(false); }}
                onBooked={setBookingResult}
              />
            </div>
          )}

          {showHero && (
            <>
              <p className="fade-in-up" style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 12, animationDelay: '0.2s' }}>
                {t('selectDepartment')}
              </p>

              {!services && (
                <div style={{ display: 'grid', gap: 12 }}>
                  <SkeletonCard /><SkeletonCard /><SkeletonCard />
                </div>
              )}

              {services && <ServiceList services={services} onSelect={setSelectedService} />}

              <div
                className="aurora-card fade-in-up"
                style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 12, background: 'var(--gradient-soft)', border: 'none', animationDelay: '0.3s' }}
              >
                <QrCode size={22} color="var(--indigo)" />
                <p style={{ fontSize: 12.5, color: 'var(--ink-soft)', margin: 0 }}>
                  Walk in already? Scan the QR code at reception to check in instantly.
                </p>
              </div>
            </>
          )}

          <div className="fade-in" style={{ textAlign: 'center', marginTop: 32, animationDelay: '0.4s' }}>
            <Link
              to="/login"
              style={{ color: 'var(--indigo)', fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}
            >
              {t('staffAdminLogin')} <ArrowRight size={14} />
            </Link>
          </div>

          {showHero && <Footer />}
        </div>
      </div>
    </div>
  );
}

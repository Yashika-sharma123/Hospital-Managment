import { useEffect, useState } from 'react';
import { Sparkles, Clock, ShieldCheck, QrCode } from 'lucide-react';
import { getServices } from '../services/queueApi';
import { useLanguage } from '../context/LanguageContext';
import ServiceList from '../components/customer/ServiceList';
import BookingForm from '../components/customer/BookingForm';
import TokenStatusCard from '../components/customer/TokenStatusCard';
import HeroIllustration from '../components/customer/HeroIllustration';
import Footer from '../components/customer/Footer';
import Navbar from '../components/common/Navbar';
import HelpButton from '../components/common/HelpButton';
import { SkeletonCard } from '../components/ui/Skeleton';

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
        setServices([]);
      });
  }, []);

  const handleNewBooking = () => {
    setBookingResult(null);
    setSelectedService(null);
    setIsWalkIn(false);
    window.history.replaceState({}, '', window.location.pathname);
  };

  const showHero = !bookingResult && !selectedService;

  return (
    <div style={{ minHeight: '100vh' }} id="top">
      <Navbar />

      <div style={{ position: 'relative', overflow: 'hidden' }}>
        {showHero && <div className="dot-grid-bg" style={{ height: 420 }} />}

        <div style={{ position: 'relative', zIndex: 1, padding: '40px 20px 60px' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            {showHero && (
              <>
                <div className="fade-in-up" style={{ textAlign: 'center' }}>
                  <span className="badge badge-indigo" style={{ marginBottom: 16 }}>
                    <Sparkles size={12} /> AI-Powered Queue System
                  </span>
                  <HeroIllustration />
                </div>

                <div className="fade-in-up" style={{ textAlign: 'center', marginTop: 4, marginBottom: 36, animationDelay: '0.1s' }}>
                  <h1 style={{ fontSize: 40 }}>{t('hospitalName')}</h1>
                  <p style={{ color: 'var(--ink-soft)', fontSize: 16, marginTop: 10 }}>{t('tagline')}</p>
                </div>

                <div
                  className="fade-in-up"
                  style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 40, animationDelay: '0.15s' }}
                >
                  {FEATURES.map((f) => (
                    <div key={f.label} className="aurora-card hover-lift" style={{ textAlign: 'center', padding: '28px 16px' }}>
                      <div
                        style={{
                          width: 48, height: 48, borderRadius: 12, background: 'var(--gradient-soft)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px',
                        }}
                      >
                        <f.icon size={22} color={`var(--${f.accent})`} />
                      </div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--ink)', margin: 0 }}>{f.label}</p>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div style={{ maxWidth: 480, margin: '0 auto' }}>
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
                <div id="departments-section">
                  <p className="fade-in-up" style={{ fontSize: 15, fontWeight: 700, color: 'var(--ink)', marginBottom: 14, animationDelay: '0.2s' }}>
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
                    style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 12, background: 'var(--gradient-soft)', border: '1px solid rgba(67,56,202,0.25)', animationDelay: '0.3s' }}
                  >
                    <QrCode size={22} color="var(--indigo)" />
                    <p style={{ fontSize: 13, color: 'var(--indigo)', margin: 0, fontWeight: 500 }}>
                      Walk in already? Scan the QR code at reception to check in instantly.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showHero && <Footer />}
      <HelpButton />
    </div>
  );
}
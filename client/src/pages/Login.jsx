import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import BrandHeader from '../components/common/BrandHeader';
import LanguageToggle from '../components/common/LanguageToggle';

export default function Login() {
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [devOtp, setDevOtp] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { requestOtp, verifyOtp } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await requestOtp(phone);
      setDevOtp(result.devOtp || null);
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await verifyOtp(phone, code);
      navigate(user.role === 'admin' ? '/admin' : '/staff');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <BrandHeader subtitle="Staff & Admin Portal">
        <LanguageToggle />
      </BrandHeader>

      <div style={{ minHeight: 'calc(100vh - 72px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        <div className="aurora-card fade-in-up" style={{ width: 360 }}>
          <h1 style={{ fontSize: 22, marginBottom: 6 }}>{t('loginTitle')}</h1>
          <p style={{ color: 'var(--ink-soft)', fontSize: 13, marginBottom: 24 }}>Log in with your registered phone number</p>

          {step === 'phone' && (
            <form onSubmit={handleRequestOtp}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 8 }}>{t('enterPhone')}</label>
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
              {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 14 }}>{error}</p>}
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                {loading ? '...' : t('sendOtp')}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ fontSize: 13, fontWeight: 500, display: 'block', marginBottom: 8 }}>{t('enterOtp')}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  style={{ letterSpacing: 4, textAlign: 'center', fontSize: 18 }}
                />
                {devOtp && (
                  <p style={{ fontSize: 12, color: 'var(--success)', marginTop: 8 }}>
                    <strong>{devOtp}</strong>
                  </p>
                )}
              </div>
              {error && <p style={{ color: 'var(--danger)', fontSize: 13, marginBottom: 14 }}>{error}</p>}
              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginBottom: 10 }} disabled={loading}>
                {loading ? '...' : t('verifyOtp')}
              </button>
              <button type="button" className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setStep('phone')}>
                {t('changeNumber')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
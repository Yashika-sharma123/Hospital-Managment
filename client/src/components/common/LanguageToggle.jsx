import { useLanguage } from '../../context/LanguageContext';

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      onClick={toggleLanguage}
      className="btn-secondary"
      style={{ fontSize: 12, padding: '6px 14px' }}
      title="Switch language"
    >
      {language === 'en' ? 'हिं' : 'EN'}
    </button>
  );
}

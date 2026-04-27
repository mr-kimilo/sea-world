import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';
import './LanguageSwitcher.mobile.css';

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation('common');

  const toggleLanguage = () => {
    const newLang = i18n.language === 'zh-CN' ? 'en-US' : 'zh-CN';
    i18n.changeLanguage(newLang);
  };

  const label =
    i18n.language === 'zh-CN' ? t('switchToEnglish') : t('switchToChinese');

  return (
    <button type="button" onClick={toggleLanguage} className="language-switcher">
      {label}
    </button>
  );
}

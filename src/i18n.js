import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Sözlüklerimizi içeri alıyoruz
import tr from './locales/tr.json';
import en from './locales/en.json';
import de from './locales/de.json';
// --- KRİTİK KISIM: Tarayıcı hafızasına bakıyoruz ---
const savedLanguage = localStorage.getItem('user-language') || 'tr';

i18n
  .use(initReactI18next) // React ile i18next'i birbirine bağlar
  .init({
    resources: {
      tr: { translation: tr },
      en: { translation: en },
      de: { translation: de }
    },
    lng: savedLanguage, // Sitenin varsayılan açılış dili
    fallbackLng: 'tr', // Bir kelime bulunamazsa Türkçe'ye döner
    interpolation: {
      escapeValue: false // React zaten güvenlik(XSS) koruması sağladığı için kapalı
    }
  });

export default i18n;
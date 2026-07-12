import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';

import ar from '@/locales/ar.json';
import en from '@/locales/en.json';

/**
 * Arabic is the primary language (RTL-first per the design);
 * English mirrors to LTR. Device locale decides the default.
 */
const deviceLanguage = getLocales()[0]?.languageCode === 'en' ? 'en' : 'ar';

export const isRTL = deviceLanguage === 'ar';

// Keep the native layout direction in sync with the language.
// (A full flip requires an app reload — handled by the language switcher.)
I18nManager.allowRTL(isRTL);

i18n.use(initReactI18next).init({
  resources: {
    ar: { translation: ar },
    en: { translation: en },
  },
  lng: deviceLanguage,
  fallbackLng: 'ar',
  interpolation: { escapeValue: false },
});

export default i18n;

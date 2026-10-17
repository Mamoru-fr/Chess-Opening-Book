import i18next from 'i18next';
import en from '../locales/en.json';
import fr from '../locales/fr.json';
import { initReactI18next } from 'react-i18next';

export const languageResources = {
    en: { translation: en },
    fr: { translation: fr },
}

i18next.use(initReactI18next).init({
    lng: 'fr',
    fallbackLng: 'fr',
    compatibilityJSON: 'v4',
    debug: false,
    resources: languageResources,
    interpolation: {
        escapeValue: false,
    },
});

export default i18next;

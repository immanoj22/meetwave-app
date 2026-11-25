import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import hi from './hi.json';
import es from './es.json';
import ja from './ja.json';
import pt from './pt.json';
import zh from './zh.json';
import fr from './fr.json';
import it from './it.json';
import ru from './ru.json';
import ne from './ne.json';
import sr from './sr.json';
import ta from './ta.json';
import { GetItem } from '../../Actions/localstorage';

const storedLanguage = GetItem("CurrentLanguage") || 'en';


i18n.use(initReactI18next).init({
  lng: storedLanguage,
  fallbackLng: 'en',
  resources: {
    ta: ta,
    en: en,
    hi: hi,
    es: es,
    ja: ja,
    pt: pt,
    zh: zh,
    fr: fr,
    it: it,
    ru: ru,
    ne: ne,
    sr: sr,
  },
  interpolation: {
    escapeValue: false // react already safes from xss
  }
});

export default i18n;

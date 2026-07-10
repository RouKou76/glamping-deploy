import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import ru from './ru.json'
import en from './en.json'
import zh from './zh.json'

i18n.use(initReactI18next).init({
  resources: { ru: { translation: ru }, en: { translation: en }, zh: { translation: zh } },
  lng: localStorage.getItem('glamp-lang') || 'ru',
  fallbackLng: 'ru',
  interpolation: { escapeValue: false },
})

export default i18n

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

i18n.addResourceBundle('ru', 'translation', {
  validation: { minAdvanceTime: 'Заказ еды возможен минимум за 1 час' },
}, true)
i18n.addResourceBundle('en', 'translation', {
  validation: { minAdvanceTime: 'Food orders must be placed at least 1 hour in advance' },
}, true)
i18n.addResourceBundle('zh', 'translation', {
  validation: { minAdvanceTime: '订餐需提前至少1小时' },
}, true)

export default i18n

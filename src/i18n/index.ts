import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import en from './locales/en.json'
import ja from './locales/ja.json'
import zh from './locales/zh.json'

export const resources = {
  en: {
    translation: en,
  },
  zh: {
    translation: zh,
  },
  ja: {
    translation: ja,
  },
} as const

i18n
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    lng: Object.keys(resources)[Number(localStorage.getItem('lang')) || 0],
    resources,
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n

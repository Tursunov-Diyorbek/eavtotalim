import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import uz from './locales/uz.json'
import kiril from './locales/kiril.json'
import ru from './locales/ru.json'

export const LOCALES = ['uz', 'kiril', 'ru'] as const
export type AppLocale = (typeof LOCALES)[number]

export const LOCALE_STORAGE_KEY = 'eav_lang'

const resources = {
  uz: { translation: uz },
  kiril: { translation: kiril },
  ru: { translation: ru },
} as const

function resolveInitialLocale(): AppLocale {
  const saved = localStorage.getItem(LOCALE_STORAGE_KEY)
  if (saved && LOCALES.includes(saved as AppLocale)) {
    return saved as AppLocale
  }
  return 'uz'
}

void i18n.use(initReactI18next).init({
  resources,
  lng: resolveInitialLocale(),
  fallbackLng: 'uz',
  interpolation: {
    escapeValue: false,
  },
})

i18n.on('languageChanged', (lng) => {
  localStorage.setItem(LOCALE_STORAGE_KEY, lng)
  document.documentElement.lang = lng === 'kiril' ? 'uz-Cyrl' : lng
})

document.documentElement.lang =
  i18n.language === 'kiril' ? 'uz-Cyrl' : i18n.language

export default i18n

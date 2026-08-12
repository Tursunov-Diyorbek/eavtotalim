import '@/i18n'
import { createRoot } from 'react-dom/client'
import { App } from '@/app'
import '@/styles/globals.css'

// StrictMode olib tashlandi: API (captcha, /me) effectlari devda 2 marta ketmasin.
createRoot(document.getElementById('root')!).render(<App />)

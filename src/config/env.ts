/**
 * Base URL lar `src/utils/appvariables.js` dan (eski AppVariables.js).
 * Gitga ketmaydi — `appvariables.example.js` dan nusxa oling.
 *
 * HTTPS sahifada `http://` API mixed-content bo‘ladi, `https://back.intalim.uz`
 * sertifikati esa expired. Shuning uchun faqat insecure http API
 * same-origin `/api` va `/v2/api` ga o‘tkaziladi (Apache `.htaccess` proxy).
 */
import {
  IS_PROD,
  PATH_PREFIX as APP_PATH_PREFIX,
  PATH_PREFIX_FILE,
  PATH_PREFIX_FILE_WITHOUT_SLESH,
  PATH_PREFIX_V2 as APP_PATH_PREFIX_V2,
} from '@/utils/appvariables.js'

/** HTTPS sahifadan `http://` chaqiriqni same-origin pathga aylantiradi. */
function sameOriginOnHttps(url: string): string {
  if (typeof window === 'undefined' || window.location.protocol !== 'https:') {
    return url
  }
  if (!url.startsWith('http://')) {
    return url
  }
  try {
    const { pathname } = new URL(url)
    return pathname.replace(/\/$/, '') || pathname
  } catch {
    return url
  }
}

export const PATH_PREFIX = sameOriginOnHttps(APP_PATH_PREFIX)
export const PATH_PREFIX_V2 = sameOriginOnHttps(APP_PATH_PREFIX_V2)
export { IS_PROD, PATH_PREFIX_FILE }

/** Eski `PATH_PREFIX_FILE_WITHOUT_SLESH` */
export const PATH_PREFIX_FILE_HOST = PATH_PREFIX_FILE_WITHOUT_SLESH

export const env = {
  appName: import.meta.env.VITE_APP_NAME ?? "EAVTOTA'LIM",
  apiUrl: PATH_PREFIX,
  apiUrlV2: PATH_PREFIX_V2,
  fileUrl: PATH_PREFIX_FILE,
  fileHost: PATH_PREFIX_FILE_HOST,
  isProd: IS_PROD,
  isDev: import.meta.env.DEV,
} as const

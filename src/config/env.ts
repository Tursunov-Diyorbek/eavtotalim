/**
 * Base URL lar `src/utils/appvariables.js` dan (eski AppVariables.js).
 * Gitga ketmaydi — `appvariables.example.js` dan nusxa oling.
 *
 * - Dev (`vite`): absolute API → same-origin `/api` va `/v2/api` (vite proxy).
 * - HTTPS + `http://` API: mixed-content → same-origin (Apache `.htaccess`).
 * - HTTPS + boshqa hostdagi `https://` API: CORS ko‘pincha faqat `eavtotalim.uz`
 *   (masalan `newdesign.intalim.uz` allowlistda yo‘q) → same-origin proxy.
 * - `eavtotalim.uz` da absolute `https://back.eavtotalim.uz` CORS bilan ishlaydi.
 */
import {
  IS_PROD,
  PATH_PREFIX as APP_PATH_PREFIX,
  PATH_PREFIX_FILE,
  PATH_PREFIX_FILE_WITHOUT_SLESH,
  PATH_PREFIX_V2 as APP_PATH_PREFIX_V2,
} from '@/utils/appvariables.js'

/** Backend CORS ruxsat beradigan asosiy front hostlar. */
const CORS_TRUSTED_FRONT_HOSTS = new Set([
  'eavtotalim.uz',
  'www.eavtotalim.uz',
])

/** Absolute API base ni pathname ga (trailing slash siz) aylantiradi. */
function toSameOriginPath(url: string): string {
  try {
    const { pathname } = new URL(url)
    return pathname.replace(/\/$/, '') || pathname
  } catch {
    return url
  }
}

/**
 * Dev / mixed-content / CORS-siz staging → same-origin `/api`, `/v2/api`.
 * Brauzersiz (SSR/test) muhitda original URL qoladi.
 */
function resolveApiBase(url: string): string {
  if (import.meta.env.DEV) {
    return toSameOriginPath(url)
  }
  if (typeof window === 'undefined') {
    return url
  }

  try {
    const api = new URL(url, window.location.origin)
    const pageHost = window.location.hostname
    const httpsPage = window.location.protocol === 'https:'

    // HTTPS sahifadan HTTP API — brauzer mixed-content bloklaydi
    if (httpsPage && api.protocol === 'http:') {
      return toSameOriginPath(url)
    }

    // Cross-origin HTTPS API — CORS faqat trusted frontga
    if (
      httpsPage &&
      api.protocol === 'https:' &&
      api.hostname !== pageHost &&
      !CORS_TRUSTED_FRONT_HOSTS.has(pageHost)
    ) {
      return toSameOriginPath(url)
    }
  } catch {
    /* original url */
  }

  return url
}

export const PATH_PREFIX = resolveApiBase(APP_PATH_PREFIX)
export const PATH_PREFIX_V2 = resolveApiBase(APP_PATH_PREFIX_V2)
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

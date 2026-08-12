/**
 * Base URL lar — qiymatlar `.env` dan (gitga yuklanmaydi).
 * Namuna: `.env.example`
 *
 * Kodda:
 *   import { PATH_PREFIX, PATH_PREFIX_V2, PATH_PREFIX_FILE, IS_PROD } from '@/config'
 *   // yoki
 *   import { env } from '@/config'
 */

const parseBool = (value: string | undefined, fallback: boolean) => {
  if (value === undefined) return fallback
  return value === 'true' || value === '1'
}

export const PATH_PREFIX =
  import.meta.env.VITE_PATH_PREFIX ?? '/api'

export const PATH_PREFIX_V2 =
  import.meta.env.VITE_PATH_PREFIX_V2 ?? '/v2/api'

export const PATH_PREFIX_FILE =
  import.meta.env.VITE_PATH_PREFIX_FILE ?? 'http://back.intalim.uz/'

export const IS_PROD = parseBool(import.meta.env.VITE_IS_PROD, false)

export const env = {
  appName: import.meta.env.VITE_APP_NAME ?? "EAVTOTA'LIM",
  /** Asosiy API (v1) — PATH_PREFIX bilan bir xil */
  apiUrl: PATH_PREFIX,
  apiUrlV2: PATH_PREFIX_V2,
  fileUrl: PATH_PREFIX_FILE,
  isProd: IS_PROD,
  isDev: import.meta.env.DEV,
} as const

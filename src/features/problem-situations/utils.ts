import { HttpError } from '@/api'
import type { BadgeTone } from '@/components/ui'
import { env } from '@/config'
import { asLangName } from '@/lib/apiPage'

export function situationLangBody(value: unknown, lang = 'uz'): string {
  return asLangName(value, lang)
}

export function situationStatusTone(id: number | undefined): BadgeTone {
  if (id === 1) return 'amber'
  if (id === 4) return 'teal'
  return 'rose'
}

export function situationFileHref(url: string): string {
  if (/^https?:\/\//i.test(url)) return url
  const base = env.fileUrl.replace(/\/$/, '')
  const path = url.replace(/^\//, '')
  return `${base}/${path}`
}

export function problemSituationErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof HttpError) {
    const payload = err.payload
    if (payload && typeof payload === 'object') {
      const rec = payload as { errors?: Record<string, unknown>; message?: string }
      if (rec.errors && typeof rec.errors === 'object') {
        for (const val of Object.values(rec.errors)) {
          if (Array.isArray(val) && typeof val[0] === 'string') return val[0]
          if (typeof val === 'string') return val
        }
      }
      if (typeof rec.message === 'string' && rec.message) return rec.message
    }
    if (err.message) return err.message
  }
  if (err instanceof Error && err.message) return err.message
  return fallback
}

import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Play } from 'lucide-react'
import { Button, Modal } from '@/components/ui'
import { routes } from '@/config'
import { EXAM_LANGS } from '@/features/exam-templates'
import { cn } from '@/lib/cn'
import type { FinalExamQuestionItem } from '@/types'

const STORAGE_KEY = 'final_exam_take'

export type StartFinalExamLangModalProps = {
  open: boolean
  userName?: string
  loading?: boolean
  error?: string | null
  onClose: () => void
  onPickLang: (langId: number) => void
}

export function StartFinalExamLangModal({
  open,
  userName,
  loading,
  error,
  onClose,
  onPickLang,
}: StartFinalExamLangModalProps) {
  const { t } = useTranslation()
  const [langId, setLangId] = useState<number | null>(null)

  useEffect(() => {
    if (!open) return
    setLangId(null)
  }, [open])

  useEffect(() => {
    if (!open || loading) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '1') setLangId(1)
      if (e.key === '2') setLangId(3)
      if (e.key === '3') setLangId(2)
      if (e.key === 'Enter' && langId != null) onPickLang(langId)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, langId, loading, onPickLang])

  return (
    <Modal
      open={open}
      onClose={() => {
        if (!loading) onClose()
      }}
      title={t('finalExam.selectLanguage')}
      sizeClassName="max-w-md"
    >
      <div className="space-y-3">
        {userName ? (
          <p className="m-0 text-center text-[10px] font-semibold uppercase tracking-wide text-muted">
            {userName}
          </p>
        ) : null}

        <div className="space-y-1.5">
          {EXAM_LANGS.map((lang) => {
            const selected = langId === lang.id
            return (
              <button
                key={lang.id}
                type="button"
                disabled={loading}
                onClick={() => setLangId(lang.id)}
                className="flex w-full overflow-hidden rounded-lg disabled:opacity-60"
              >
                <span className="flex w-9 shrink-0 items-center justify-center bg-deep text-[13px] font-bold text-white">
                  {lang.num}
                </span>
                <span
                  className={cn(
                    'flex flex-1 items-center justify-center border border-l-0 px-3 py-2 text-sm font-semibold transition',
                    selected
                      ? 'border-signal bg-signal-soft text-signal'
                      : 'border-mist bg-white text-signal',
                  )}
                >
                  {t(lang.labelKey)}
                </span>
              </button>
            )
          })}
        </div>

        {error ? <p className="m-0 text-[12px] text-rose">{error}</p> : null}

        <Button
          type="button"
          variant="primary"
          className="w-full"
          disabled={langId == null}
          loading={loading}
          onClick={() => {
            if (langId != null) onPickLang(langId)
          }}
        >
          <Play className="size-3.5" aria-hidden />
          {t('finalExam.startExam')}
        </Button>
      </div>
    </Modal>
  )
}

export function persistFinalExamTake(payload: {
  lang_id: number
  face: string
  tests: FinalExamQuestionItem[]
}) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    /* ignore */
  }
}

export function readFinalExamTake(): {
  lang_id: number
  face: string
  tests: FinalExamQuestionItem[]
} | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw) as {
      lang_id: number
      face: string
      tests: FinalExamQuestionItem[]
    }
  } catch {
    return null
  }
}

export function clearFinalExamTake() {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

export function useFinalExamNavigate() {
  const navigate = useNavigate()
  return (payload: {
    lang_id: number
    face: string
    tests: FinalExamQuestionItem[]
  }) => {
    persistFinalExamTake(payload)
    navigate(routes.finalExamTake, { state: payload })
  }
}

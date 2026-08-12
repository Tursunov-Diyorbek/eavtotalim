import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Play } from 'lucide-react'
import { Button, Modal, Tabs } from '@/components/ui'
import { routes } from '@/config'
import { EXAM_LANGS } from '@/features/exam-templates'
import { cn } from '@/lib/cn'
import type { RandomTestStartParams } from '@/types'

export type StartRandomTestModalProps = {
  open: boolean
  limit: 1 | 2 | 3
  userName?: string
  onClose: () => void
}

const STORAGE_KEY = 'random_test_take'

export function StartRandomTestModal({
  open,
  limit,
  userName,
  onClose,
}: StartRandomTestModalProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [langId, setLangId] = useState<number | null>(null)
  const [random, setRandom] = useState(false)

  useEffect(() => {
    if (!open) return
    setLangId(null)
    setRandom(false)
  }, [open, limit])

  const start = () => {
    if (langId == null) return
    const payload: RandomTestStartParams = {
      lang_id: langId,
      limit,
      random,
      isType: 11,
    }
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch {
      /* ignore */
    }
    navigate(routes.randomTestTake, { state: payload })
  }

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '1') setLangId(1)
      if (e.key === '2') setLangId(3)
      if (e.key === '3') setLangId(2)
      if (e.key === 'Enter' && langId != null) {
        const payload: RandomTestStartParams = {
          lang_id: langId,
          limit,
          random,
          isType: 11,
        }
        try {
          sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
        } catch {
          /* ignore */
        }
        navigate(routes.randomTestTake, { state: payload })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, langId, limit, random, navigate])

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('randomTests.selectLanguage')}
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
                onClick={() => setLangId(lang.id)}
                className="flex w-full overflow-hidden rounded-lg"
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

        <Tabs
          fullWidth
          aria-label={t('examTemplates.shuffle')}
          items={[
            { value: 'on', label: t('examTemplates.shuffleOn') },
            { value: 'off', label: t('examTemplates.shuffleOff') },
          ]}
          value={random ? 'on' : 'off'}
          onChange={(v) => setRandom(v === 'on')}
        />

        <Button
          type="button"
          variant="primary"
          className="w-full"
          disabled={langId == null}
          onClick={start}
        >
          <Play className="size-3.5" aria-hidden />
          {t('randomTests.start')}
        </Button>

        <div className="rounded-lg border border-amber/40 bg-amber-soft/40 px-3 py-2 text-center">
          <p className="m-0 text-[11px] font-bold text-amber">
            {t('randomTests.infoCount', {
              count: limit === 2 ? 50 : limit === 3 ? 100 : 20,
            })}
          </p>
          <p className="m-0 mt-0.5 text-[11px] text-amber/90">
            {t('randomTests.infoFail')}
          </p>
        </div>
      </div>
    </Modal>
  )
}

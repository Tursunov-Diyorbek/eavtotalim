import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Play } from 'lucide-react'
import { Button, Modal, Tabs } from '@/components/ui'
import { routes } from '@/config'
import { EXAM_LANGS } from '@/features/exam-templates'
import { cn } from '@/lib/cn'

export type StartExamTemplateModalProps = {
  open: boolean
  templateId: number | null
  userName?: string
  canSeeEndMode?: boolean
  /** Variantlar aralashtirish (default: true) */
  showShuffle?: boolean
  onClose: () => void
}

export function StartExamTemplateModal({
  open,
  templateId,
  userName,
  canSeeEndMode = true,
  showShuffle = true,
  onClose,
}: StartExamTemplateModalProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [langId, setLangId] = useState<number | null>(null)
  const [random, setRandom] = useState(false)
  const [answerMode, setAnswerMode] = useState<4 | 5>(4)

  useEffect(() => {
    if (!open) return
    setLangId(null)
    setRandom(false)
    setAnswerMode(4)
  }, [open, templateId])

  useEffect(() => {
    if (!open) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === '1') setLangId(1)
      if (e.key === '2') setLangId(3)
      if (e.key === '3') setLangId(2)
      if (e.key === 'ArrowLeft') setAnswerMode(4)
      if (e.key === 'ArrowRight' && canSeeEndMode) setAnswerMode(5)
      if (e.key === 'Enter' && langId != null && templateId != null) {
        const payload = {
          template_id: templateId,
          lang_id: langId,
          isType: answerMode,
          random,
        }
        try {
          sessionStorage.setItem('exam_template_take', JSON.stringify(payload))
        } catch {
          /* ignore */
        }
        navigate(routes.examTemplateTake, { state: payload })
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, langId, templateId, answerMode, random, canSeeEndMode, navigate])

  const start = () => {
    if (langId == null || templateId == null) return
    const payload = {
      template_id: templateId,
      lang_id: langId,
      isType: answerMode,
      random,
    }
    try {
      sessionStorage.setItem('exam_template_take', JSON.stringify(payload))
    } catch {
      /* ignore */
    }
    navigate(routes.examTemplateTake, { state: payload })
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('examTemplates.selectLanguage')}
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

        {showShuffle ? (
          <Tabs
            fullWidth
            aria-label={t('examTemplates.shuffle')}
            items={[
              {
                value: 'on',
                label: t('examTemplates.shuffleOn'),
              },
              {
                value: 'off',
                label: t('examTemplates.shuffleOff'),
              },
            ]}
            value={random ? 'on' : 'off'}
            onChange={(v) => setRandom(v === 'on')}
          />
        ) : null}

        <div className="space-y-1.5">
          <p className="m-0 text-center text-[10px] font-semibold uppercase tracking-wide text-muted">
            {t('examTemplates.answerMode')}
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={answerMode === 4 ? 'primary' : 'outline'}
              size="sm"
              className="flex-1"
              onClick={() => setAnswerMode(4)}
            >
              {t('examTemplates.modeLive')}
            </Button>
            {canSeeEndMode ? (
              <Button
                type="button"
                variant={answerMode === 5 ? 'primary' : 'outline'}
                size="sm"
                className="flex-1"
                onClick={() => setAnswerMode(5)}
              >
                {t('examTemplates.modeEnd')}
              </Button>
            ) : null}
          </div>
        </div>

        <Button
          type="button"
          variant="primary"
          className="w-full"
          disabled={langId == null}
          onClick={start}
        >
          <Play className="size-3.5" aria-hidden />
          {t('examTemplates.start')}
        </Button>

        <div className="rounded-lg border border-amber/40 bg-amber-soft/40 px-3 py-2 text-center">
          <p className="m-0 text-[11px] font-bold text-amber">
            {t('examTemplates.infoTickets')}
          </p>
          <p className="m-0 mt-0.5 text-[11px] text-amber/90">
            {t('examTemplates.infoFail')}
          </p>
        </div>
      </div>
    </Modal>
  )
}

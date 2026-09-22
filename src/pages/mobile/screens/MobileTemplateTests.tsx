import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Bookmark, BookmarkCheck, Play } from 'lucide-react'
import { useAuth } from '@/features/auth'
import { parsePercent, useExamTemplatesQuery } from '@/features/exam-templates'
import { StartExamTemplateModal } from '@/pages/exam-templates/StartExamTemplateModal'
import { fullNameOf } from '@/lib/format'
import { Notification } from '@/components/ui'
import { PageEmpty, PageHead, PageLoading } from '../components/PageChrome'

type Props = { onBack: () => void }

export function MobileTemplateTests({ onBack }: Props) {
  const { t } = useTranslation()
  const { me, user } = useAuth()
  const comfort = Boolean(me?.organization_has_comfort_plan)
  const { data = [], isLoading } = useExamTemplatesQuery(comfort)
  const [openId, setOpenId] = useState<number | null>(null)

  const userName =
    fullNameOf(me?.profession ?? {}) || user?.username || undefined
  const canSeeEndMode = user?.role !== 4

  return (
    <div className="sm-page">
      <PageHead title={t('nav.examTemplates')} onBack={onBack} />
      <div className="sm-page__body">
        {!comfort ? (
          <Notification tone="warning">
            {t('examTemplates.contractRequired', {
              defaultValue:
                "Tashkilotingiz shartnoma imzolamaganligi sababli bu amalni bajarib bo'lmaydi!",
            })}
          </Notification>
        ) : isLoading ? (
          <PageLoading rows={4} />
        ) : data.length === 0 ? (
          <PageEmpty text={t('examTemplates.empty')} />
        ) : (
          <div className="sm-tpl-grid">
            {data.map((item) => {
              const pct = parsePercent(
                item.exam_center_test_template_result?.max_result_percent,
              )
              const correct =
                item.exam_center_test_template_result?.correct_answers_count ||
                0
              const saved = Boolean(
                (item as { saved_test?: boolean }).saved_test,
              )
              return (
                <button
                  key={item.id}
                  type="button"
                  className="sm-tpl-card"
                  onClick={() => setOpenId(item.id)}
                >
                  <span className="sm-tpl-card__bookmark" aria-hidden>
                    {saved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                  </span>
                  <p className="sm-tpl-card__num">
                    {item.name || '—'} {t('examTemplates.template', { defaultValue: 'Shablon' })}
                  </p>
                  <div className="sm-tpl-card__ring-wrap">
                    <span className="sm-tpl-card__pct-ring">{Math.round(pct)}%</span>
                  </div>
                  <p className="sm-tpl-card__meta">
                    {t('finalExam.correct')}: <b>{correct}</b>
                  </p>
                  <p className="sm-tpl-card__meta">
                    {t('examTemplates.duration', { defaultValue: '25 daqiqa' })}
                  </p>
                  <span className="sr-only">
                    <Play size={14} />
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <StartExamTemplateModal
        open={openId != null}
        templateId={openId}
        userName={userName}
        canSeeEndMode={canSeeEndMode}
        onClose={() => setOpenId(null)}
      />
    </div>
  )
}
